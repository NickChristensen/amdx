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

  /** Direction in which child elements are laid out. */
  direction?: "horizontal" | "vertical";

  /** Give each direct child an equal flex share. */
  flexItems?: boolean;
};

export const stackMdxDocs = {
  description:
    "Renders children in a horizontal or vertical flex layout. Use to arrange peer components in a row or a consistently spaced column.",
  flow: "block",
  defaults: {
    gap: 2,
    align: "start",
    justify: "start",
    direction: "horizontal",
    flexItems: false,
  },
  guidance: [
    "Use vertical direction for a readable group of blocks and horizontal direction for a compact row.",
    "Use flexItems when direct children should share the available space equally.",
  ],
  examples: [
    {
      title: "Basic stack",
      mdx: `<Stack>
  <Badge>First item</Badge>
  <Badge>Second item</Badge>
</Stack>`,
    },
    {
      title: "Vertical equal-width stack",
      mdx: `<Stack direction="vertical" gap={4} flexItems>
  <Card>
    <CardHeader>
      <CardTitle>Primary content</CardTitle>
    </CardHeader>
    <CardContent>
      The primary block shares the available width.
    </CardContent>
  </Card>
  <Card>
    <CardHeader>
      <CardTitle>Secondary content</CardTitle>
    </CardHeader>
    <CardContent>
      The secondary block shares the available width.
    </CardContent>
  </Card>
</Stack>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<StackProps>;

export const Stack = ({
  className,
  gap = stackMdxDocs.defaults.gap,
  align = stackMdxDocs.defaults.align,
  justify = stackMdxDocs.defaults.justify,
  direction = stackMdxDocs.defaults.direction,
  flexItems = stackMdxDocs.defaults.flexItems,
  ...props
}: StackProps) => {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={cn(
        "flex",
        flexItems && "*:flex-1",
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
