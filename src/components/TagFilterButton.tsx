import { getBorderColor, getTagColor } from "@/lib/utils";
import { Button } from "./ui/button";
import { Check, Minus } from "lucide-react";

const getFilterIcon = (filter: boolean | null) => {
  if (filter === true) {
    return <Check className="h-3 w-3" />;
  } else if (filter === false) {
    return <Minus className="h-3 w-3" />;
  } else {
    return null;
  }
};

export const TagFilterButton = ({
  tag,
  filter,
  toggleFilter,
}: {
  tag: string;
  filter: boolean | null;
  toggleFilter: (tag: string) => void;
}) => {
  return (
    <Button
      key={tag}
      variant="outline"
      size="sm"
      onClick={() => toggleFilter(tag)}
      className={`flex items-center space-x-1 hover:scale-105 transition-all duration-300 
        hover:${getTagColor(tag)}
        ${getTagColor(tag)} 
      ${
        filter === true
          ? `border-2 ${getBorderColor(tag)}`
          : filter === false
          ? "opacity-50 line-through"
          : ""
      }`}
    >
      <span>#{tag}</span>
      {getFilterIcon(filter)}
    </Button>
  );
};
