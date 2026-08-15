import * as React from "react";

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { cn } from "@/lib/utils";

export type CardProps = React.ComponentProps<"div"> & {
  /** Controls the card's outer spacing. */
  size?: "default" | "sm";
};

export const cardMdxDocs = {
  description: "Provides a block surface for grouping related content.",
  flow: "block",
  defaults: {
    size: "default",
  },
  guidance: [
    "Use Card as the outer surface for one complete report block.",
    "Use size=\"sm\" when the block needs tighter outer spacing.",
  ],
  examples: [
    {
      title: "Basic card",
      mdx: `<Card>

## Revenue

**$42,000** this month.

</Card>`,
    },
    {
      title: "Compact card",
      mdx: `<Card size="sm">

A compact block with reduced outer spacing.

</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardProps>;

function Card({
  className,
  size = cardMdxDocs.defaults.size,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card p-(--card-spacing) text-base text-card-foreground shadow-md ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) -mx-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] has-data-[slot=card-icon]:grid-cols-[auto_1fr] has-data-[slot=card-icon]:gap-x-2 has-data-[slot=card-icon]:has-data-[slot=card-action]:grid-cols-[auto_1fr_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-icon"
      className={cn(
        "row-span-2 translate-y-px [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-lg leading-none font-medium group-has-data-[slot=card-icon]/card-header:col-start-2 group-data-[size=sm]/card:text-base",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-muted-foreground group-has-data-[slot=card-icon]/card-header:col-start-2",
        className,
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end group-has-data-[slot=card-icon]/card-header:col-start-3",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing) -mx-(--card-spacing)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl px-(--card-spacing) -mx-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardIcon,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
