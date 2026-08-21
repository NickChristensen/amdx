"use client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { File, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";

export type TodoListItemProps = {
  /** Stable Things UUID used as the React key; do not substitute an array index or title. */
  uuid: string;

  /** Things todo title shown in the list. */
  title: string;

  /** Things tags attached to the todo, shown as outline badges; preserve semantic or emoji tags such as `🚙 Errands`. */
  tags?: string[];

  /** Things project title shown below the todo; it takes precedence over area in the display. */
  project?: string;

  /** Things area title shown below the todo only when project is absent. */
  area?: string;

  /** Whether the Things todo has non-empty notes; the card shows only a note icon, not the note text. */
  hasNotes?: boolean;

  /** Agent-facing presentation flag that gives the todo row a tinted background; it is not a Things status or priority. */
  highlighted?: boolean;
};

export type TodoListProps = {
  /** Things todo records, commonly from sitrep's Today or a Things search, to render in the card. */
  items: TodoListItemProps[];
};

export const todoListCardMdxDocs = {
  description:
    "Renders Things todos as compact rows with tags and project or area context. Use to show an actionable task list from Things.",
  flow: "block",
  defaults: {},
  guidance: [
    "Pass the real Things UUID in uuid for every item; it is used as the React key and should not be replaced with an index.",
    "Map Things tags, project, area, and note presence directly when adapting sitrep data; project is displayed instead of area when both exist.",
    "Set highlighted only for presentation emphasis; it does not change the Things todo.",
    "Use an empty items array when an empty todo state is useful in the report.",
  ],
  examples: [
    {
      title: "Basic todo list",
      mdx: `<TodoListCard
  items={[
    { uuid: "plan-report", title: "Plan the weekly report", tags: ["Work"], project: "AMDX" },
    { uuid: "send-update", title: "Send the update", hasNotes: true },
  ]}
/>`,
    },
    {
      title: "Empty todo list",
      mdx: "<TodoListCard items={[]} />",
    },
  ],
} as const satisfies AgentMdxComponentDocs<TodoListProps>;

export function TodoListCard(props: TodoListProps) {
  const dimmedIconClasses = "opacity-30 shrink-0";

  return (
    <Card>
      <CardContent>
        <div className="-mx-(--todo-item-px) -my-(--todo-item-py) flex flex-col gap-1 [--todo-item-px:--spacing(2)] [--todo-item-py:--spacing(1)]">
          {props.items.map((item) => (
            <div
              key={item.uuid}
              className={cn(
                "flex gap-2 items-center rounded-md px-(--todo-item-px) py-(--todo-item-py)",
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
      </CardContent>
    </Card>
  );
}
