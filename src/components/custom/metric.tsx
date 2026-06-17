import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export type MetricProps = {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  prefix?: string;
  suffix?: string;
};

function BlankIcon() {
  return null;
}

export function Metric(props: MetricProps) {
  const changeClass =
    props.changeType === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : props.changeType === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  const ChangeIcon =
    props.changeType === "positive"
      ? TrendingUp
      : props.changeType === "negative"
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
