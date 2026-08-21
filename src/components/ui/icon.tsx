"use client";

import type * as React from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import { cn } from "@/lib/utils";

const iconColorClasses: Record<IconColor, string> = {
  default: "",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  destructive: "text-red-600 dark:text-red-400",
  secondary: "text-muted-foreground",
  primary: "text-primary",
} as const;

export type IconColor =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "secondary"
  | "primary";

export type IconProps = Omit<
  React.ComponentProps<typeof DynamicIcon>,
  "color" | "fallback" | "name"
> & {
  /** Status or presentation color used for the icon. */
  color?: IconColor;

  /** Lucide icon name to render. Unknown names render nothing. */
  name: string;
};

export const iconMdxDocs = {
  description:
    "Renders a Lucide icon inline with optional semantic color. Use to reinforce a nearby label or status when the symbol improves scanning.",
  flow: "inline",
  defaults: {
    color: "default",
    size: "1em",
  },
  guidance: [
    "Use the kebab-case Lucide icon name, such as check, arrow-right, or circle-alert.",
    "Use a color when it communicates status or emphasis.",
  ],
  examples: [
    {
      title: "Basic icon",
      mdx: '<Icon name="check" aria-label="Complete" />',
    },
    {
      title: "Colored icon",
      mdx: '<Icon name="circle-alert" color="warning" size={20} aria-label="Warning" />',
    },
  ],
} as const satisfies AgentMdxComponentDocs<IconProps>;

function resolveIconColorClass(color: IconProps["color"]) {
  if (!color) return "";

  return iconColorClasses[color];
}

export function Icon({
  className,
  color = iconMdxDocs.defaults.color,
  name,
  size = iconMdxDocs.defaults.size,
  ...props
}: IconProps) {
  const iconName = name;
  const iconClassName = cn(
    "inline-block shrink-0 align-[-0.15em]",
    resolveIconColorClass(color),
    className,
  );

  if (!(iconName in dynamicIconImports)) {
    return null;
  }

  function IconFallback() {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        focusable="false"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      />
    );
  }

  return (
    <DynamicIcon
      className={iconClassName}
      fallback={IconFallback}
      name={iconName as keyof typeof dynamicIconImports}
      size={size}
      {...props}
    />
  );
}
