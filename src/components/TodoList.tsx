// src/components/TodoList.tsx

import { useState, useEffect, useMemo, useCallback } from "react";
import { EditToDoPayload, ToDo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Minus, Moon, Sun, PartyPopper } from "lucide-react";
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
import { SortableListItem } from "./SortableListItem";
import { TagFilterButton } from "./TagFilterButton";
import { NewTodoInput } from "./NewTodoInput";
import { Notification, NotificationContainer } from "./task-added-notification";
import { v4 as uuidv4 } from 'uuid';
import { LogoLoadingSpinner } from "./LogoLoadingSpinner";
import confetti from 'canvas-confetti';

type TagCountMap = Map<string, number>;

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

function useNotifications(): NotificationState {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = uuidv4();
    setNotifications(prev => {
      const updatedNotifications = [...prev, { ...notification, id }];
      if (updatedNotifications.length > 10) {
        return updatedNotifications.slice(-10);
      }
      return updatedNotifications;
    });
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}

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
  const [groupByHashtags, setGroupByHashtags] = useState(false);
  const [deletingTodos] = useState(new Set<string>());
  const { notifications, addNotification, removeNotification } = useNotifications();
  const [showCelebration, setShowCelebration] = useState(false);

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

  const showSuccessNotification = useCallback((title: string, message: string) => {
    addNotification({
      title,
      message,
      variant: 'success'
    });
  }, [addNotification]);

  const showErrorNotification = useCallback((message: string) => {
    addNotification({
      title: 'Error',
      message,
      variant: 'error'
    });
  }, [addNotification]);

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
      showSuccessNotification('Task Added', 'Your task was successfully added');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo.todoId !== tempTodoId)
      );
      updateTagCounts([], tags);
      showErrorNotification('Failed to add task. Please try again.');
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
      addNotification({
        title: "Error",
        message: "Failed to update task. Please try again.",
        variant: "error"
      });
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
    addNotification({
      title: "Task Updated",
      message: "Your task was successfully updated",
      variant: "success"
    });
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
      addNotification({
        title: "Error",
        message: "Failed to reorder tasks. Please try again.",
        variant: "error"
      });
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
      showSuccessNotification('Task Deleted', 'Your task was successfully deleted');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setTodos(previousTodos);
      updateTagCounts(tagsToRemove);
      showErrorNotification('Failed to delete task. Please try again.');
    } finally {
      deletingTodos.delete(todoId);
    }
  };

  const toggleCompletion = async (todoId: string) => {
    const todo = todos.find((todo) => todo.todoId === todoId);
    if (!todo) return;

    try {
      await editTodo(todoId, { completed: !todo.completed });
      addNotification({
        title: todo.completed ? "Task Uncompleted" : "Task Completed",
        message: `Task marked as ${todo.completed ? "uncompleted" : "completed"}`,
        variant: "success"
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      addNotification({
        title: "Error",
        message: "Failed to update task status. Please try again.",
        variant: "error"
      });
    }
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

  const groupedTodos = useMemo(() => {
    if (!groupByHashtags) return null;

    const groups: { tag: string; todos: ToDo[] }[] = [];
    const noTagGroup: ToDo[] = [];

    const filteredTodosList = todos.filter((todo) => {
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

    // Sort todos by completion status before grouping
    const sortedTodos = [...filteredTodosList].sort(
      (a, b) => Number(a.completed) - Number(b.completed)
    );

    sortedTodos.forEach(todo => {
      const tags = extractTags(todo.text);
      if (tags.length === 0) {
        noTagGroup.push(todo);
      } else {
        tags.forEach(tag => {
          let group = groups.find(g => g.tag === tag);
          if (!group) {
            group = { tag, todos: [] };
            groups.push(group);
          }
          group.todos.push(todo);
        });
      }
    });

    // Sort groups by tag name and sort todos within each group by completion
    groups.sort((a, b) => a.tag.localeCompare(b.tag));
    groups.forEach(group => {
      group.todos.sort((a, b) => Number(a.completed) - Number(b.completed));
    });
    
    // Sort noTagGroup by completion
    noTagGroup.sort((a, b) => Number(a.completed) - Number(b.completed));

    return { groups, noTagGroup };
  }, [todos, groupByHashtags, noTagFilter, includeFilters, excludeFilters]);

  // Apply dark mode class to the root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Sort todos for the default view
  const sortedTodos = useMemo(() => {
    return [...todos]
      .filter((todo) => {
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
      })
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [todos, noTagFilter, includeFilters, excludeFilters]);

  // Calculate progress
  const progress = useMemo(() => {
    if (todos.length === 0) return 0;
    const completedCount = todos.filter(todo => todo.completed).length;
    return (completedCount / todos.length) * 100;
  }, [todos]);

  // Enhanced celebration effect
  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
    
    // Fire confetti from the left edge
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.8 }
    });

    // Fire confetti from the right edge
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.8 }
    });

    // Fire golden confetti from the middle
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.7 },
        colors: ['#FFD700', '#FDB931', '#FFED4A']
      });
    }, 250);

    setTimeout(() => setShowCelebration(false), 3000);
  }, []);

  // Check for all tasks completed
  useEffect(() => {
    if (todos.length > 0 && todos.every(todo => todo.completed)) {
      triggerCelebration();
    }
  }, [todos, triggerCelebration]);

  if (loading) return <LogoLoadingSpinner />;
  if (error) return <div>Error</div>;

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
                <Button
                  variant="ghost"
                  onClick={() => setGroupByHashtags(!groupByHashtags)}
                  className={groupByHashtags ? "bg-primary/10" : ""}
                >
                  Order by #
                </Button>
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

              {todos.length > 0 && (
                <div className="flex items-center gap-2 mt-4 mb-6">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {Math.round(progress)}% complete
                  </span>
                </div>
              )}

              {showCelebration && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                  <div className="animate-bounce-in-out">
                    <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-lg">
                      <PartyPopper className="h-6 w-6" />
                      <span className="font-medium text-lg">All tasks completed!</span>
                    </div>
                  </div>
                </div>
              )}

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
                  {groupByHashtags && groupedTodos ? (
                    <div className="space-y-6">
                      {groupedTodos.groups.map(({ tag, todos: groupTodos }) => (
                        <div key={tag}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-px flex-grow bg-border" />
                            <span className="text-sm font-medium text-muted-foreground">
                              #{tag}
                            </span>
                            <div className="h-px flex-grow bg-border" />
                          </div>
                          <SortableContext
                            items={groupTodos.map((t) => t.todoId)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {groupTodos.map((todo) => (
                                <SortableListItem
                                  key={todo.todoId}
                                  todo={todo}
                                  index={groupTodos.indexOf(todo)}
                                  todoCount={todos.length}
                                  isEditing={editingId === todo.todoId}
                                  editText={editText}
                                  onEditChange={setEditText}
                                  onStartEditing={startEditing}
                                  onSaveEdit={saveEdit}
                                  onCancelEditing={cancelEditing}
                                  onDelete={deleteTodo}
                                  onToggleCompletion={toggleCompletion}
                                  onReorder={reorderTodo}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </div>
                      ))}
                      {groupedTodos.noTagGroup.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-px flex-grow bg-border" />
                            <span className="text-sm font-medium text-muted-foreground">
                              No Tags
                            </span>
                            <div className="h-px flex-grow bg-border" />
                          </div>
                          <SortableContext
                            items={groupedTodos.noTagGroup.map((t) => t.todoId)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {groupedTodos.noTagGroup.map((todo) => (
                                <SortableListItem
                                  key={todo.todoId}
                                  todo={todo}
                                  index={groupedTodos.noTagGroup.indexOf(todo)}
                                  todoCount={todos.length}
                                  isEditing={editingId === todo.todoId}
                                  editText={editText}
                                  onEditChange={setEditText}
                                  onStartEditing={startEditing}
                                  onSaveEdit={saveEdit}
                                  onCancelEditing={cancelEditing}
                                  onDelete={deleteTodo}
                                  onToggleCompletion={toggleCompletion}
                                  onReorder={reorderTodo}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </div>
                      )}
                    </div>
                  ) : (
                    <SortableContext
                      items={todos.map((t) => t.todoId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sortedTodos.map((todo) => (
                          <SortableListItem
                            key={todo.todoId}
                            todo={todo}
                            index={todos.indexOf(todo)}
                            todoCount={todos.length}
                            isEditing={editingId === todo.todoId}
                            editText={editText}
                            onEditChange={setEditText}
                            onStartEditing={startEditing}
                            onSaveEdit={saveEdit}
                            onCancelEditing={cancelEditing}
                            onDelete={deleteTodo}
                            onToggleCompletion={toggleCompletion}
                            onReorder={reorderTodo}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
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
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
};

export default TodoList;
