"use client";
import { cn } from "@/lib/utils";
import { File, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type TodoListProps = {
  items: Array<{
    uuid: string;
    title: string;
    tags?: string[];
    project?: string;
    area?: string;
    carriedOver?: number;
    hasNotes?: boolean;
    highlighted?: boolean;
  }>;
};

export function TodoList(props: TodoListProps) {
  const dimmedIconClasses = "opacity-30 shrink-0";

  return (
    <div className="flex flex-col gap-1">
      {props.items.map((item) => (
        <div
          key={item.uuid}
          className={cn(
            "flex gap-2 items-center rounded-md px-2 py-1",
            item.highlighted && "bg-primary/10 dark:bg-primary/30",
          )}
        >
          <Square size={14} className={dimmedIconClasses} />
          <div className="shrink overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="text-sm truncate">{item.title}</p>
              {item.hasNotes && (
                <File size={12} className={dimmedIconClasses} />
              )}
              {item.tags &&
                item.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-muted-foreground shrink-0"
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
            {item.project || item.area ? (
              <p className="text-xs text-muted-foreground">
                {item.project || item.area}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
