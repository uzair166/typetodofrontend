import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus } from "lucide-react";

export const NewTodoInput = ({
  addTodo,
}: {
  addTodo: (text: string) => void;
}) => {
  const [newTodoText, setNewTodoText] = useState("");

  return (
    <div className="flex space-x-2 mb-6">
      <Input
        type="text"
        placeholder="Add a new task..."
        value={newTodoText}
        onChange={(e) => setNewTodoText(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter" && newTodoText.trim()) {
            addTodo(newTodoText);
            setNewTodoText("");
          }
        }}
        className="flex-grow dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
      />
      <Button
        onClick={() => {
          if (newTodoText.trim()) {
            addTodo(newTodoText);
            setNewTodoText("");
          }
        }}
        size="default"
        className="px-3 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
      >
        <Plus className="h-5 w-5" />
        <span className="sr-only">Add task</span>
      </Button>
    </div>
  );
};
