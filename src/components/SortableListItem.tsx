// src/components/SortableListItem.tsx
import { ToDo } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronsUp,
  GripVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { getTagColor } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";

const TextWithTags: React.FC<{ sentence: string; tags: string[] }> = ({
  sentence,
  tags,
}) => {
  // Create a Set for O(1) lookup time for tags
  const tagSet = new Set(tags.map((tag) => `#${tag}`));

  // Split the sentence by spaces
  const words = sentence.split(" ");

  return (
    <>
      {words.map((word, index) => {
        if (tagSet.has(word)) {
          return (
            <span
              key={index}
              className={`font-semibold ${getTagColor(word.substring(1))}`}
            >
              {word}{" "}
            </span>
          );
        }
        return <span key={index}>{word} </span>;
      })}
    </>
  );
};

interface SortableListItemProps {
  index: number;
  todo: ToDo;
  todoCount: number;
  onToggleCompletion: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, newPosition: number) => void;
  isEditing: boolean;
  editText: string;
  onEditChange: (value: string) => void;
  onStartEditing: (id: string, text: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEditing: () => void;
}

export const SortableListItem: React.FC<SortableListItemProps> = ({
  index,
  todo,
  todoCount,
  onToggleCompletion,
  onDelete,
  onReorder,
  isEditing,
  editText,
  onEditChange,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: todo.todoId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
        index % 2 === 0
          ? "bg-muted/50 dark:bg-zinc-700/50"
          : "bg-background dark:bg-zinc-800"
      } hover:bg-muted/80 dark:hover:bg-zinc-700 group`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="cursor-move dark:text-zinc-400"
        aria-label="Drag to reorder"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggleCompletion(todo.todoId)}
        id={`todo-${todo.todoId}`}
        // className="data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:border-zinc-600"
      />

      {isEditing ? (
        <div className="flex-grow flex items-center space-x-2">
          <Input
            type="text"
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                onSaveEdit(todo.todoId);
              }
            }}
            className="flex-grow dark:bg-gray-700 dark:text-white"
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => onSaveEdit(todo.todoId)}
            className="dark:bg-gray-600 dark:text-white"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancelEditing}
            className="dark:border-gray-600 dark:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <label
            htmlFor={`todo-${todo.todoId}`}
            className={`flex-grow text-sm sm:text-base ${
              todo.completed
                ? "line-through text-muted-foreground dark:text-zinc-500"
                : "dark:text-white"
            }`}
          >
            <TextWithTags sentence={todo.text} tags={todo.tags} />
          </label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStartEditing(todo.todoId, todo.text)}
            className="opacity-0 group-hover:opacity-100 transition-opacity dark:text-gray-400"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity dark:text-gray-400"
            aria-label="Move to top"
            onClick={() => onReorder(todo.todoId, todoCount - 1)}
          >
            <ChevronsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.todoId)}
            className="opacity-0 group-hover:opacity-100 transition-opacity dark:text-gray-400"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete task</span>
          </Button>
        </>
      )}
    </li>
  );
};
