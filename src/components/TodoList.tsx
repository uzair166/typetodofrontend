// src/components/TodoList.tsx

import { useState, useEffect, useMemo } from "react";
import { EditToDoPayload, ToDo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Minus, Moon, Sun } from "lucide-react";
import { useApi } from "@/api";
import { UserButton } from "@clerk/clerk-react";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { extractTags } from "@/lib/utils";
import { SortableListItem } from "./SortabeListItem";
import { TagFilterButton } from "./TagFilterButton";
import { NewTodoInput } from "./NewTodoInput";

type TagCountMap = Map<string, number>;

const getFilterIcon = (filter: boolean | null) => {
  if (filter === true) {
    return <Check className="h-3 w-3" />;
  } else if (filter === false) {
    return <Minus className="h-3 w-3" />;
  } else {
    return null;
  }
};

const TodoList = () => {
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagCounts, setTagCounts] = useState<TagCountMap>(new Map());
  const [includeFilters, setIncludeFilters] = useState<Set<string>>(new Set());
  const [excludeFilters, setExcludeFilters] = useState<Set<string>>(new Set());
  const [noTagFilter, setNoTagFilter] = useState<boolean | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [deletingTodos] = useState(new Set<string>());

  const api = useApi();
  const allTags = useMemo(() => Array.from(tagCounts.keys()), [tagCounts]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get("/todos");
        setTodos(response.data.todos);
        const initialTagCounts: TagCountMap = new Map();
        response.data.todos.forEach((todo: ToDo) => {
          extractTags(todo.text).forEach((tag) => {
            initialTagCounts.set(tag, (initialTagCounts.get(tag) || 0) + 1);
          });
        });
        setTagCounts(initialTagCounts);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to load to-dos");
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [api]);

  const toggleTheme = () => {
    setDarkMode((prevDarkMode) => {
      const newDarkMode = !prevDarkMode;
      localStorage.setItem("darkMode", newDarkMode.toString());
      return newDarkMode;
    });
  };

  const toggleFilter = (tag: string) => {
    setIncludeFilters((prevInclude) => {
      setNoTagFilter(null);
      const newInclude = new Set(prevInclude);
      if (newInclude.has(tag)) {
        newInclude.delete(tag);
        setExcludeFilters((prevExclude) => new Set(prevExclude).add(tag));
      } else {
        setExcludeFilters((prevExclude) => {
          const newExclude = new Set(prevExclude);
          if (prevExclude.has(tag)) {
            newExclude.delete(tag);
          } else {
            newInclude.add(tag);
          }
          return newExclude;
        });
      }
      return newInclude;
    });
  };

  const toggleNoTagFilter = () => {
    setIncludeFilters(new Set());
    setExcludeFilters(new Set());
    setNoTagFilter((prev) => {
      if (prev === null) return true;
      if (prev === true) return false;
      return null;
    });
  };

  const updateTagCounts = (
    tagsToAdd: string[],
    tagsToRemove: string[] = []
  ) => {
    setTagCounts((prevCounts) => {
      const newCounts = new Map(prevCounts);
      tagsToAdd.forEach((tag) => {
        newCounts.set(tag, (newCounts.get(tag) || 0) + 1);
      });
      tagsToRemove.forEach((tag) => {
        const count = newCounts.get(tag);
        if (count !== undefined) {
          if (count > 1) {
            newCounts.set(tag, count - 1);
          } else {
            newCounts.delete(tag);
          }
        }
      });
      return newCounts;
    });
  };

  const addTodo = async (text: string) => {
    const tags = extractTags(text);
    const tempTodoId = Date.now().toString();
    const newTodo: ToDo = {
      todoId: tempTodoId,
      text,
      tags,
      completed: false,
      order: todos.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTodos((prevTodos) => [...prevTodos, newTodo]);
    updateTagCounts(tags);

    try {
      const response = await api.post("/todos", { text, tags });
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.todoId === tempTodoId ? response.data.todo : todo
        )
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo.todoId !== tempTodoId)
      );
      updateTagCounts([], tags);
      setError("Failed to add to-do");
    }
  };

  const editTodo = async (todoId: string, updates: EditToDoPayload) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.todoId === todoId ? { ...todo, ...updates } : todo
      )
    );

    try {
      await api.put(`/todos/${todoId}`, updates);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setTodos((prevTodos) => [...prevTodos]);
      setError("Failed to edit to-do");
    }
  };

  const saveEdit = async (todoId: string) => {
    if (editText.trim() === "") return;

    const oldTodo = todos.find((todo) => todo.todoId === todoId);
    if (!oldTodo) return;

    const oldTags = oldTodo.tags;
    const newTags = extractTags(editText);

    const updates: EditToDoPayload = { text: editText, tags: newTags };

    editTodo(todoId, updates);
    setEditingId(null);
    setEditText("");
    updateTagCounts(newTags, oldTags);
  };

  const reorderTodo = async (todoId: string, newPosition: number) => {
    const updatedTodos = arrayMove(
      todos,
      todos.findIndex((todo) => todo.todoId === todoId),
      newPosition
    );

    const reorderedTodos = updatedTodos.map((todo, index) => ({
      ...todo,
      order: index,
    }));
    setTodos(reorderedTodos);

    try {
      await api.put(`/todos/reorder/${todoId}`, { newPosition });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setTodos(todos);
      setError("Failed to reorder to-dos");
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (deletingTodos.has(todoId)) return;

    const previousTodos = [...todos];
    const todoToDelete = todos.find((todo) => todo.todoId === todoId);
    if (!todoToDelete) return;

    deletingTodos.add(todoId);

    const tagsToRemove = extractTags(todoToDelete.text);
    updateTagCounts([], tagsToRemove);

    setTodos((prevTodos) => prevTodos.filter((todo) => todo.todoId !== todoId));

    try {
      await api.delete(`/todos/${todoId}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setTodos(previousTodos);
      updateTagCounts(tagsToRemove);
      setError("Failed to delete to-do");
    } finally {
      deletingTodos.delete(todoId);
    }
  };

  const toggleCompletion = async (todoId: string) => {
    const todo = todos.find((todo) => todo.todoId === todoId);
    if (!todo) return;

    await editTodo(todoId, { completed: !todo.completed });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const newIndex = todos.findIndex((todo) => todo.todoId === over?.id);

      reorderTodo(active.id as string, newIndex);
    }
  };

  const startEditing = (todoId: string, text: string) => {
    setEditingId(todoId);
    setEditText(text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const todosWithCompletedAtTheEnd = useMemo(() => {
    return todos
      .slice()
      .sort((a, b) => Number(b.completed) - Number(a.completed));
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todosWithCompletedAtTheEnd.filter((todo) => {
      const hasNoTags = todo.tags.length === 0;

      if (noTagFilter !== null) {
        if (noTagFilter && !hasNoTags) return false;
        if (!noTagFilter && hasNoTags) return false;
        return true;
      }

      if (
        includeFilters.size > 0 &&
        !todo.tags.some((tag) => includeFilters.has(tag))
      ) {
        return false;
      }
      if (todo.tags.some((tag) => excludeFilters.has(tag))) {
        return false;
      }
      return true;
    });
  }, [todosWithCompletedAtTheEnd, noTagFilter, includeFilters, excludeFilters]);

  const reversedFilteredTodos = useMemo(() => {
    return filteredTodos.toReversed();
  }, [filteredTodos]);

  // Apply dark mode class to the root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // ignore: test data
  // useEffect(() => {
  //   setTodos([
  //     {
  //       todoId: "1",
  //       text: "Test",
  //       tags: ["test"],
  //       completed: false,
  //       order: 0,
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString(),
  //     },
  //   ]);
  // }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted dark:from-zinc-900 dark:to-zinc-800 transition-colors duration-300">
        <div className="container mx-auto p-4 max-w-6xl">
          <Card className="mt-8 shadow-xl dark:bg-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold dark:text-white">
                TypeTodo
              </CardTitle>
              <div className="flex items-center space-x-2">
                <UserButton />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="dark:text-zinc-300 dark:hover:text-white"
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <NewTodoInput addTodo={addTodo} />

              <div className="flex flex-wrap gap-2 mb-4">
                {allTags.map((tag) => {
                  return (
                    <TagFilterButton
                      key={tag}
                      tag={tag}
                      filter={
                        includeFilters.has(tag)
                          ? true
                          : excludeFilters.has(tag)
                          ? false
                          : null
                      }
                      toggleFilter={toggleFilter}
                    />
                  );
                })}
                {allTags.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleNoTagFilter}
                    className={`flex items-center space-x-1 hover:scale-105 transition-all duration-300 
                      ${noTagFilter && "border-2 border-white"} 
                      ${noTagFilter === false && "opacity-50 line-through"}`}
                  >
                    <span>No tags</span>
                    {getFilterIcon(noTagFilter)}
                  </Button>
                )}
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={todos.map((todo) => todo.todoId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-2">
                      {reversedFilteredTodos.map((todo, index) => (
                        <SortableListItem
                          key={todo.todoId}
                          index={index}
                          todo={todo}
                          todoCount={todos.length}
                          onToggleCompletion={toggleCompletion}
                          onDelete={deleteTodo}
                          onReorder={reorderTodo}
                          isEditing={editingId === todo.todoId}
                          editText={editText}
                          onEditChange={setEditText}
                          onStartEditing={startEditing}
                          onSaveEdit={saveEdit}
                          onCancelEditing={cancelEditing}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>

                {todos.length === 0 && (
                  <p className="text-center text-muted-foreground dark:text-zinc-400 mt-8">
                    Your task list is empty. Add a task to get started!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
