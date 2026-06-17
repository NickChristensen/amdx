"use client";

import type * as React from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";

import { cn } from "@/lib/utils";

const iconColorClasses = {
  default: "",
  muted: "text-muted-foreground",
  primary: "text-primary",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
} as const;

type DynamicIconProps = React.ComponentProps<typeof DynamicIcon>;

export type IconColor = keyof typeof iconColorClasses;

export type IconProps = Omit<
  DynamicIconProps,
  "color" | "fallback" | "name"
> & {
  color?: IconColor;
  name: string;
};

function resolveIconColorClass(color: IconProps["color"]) {
  if (!color) return "";

  return iconColorClasses[color];
}

export function Icon({
  className,
  color,
  name,
  size = "1em",
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
