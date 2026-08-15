import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";

export type MetricProps = {
  /** Short label that identifies the value. */
  label: string;

  /** Main value, already formatted for display. */
  value: string;

  /** Change relative to the comparison period. */
  change?: string;

  /** Semantic direction used to style the change indicator. */
  changeType?: "positive" | "negative" | "neutral";

  /** Text shown immediately before the value. */
  prefix?: string;

  /** Text shown immediately after the value. */
  suffix?: string;
};

export const metricMdxDocs = {
  description:
    "Displays one important value with a label and optional change context.",
  flow: "block",
  defaults: {
    changeType: "neutral",
  },
  guidance: [
    "Format the value for display before passing it to the component.",
    "Use changeType only when the direction has a clear meaning.",
  ],
  examples: [
    {
      title: "Basic metric",
      mdx: '<Metric label="Revenue" value="$42,000" />',
    },
    {
      title: "Metric with change",
      mdx: `<Metric
  label="Monthly active users"
  value="18,420"
  change="+12%"
  changeType="positive"
/>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<MetricProps>;

function BlankIcon() {
  return null;
}

export function Metric(props: MetricProps) {
  const changeType = props.changeType ?? metricMdxDocs.defaults.changeType;
  const changeClass =
    changeType === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : changeType === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  const ChangeIcon =
    changeType === "positive"
      ? TrendingUp
      : changeType === "negative"
        ? TrendingDown
        : BlankIcon;

  return (
    <div className="min-w-0 space-y-1">
      <div className="truncate text-sm text-muted-foreground">
        {props.label}
      </div>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="min-w-0 text-xl font-semibold tracking-normal tabular-nums">
          {props.prefix}
          {props.value}
          {props.suffix}
        </span>
        {props.change && (
          <span className={cn("text-sm font-medium tabular-nums", changeClass)}>
            <ChangeIcon className="inline-block" size="1em" />{" "}
            {props.change.replace(/^[+-]/, "")}
          </span>
        )}
      </div>
    </div>
  );
}
