"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs"
import { cn } from "@/lib/utils"

/** Props for the progress track and its percentage-based indicator. */
export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>

export const progressMdxDocs = {
  description: "Displays completion progress as a horizontal bar.",
  flow: "block",
  defaults: {
    value: 0,
  },
  guidance: [
    "Pass value as a percentage from 0 to 100. Omit it for an empty progress bar.",
    "Add an accessible name with aria-label when the surrounding content does not already label the progress bar.",
  ],
  examples: [
    {
      title: "Completion progress",
      mdx: `<Progress value={72} aria-label="Import progress" />`,
    },
    {
      title: "Progress without a value",
      mdx: `<Progress aria-label="Preparing import" />`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<ProgressProps>

function Progress({
  className,
  value,
  ...props
}: ProgressProps) {
  const progressValue = value || progressMdxDocs.defaults.value

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
