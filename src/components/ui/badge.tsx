import type * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"
import NextLink from "next/link"

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs"
import { isInternalHref, textLinkClasses } from "@/components/ui/link-utils"
import { cn } from "@/lib/utils"

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

const badgeVariantClasses = {
  default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
  destructive:
    "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
  outline:
    "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
  ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
  link: textLinkClasses,
} satisfies Record<BadgeVariant, string>

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Visual treatment applied to the badge. */
  variant?: BadgeVariant

  /** Render the badge through its single child element. */
  asChild?: boolean

  /** Destination route or URL that renders the badge as a link. */
  href?: string
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
    "Use href with a site-relative route or absolute URL for a navigational badge. Use asChild only when another direct child must own the rendered semantics.",
  ],
  examples: [
    {
      title: "Default status",
      mdx: "<Badge>Draft</Badge>",
    },
    {
      title: "Linked status",
      mdx: '<Badge href="/examples/kitchen-sink" variant="link">View report</Badge>',
    },
  ],
} as const satisfies AgentMdxComponentDocs<BadgeProps>

const badgeVariants = cva(
  "group/badge inline-flex align-text-bottom h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: badgeVariantClasses,
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
  href,
  ...props
}: BadgeProps) {
  const badgeClassName = cn(badgeVariants({ variant }), className)

  if (href) {
    const Component = isInternalHref(href) ? NextLink : "a"
    const linkProps = props as React.ComponentPropsWithoutRef<"a">

    return (
      <Component
        href={href}
        data-slot="badge"
        data-variant={variant}
        className={badgeClassName}
        {...linkProps}
      />
    )
  }

  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={badgeClassName}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
