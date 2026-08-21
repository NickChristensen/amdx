import * as React from "react";

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { cn } from "@/lib/utils";

export type CardProps = React.ComponentProps<"div"> & {
  /** Controls the card's outer spacing. */
  size?: "default" | "sm";
};

export const cardMdxDocs = {
  description:
    "Renders a structured block surface with optional header, content, and footer sections. Use to group one self-contained topic that needs stronger separation than headings alone.",
  flow: "block",
  defaults: {
    size: "default",
  },
  guidance: [
    "Use Card as the outer surface for one complete report block.",
    "Use CardContent for the card's primary body content, with CardHeader and CardFooter when the block has distinct sections.",
    "Use CardIcon with CardTitle when the block needs a clear visual marker, and use CardAction for a compact status or link in the header.",
    "Use size=\"sm\" when the block needs tighter outer spacing.",
  ],
  examples: [
    {
      title: "Structured card",
      mdx: `<Card>
  <CardHeader>
    <CardIcon><Icon name="chart-no-axes-combined" aria-hidden="true" /></CardIcon>
    <CardTitle>Revenue</CardTitle>
    <CardDescription>Monthly performance snapshot</CardDescription>
    <CardAction><Badge variant="outline">Review</Badge></CardAction>
  </CardHeader>
  <CardContent>
    **$42,000** this month, up 12.4% from the previous period.
  </CardContent>
  <CardFooter>Source: finance report, synced today</CardFooter>
</Card>`,
    },
    {
      title: "Compact card",
      mdx: `<Card size="sm">
  <CardHeader>
    <CardTitle>Compact summary</CardTitle>
  </CardHeader>
  <CardContent>
    A compact block with reduced outer spacing.
  </CardContent>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardProps>;

/** Props for the heading area at the top of a card. */
export type CardHeaderProps = React.ComponentProps<"div">;

export const cardHeaderMdxDocs = {
  description:
    "Renders the heading area for a Card. Use when the card needs a title, description, icon, or compact action.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place CardHeader directly inside Card when the block needs a distinct heading area.",
    "Combine CardTitle with CardDescription for a clear heading and supporting context.",
  ],
  examples: [
    {
      title: "Card header",
      mdx: `<Card>
  <CardHeader>
    <CardTitle>Release readiness</CardTitle>
    <CardDescription>Current deployment status</CardDescription>
  </CardHeader>
  <CardContent>
    The latest deployment passed its readiness checks.
  </CardContent>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardHeaderProps>;

/** Props for the icon area inside a card header. */
export type CardIconProps = React.ComponentProps<"div">;

export const cardIconMdxDocs = {
  description:
    "Renders a compact visual marker in a CardHeader. Use when an icon helps readers identify the card's subject or status.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place CardIcon inside CardHeader before CardTitle when the card benefits from a visual marker.",
    "Use an Icon as the child so the marker has a meaningful accessible name or aria-hidden state.",
  ],
  examples: [
    {
      title: "Card icon",
      mdx: `<Card>
  <CardHeader>
    <CardIcon><Icon name="sparkles" aria-hidden="true" /></CardIcon>
    <CardTitle>Highlights</CardTitle>
    <CardDescription>New findings from this report</CardDescription>
  </CardHeader>
  <CardContent>
    Three new findings are ready for review.
  </CardContent>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardIconProps>;

/** Props for the main heading inside a card header. */
export type CardTitleProps = React.ComponentProps<"div">;

export const cardTitleMdxDocs = {
  description:
    "Renders the main heading for a Card. Use to name the card's subject in a short, scannable phrase.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place CardTitle inside CardHeader to identify the card's main subject.",
    "Keep the title short so readers can scan the card quickly.",
  ],
  examples: [
    {
      title: "Card title",
      mdx: `<Card>
  <CardHeader>
    <CardTitle>Open issues</CardTitle>
  </CardHeader>
  <CardContent>
    Review the open issues before the next release.
  </CardContent>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardTitleProps>;

/** Props for supporting text inside a card header. */
export type CardDescriptionProps = React.ComponentProps<"div">;

export const cardDescriptionMdxDocs = {
  description:
    "Renders supporting context below a CardTitle. Use when the title needs a short explanation of the card's scope.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place CardDescription inside CardHeader after CardTitle when the heading needs context.",
    "Use one short sentence or phrase that explains the card's scope.",
  ],
  examples: [
    {
      title: "Card description",
      mdx: `<Card>
  <CardHeader>
    <CardTitle>System status</CardTitle>
    <CardDescription>Last checked five minutes ago</CardDescription>
  </CardHeader>
  <CardContent>
    All monitored services are operating normally.
  </CardContent>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardDescriptionProps>;

/** Props for compact action or status content inside a card header. */
export type CardActionProps = React.ComponentProps<"div">;

export const cardActionMdxDocs = {
  description:
    "Renders compact action or status content at the end of a CardHeader. Use for a short link, badge, or state tied to the card.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place CardAction inside CardHeader when the card has a compact link, badge, or status control.",
    "Keep the content short so it remains aligned with the heading.",
  ],
  examples: [
    {
      title: "Card action",
      mdx: `<Card>
  <CardHeader>
    <CardTitle>Review queue</CardTitle>
    <CardAction><Badge variant="outline">17 open</Badge></CardAction>
  </CardHeader>
  <CardContent>
    Seventeen items are waiting for review.
  </CardContent>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardActionProps>;

/** Props for the main content area inside a card. */
export type CardContentProps = React.ComponentProps<"div">;

export const cardContentMdxDocs = {
  description:
    "Renders the main body area inside a Card. Use for the card's primary Markdown or component content.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place CardContent after CardHeader when the card has a main body section.",
    "Use ordinary Markdown and agent-facing components inside CardContent.",
  ],
  examples: [
    {
      title: "Card content",
      mdx: `<Card>
  <CardContent>
    The deployment completed successfully and all checks passed.
  </CardContent>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardContentProps>;

/** Props for supporting content at the bottom of a card. */
export type CardFooterProps = React.ComponentProps<"div">;

export const cardFooterMdxDocs = {
  description:
    "Renders a supporting area at the bottom of a Card. Use for secondary source text, timestamps, or related links.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place CardFooter after CardContent when the card needs source text, a timestamp, or a related link.",
    "Keep footer content secondary to the main card content.",
  ],
  examples: [
    {
      title: "Card footer",
      mdx: `<Card>
  <CardContent>Deployment completed successfully.</CardContent>
  <CardFooter>Updated 5 minutes ago</CardFooter>
</Card>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CardFooterProps>;

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
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-base text-card-foreground shadow-md ring-1 ring-foreground/10 [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] has-data-[slot=card-icon]:grid-cols-[auto_1fr] has-data-[slot=card-icon]:gap-x-2 has-data-[slot=card-icon]:has-data-[slot=card-action]:grid-cols-[auto_1fr_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardIcon({ className, ...props }: CardIconProps) {
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

function CardTitle({ className, ...props }: CardTitleProps) {
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

function CardDescription({ className, ...props }: CardDescriptionProps) {
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

function CardAction({ className, ...props }: CardActionProps) {
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

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-3 px-(--card-spacing)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
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
