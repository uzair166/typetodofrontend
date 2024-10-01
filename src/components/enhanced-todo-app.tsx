import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  GripVerticalIcon,
  SunIcon,
  MoonIcon,
  HelpCircle,
  ArrowUpIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tutorial } from "@/lib/Tutorial";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { HomePageComponent } from "./home-page";
import { useApi } from "@/api";

type Todo = {
  _id: string;
  text: string;
  completed: boolean;
  hashtags: string[];
  completedAt?: Date;
};

type FilterType = "include" | "exclude" | null;

const hashtagColors = [
  // Reds
  "text-red-500",
  "text-red-700",
  // Pinks
  "text-pink-500",
  "text-pink-700",
  // Purples
  "text-purple-500",
  "text-purple-700",
  // Deep Purples
  "text-indigo-500",
  "text-indigo-700",
  // Blues
  "text-blue-500",
  "text-blue-700",
  // Light Blues
  "text-sky-500",
  "text-sky-700",
  // Cyans
  "text-cyan-500",
  "text-cyan-700",
  // Teals
  "text-teal-500",
  "text-teal-700",
  // Greens
  "text-green-500",
  "text-green-700",
  // Light Greens
  "text-lime-500",
  "text-lime-700",
  // Yellows
  "text-yellow-500",
  "text-yellow-700",
  // Ambers
  "text-amber-500",
  "text-amber-700",
  // Oranges
  "text-orange-500",
  "text-orange-700",
  // Deep Oranges
  "text-rose-500",
  "text-rose-700",
  // Browns
  "text-stone-500",
  "text-stone-700",
  // Greys
  "text-zinc-500",
  "text-zinc-700",
];

const getTagColor = (tag: string) => {
  const hash = tag.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % hashtagColors.length;
  return hashtagColors[index];
};

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [previousTodos, setPreviousTodos] = useState<Todo[]>([]);
  const api = useApi();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get("/todos");
        setTodos(response.data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    if (isSignedIn) {
      fetchTodos();
    }
  }, [api, isSignedIn]);

  const updateTodos = useCallback(
    (newTodos: Todo[] | ((prevTodos: Todo[]) => Todo[])) => {
      setPreviousTodos(todos);
      setTodos(newTodos);
    },
    [todos]
  );

  const addTodo = useCallback(
    async (text: string) => {
      const tempId = Date.now().toString();
      const newTodo: Todo = {
        _id: tempId,
        text,
        completed: false,
        hashtags: text.match(/#\w+/g) || [],
      };

      updateTodos((prevTodos) => [newTodo, ...prevTodos]);

      try {
        const response = await api.post("/todos", { text });
        const serverTodo = response.data;
        updateTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === tempId ? serverTodo : todo))
        );
        return serverTodo;
      } catch (error) {
        console.error("Error adding todo:", error);
        updateTodos((prevTodos) =>
          prevTodos.filter((todo) => todo._id !== tempId)
        );
      }
    },
    [api, updateTodos]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      updateTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      try {
        const todoToUpdate = todos.find((todo) => todo._id === id);
        if (!todoToUpdate) return;

        const response = await api.put(`/todos/${id}`, {
          completed: !todoToUpdate.completed,
        });
        const updatedTodo = response.data;

        updateTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === id ? updatedTodo : todo))
        );
      } catch (error) {
        console.error("Error toggling todo:", error);
        // Revert the change if the API call fails
        updateTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo._id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      }
    },
    [api, todos, updateTodos]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      const todoToDelete = todos.find((todo) => todo._id === id);
      updateTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));

      try {
        await api.delete(`/todos/${id}`);
      } catch (error) {
        console.error("Error deleting todo:", error);
        // Revert the change if the API call fails
        if (todoToDelete) {
          updateTodos((prevTodos) => [...prevTodos, todoToDelete]);
        }
      }
    },
    [api, todos, updateTodos]
  );

  const moveTodo = useCallback(
    async (activeId: string, overId: string) => {
      const oldIndex = todos.findIndex((t) => t._id === activeId);
      const newIndex = todos.findIndex((t) => t._id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newTodos = [...todos];
      const [movedItem] = newTodos.splice(oldIndex, 1);
      newTodos.splice(newIndex, 0, movedItem);

      updateTodos(newTodos);

      try {
        await api.post("/todos/reorder", {
          newOrder: newTodos.map((todo) => todo._id),
        });
      } catch (error) {
        console.error("Error reordering todos:", error);
        // Revert the change if the API call fails
        updateTodos(todos);
      }
    },
    [api, todos, updateTodos]
  );

  const moveToTop = useCallback(
    async (id: string) => {
      const todoToMove = todos.find((todo) => todo._id === id);
      if (!todoToMove) return;

      const newTodos = [todoToMove, ...todos.filter((todo) => todo._id !== id)];
      updateTodos(newTodos);

      try {
        await api.post("/todos/reorder", {
          newOrder: newTodos.map((todo) => todo._id),
        });
      } catch (error) {
        console.error("Error moving todo to top:", error);
        // Revert the change if the API call fails
        updateTodos(todos);
      }
    },
    [api, todos, updateTodos]
  );

  const undoLastAction = useCallback(() => {
    if (previousTodos.length > 0) {
      setTodos(previousTodos);
      setPreviousTodos([]);
    }
  }, [previousTodos]);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    moveTodo,
    moveToTop,
    undoLastAction,
    canUndo: previousTodos.length > 0,
  };
};

const useFilters = () => {
  const [filters, setFilters] = useState<Record<string, FilterType>>({});

  const toggleFilter = useCallback((tag: string) => {
    setFilters((prevFilters) => {
      const currentFilter = prevFilters[tag];
      if (currentFilter === "include") {
        return { ...prevFilters, [tag]: "exclude" };
      } else if (currentFilter === "exclude") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [tag]: _, ...rest } = prevFilters;
        return rest;
      } else {
        return { ...prevFilters, [tag]: "include" };
      }
    });
  }, []);

  return { filters, toggleFilter };
};

const DraggableTodoItem: React.FC<{
  todo: Todo;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  moveToTop: (id: string) => void;
  highlightHashtags: (text: string) => React.ReactNode;
}> = React.memo(
  ({ todo, toggleTodo, deleteTodo, moveToTop, highlightHashtags }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: todo._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="flex items-center text-sm justify-between bg-white dark:bg-zinc-800 rounded-lg shadow-sm px-4 py-2 hover:shadow-md transition-shadow transform transition-transform duration-150"
      >
        <div className="flex items-center flex-grow mr-4">
          <button
            onClick={() => toggleTodo(todo._id)}
            className="mr-3 text-zinc-400 dark:text-zinc-300 hover:text-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full transition-colors"
            aria-label={
              todo.completed ? "Mark as incomplete" : "Mark as complete"
            }
          >
            {todo.completed ? (
              <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-5 h-5 border-2 border-current rounded-full" />
            )}
          </button>
          <span
            className={`flex-grow ${
              todo.completed
                ? "line-through text-zinc-500 dark:text-zinc-400"
                : "text-zinc-700 dark:text-zinc-200"
            }`}
          >
            {highlightHashtags(todo.text)}
          </span>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => moveToTop(todo._id)}
            className="text-zinc-400 dark:text-zinc-300 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors mr-2"
            aria-label="Move to top"
          >
            <ArrowUpIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => deleteTodo(todo._id)}
            className="text-zinc-400 dark:text-zinc-300 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1 transition-colors mr-2"
            aria-label="Delete task"
          >
            <XIcon className="w-5 h-5" />
          </button>
          <div
            {...listeners}
            className="cursor-move text-zinc-400 dark:text-zinc-300"
            aria-label="Drag to reorder"
          >
            <GripVerticalIcon className="w-5 h-5" />
          </div>
        </div>
      </li>
    );
  }
);

DraggableTodoItem.displayName = "DraggableTodoItem";

export function EnhancedTodoAppComponent() {
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    moveTodo,
    moveToTop,
    undoLastAction,
  } = useTodos();
  const { filters, toggleFilter } = useFilters();

  const [inputValue, setInputValue] = useState("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth(); // Add this line

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem("hasSeenTutorial", "true");
    }
  }, []);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const addTodoHandler = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      addTodo(inputValue);
      setInputValue("");
    }
  };

  const allHashtags = useMemo(() => {
    const tags = new Set<string>();
    todos.forEach((todo) => todo.hashtags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) =>
      Object.entries(filters).every(([tag, filterType]) => {
        if (filterType === "include" && !todo.hashtags.includes(tag)) {
          return false;
        }
        if (filterType === "exclude" && todo.hashtags.includes(tag)) {
          return false;
        }
        return true;
      })
    );
  }, [todos, filters]);

  const highlightHashtags = useCallback(
    (text: string) => {
      const words = text.split(/(\s+)/);
      return words.map((word, index) => {
        if (word.startsWith("#")) {
          const tag = word.slice(1);
          return (
            <span key={index} className={`${getTagColor(tag)} font-medium`}>
              {word}
            </span>
          );
        }
        return word;
      });
    },
    [getTagColor]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undoLastAction();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undoLastAction]);

  const totalTasks = todos.length;
  const completedTasks = todos.filter((todo) => todo.completed).length;
  const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      moveTodo(active.id as string, over?.id as string);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
        <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              TypeToDo
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowTutorial(true);
                  setTutorialStep(0);
                }}
                className="text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-100 transition-colors"
                title="Show Tutorial"
                aria-label="Show Tutorial"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-100 transition-colors"
                title="Toggle Dark Mode"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </header>

        <main className="flex-grow container max-w-4xl mx-auto p-4">
          <SignedIn>
            <form onSubmit={addTodoHandler} className="mb-4">
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-grow px-4 py-2 rounded-l-md border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  aria-label="New task input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-r-md bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 h-[42px] flex items-center justify-center"
                  aria-label="Add task"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </form>

            {allHashtags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {allHashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilter(tag)}
                    className={`${getTagColor(
                      tag
                    )} bg-white dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
                      filters[tag] === "include"
                        ? "ring-2 ring-offset-2 ring-violet-500"
                        : filters[tag] === "exclude"
                        ? "opacity-50 line-through"
                        : ""
                    }`}
                    aria-label={`Filter by ${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                  Tasks
                </h2>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {completedTasks}/{totalTasks} tasks completed
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-3">
                <div
                  style={{ width: `${completionRate}%` }}
                  className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-width duration-300"
                  role="progressbar"
                  aria-valuenow={completionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredTodos.map((todo) => todo._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {filteredTodos.map((todo) => (
                      <DraggableTodoItem
                        key={todo._id}
                        todo={todo}
                        toggleTodo={toggleTodo}
                        deleteTodo={deleteTodo}
                        moveToTop={moveToTop}
                        highlightHashtags={highlightHashtags}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </section>
          </SignedIn>
          <SignedOut>
            <HomePageComponent />
          </SignedOut>
        </main>

        <footer className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
            <p>&copy; 2023 TypeToDo. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md font-mono text-sm">
                /
              </span>
              <span>Focus on new task input</span>
              <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md font-mono text-sm">
                Ctrl+Z
              </span>
              <span>Undo last action</span>
            </div>
          </div>
        </footer>

        {isSignedIn && showTutorial && (
          <Tutorial
            setShowTutorial={setShowTutorial}
            tutorialStep={tutorialStep}
            setTutorialStep={setTutorialStep}
          />
        )}
      </div>
    </div>
  );
}
