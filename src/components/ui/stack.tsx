import * as React from "react";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { cn } from "@/lib/utils";

/* smh tailwind

  align-start align-center align-end align-stretch
  justify-start justify-center justify-end justify-between justify-around
  gap-1 gap-2 gap-3 gap-4 gap-5 gap-6 gap-8 gap-10 gap-12 gap-16 gap-20 gap-24 gap-32 gap-40 gap-48 gap-56 gap-64

*/

export type StackProps = React.ComponentProps<"div"> & {
  /** Spacing between child elements, using the project's Tailwind gap scale. */
  gap?: number;

  /** Cross-axis alignment for child elements. */
  align?: "start" | "center" | "end" | "stretch";

  /** Main-axis distribution for child elements. */
  justify?: "start" | "center" | "end" | "between" | "around";

  /**
   * Give each direct child an equal flex share in the wrapping row from the
   * `sm` breakpoint upward. On small screens, each child falls back to a
   * full-width column.
   */
  flexItems?: boolean;
};

export const stackMdxDocs = {
  description:
    "Arranges peer components in a wrapping row. Use for compact items such as buttons and badges, or enable flexItems to give cards and metrics equal widths. On small screens, flexItems falls back to a full-width column.",
  flow: "block",
  defaults: {
    gap: 2,
    align: "start",
    justify: "start",
    flexItems: false,
  },
  guidance: [
    "Use without flexItems for compact peer items such as buttons, badges, or inline controls. Children wrap when the row runs out of space.",
    "Use flexItems for peer cards or metrics that should share equal widths in a wrapping row from the sm breakpoint upward. On small screens, flexItems falls back to a full-width column.",
    "Use ordinary MDX flow for vertical content.",
  ],
  examples: [
    {
      title: "Compact wrapping row",
      mdx: `<Stack gap={2} align="center">
  <Badge>First item</Badge>
  <Badge>Second item</Badge>
</Stack>`,
    },
    {
      title: "Responsive equal-width metrics",
      mdx: `<Stack gap={4} flexItems>
  <Metric label="Monthly revenue" value="$42,000" change="+8%" changeType="positive" />
  <Metric label="Active users" value="18,420" change="+12%" changeType="positive" />
</Stack>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<StackProps>;

export const Stack = ({
  className,
  gap = stackMdxDocs.defaults.gap,
  align = stackMdxDocs.defaults.align,
  justify = stackMdxDocs.defaults.justify,
  flexItems = stackMdxDocs.defaults.flexItems,
  ...props
}: StackProps) => {
  return (
    <div
      className={cn(
        "flex",
        flexItems
          ? "flex-col *:w-full sm:flex-row sm:flex-wrap sm:*:w-auto sm:*:flex-1"
          : "flex-row flex-wrap",
        `gap-${gap}`,
        `items-${align}`,
        `justify-${justify}`,
        className,
      )}
      {...props}
    />
  );
};
