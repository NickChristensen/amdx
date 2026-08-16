import * as React from "react";
import { cva } from "class-variance-authority";

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { cn } from "@/lib/utils";

export type AlertVariant =
  | "default"
  | "note"
  | "tip"
  | "important"
  | "warning"
  | "caution"
  | "danger";

const alertVariantClasses = {
  default: "bg-card text-card-foreground",
  note: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  tip: "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
  important:
    "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-400",
  warning:
    "border-yellow-200 bg-yellow-50 text-yellow-600 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-400",
  caution:
    "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  danger:
    "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
} satisfies Record<AlertVariant, string>;

const alertVariants = cva(
  "group/alert relative grid gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: alertVariantClasses,
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/** Props for the alert container and its semantic visual variant. */
export type AlertProps = React.ComponentProps<"div"> & {
  /** Visual treatment applied to the alert. */
  variant?: AlertVariant;
};

/** Props for the heading shown at the start of an alert. */
export type AlertTitleProps = React.ComponentProps<"div">;

/** Props for the supporting content shown in an alert. */
export type AlertDescriptionProps = React.ComponentProps<"div">;

/** Props for the action area positioned in an alert. */
export type AlertActionProps = React.ComponentProps<"div">;

export const alertMdxDocs = {
  description:
    "Displays a semantic message with a required description and optional title and action content.",
  flow: "block",
  defaults: {
    variant: "default",
  },
  family: [
    { name: "AlertTitle", required: false },
    { name: "AlertDescription", required: true },
    { name: "AlertAction", required: false },
  ],
  guidance: [
    "Use Alert as the root and include one AlertDescription in every alert.",
    "Add AlertTitle when the message needs a clear heading, and add AlertAction only when the alert has a compact action or status control.",
    "A generic Icon is optional. Add it before AlertTitle when possible to give the alert stronger visual hierarchy.",
    "Choose note, tip, important, warning, caution, or danger to match the message context.",
  ],
  examples: [
    {
      title: "Warning with action",
      mdx: `<Alert variant="warning">
  <Icon name="triangle-alert" aria-hidden="true" />
  <AlertTitle>Review needed</AlertTitle>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
  <AlertAction>
    <Button href="/examples/kitchen-sink" size="sm">Open report</Button>
  </AlertAction>
</Alert>`,
    },
    {
      title: "Simple note",
      mdx: `<Alert variant="note">
  <AlertDescription>
    The report uses the latest synced data.
  </AlertDescription>
</Alert>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<AlertProps>;

export const alertTitleMdxDocs = {
  description: "Renders the concise heading for an Alert.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place AlertTitle directly inside an Alert when the message needs a clear heading.",
    "Keep the title short so the alert remains easy to scan.",
  ],
  examples: [
    {
      title: "Alert title",
      mdx: `<Alert>
  <AlertTitle>Review needed</AlertTitle>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
</Alert>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<AlertTitleProps>;

export const alertDescriptionMdxDocs = {
  description: "Renders supporting content for an Alert.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place AlertDescription directly inside an Alert after its AlertTitle when both are present.",
    "Use the description for the context or next step that supports the alert heading.",
  ],
  examples: [
    {
      title: "Alert description",
      mdx: `<Alert>
  <AlertDescription>
    Check the latest report before sharing it.
  </AlertDescription>
</Alert>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<AlertDescriptionProps>;

export const alertActionMdxDocs = {
  description: "Positions action content in the upper-right area of an Alert.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place AlertAction inside an Alert when the message has a compact action or status control.",
    "Keep action content short so it fits beside the alert message.",
    "Use Button with href for a navigational alert action.",
  ],
  examples: [
    {
      title: "Alert action",
      mdx: `<Alert>
  <AlertDescription>New report data is available.</AlertDescription>
  <AlertAction>
    <Button href="/examples/kitchen-sink" size="sm">View report</Button>
  </AlertAction>
</Alert>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<AlertActionProps>;

function Alert({
  className,
  variant = alertMdxDocs.defaults.variant,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: AlertDescriptionProps) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: AlertActionProps) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
