import type * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs"
import { cn } from "@/lib/utils"

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Visual treatment applied to the badge. */
  variant?: BadgeVariant

  /** Render the badge through its single child element. */
  asChild?: boolean
}

export const badgeMdxDocs = {
  description: "Displays a short inline status, category, or label.",
  flow: "inline",
  defaults: {
    variant: "default",
    asChild: false,
  },
  guidance: [
    "Choose a variant that matches the status emphasis: use secondary or outline for quieter labels and destructive for errors or blocked states.",
    "Use asChild when the badge should adopt the semantics and behavior of its single child element.",
  ],
  examples: [
    {
      title: "Default status",
      mdx: "<Badge>Draft</Badge>",
    },
    {
      title: "Destructive status",
      mdx: '<Badge variant="destructive">Blocked</Badge>',
    },
  ],
} as const satisfies AgentMdxComponentDocs<BadgeProps>

const badgeVariants = cva(
  "group/badge inline-flex align-text-bottom h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: badgeMdxDocs.defaults.variant,
    },
  }
)

function Badge({
  className,
  variant = badgeMdxDocs.defaults.variant,
  asChild = badgeMdxDocs.defaults.asChild,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
