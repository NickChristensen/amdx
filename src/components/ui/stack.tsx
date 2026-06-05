import * as React from "react";
import { cn } from "@/lib/utils";

/* smh tailwind

  align-start align-center align-end align-stretch
  justify-start justify-center justify-end justify-between justify-around
  gap-1 gap-2 gap-3 gap-4 gap-5 gap-6 gap-8 gap-10 gap-12 gap-16 gap-20 gap-24 gap-32 gap-40 gap-48 gap-56 gap-64

*/

export const Stack = ({
  className,
  gap = 2,
  align = "start",
  justify = "start",
  direction = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  gap?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  direction?: "horizontal" | "vertical";
}) => {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={cn(
        "flex *:flex-1",
        isHorizontal ? "flex-row flex-wrap" : "flex-col",
        `gap-${gap}`,
        `items-${align}`,
        `justify-${justify}`,
        className,
      )}
      {...props}
    />
  );
};
