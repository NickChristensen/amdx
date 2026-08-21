import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"
import NextLink from "next/link"

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs"
import { isInternalHref, textLinkClasses } from "@/components/ui/link-utils"
import { cn } from "@/lib/utils"

export type ButtonVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"

export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg"

const buttonVariantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/80",
  success:
    "bg-green-600/10 text-green-700 hover:bg-green-600/20 focus-visible:border-green-600/40 focus-visible:ring-green-600/20 dark:bg-green-400/20 dark:text-green-300 dark:hover:bg-green-400/30 dark:focus-visible:ring-green-400/40",
  warning:
    "bg-yellow-600/10 text-yellow-800 hover:bg-yellow-600/20 focus-visible:border-yellow-600/40 focus-visible:ring-yellow-600/20 dark:bg-yellow-400/20 dark:text-yellow-300 dark:hover:bg-yellow-400/30 dark:focus-visible:ring-yellow-400/40",
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
  outline:
    "border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  ghost:
    "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
  link: textLinkClasses,
} satisfies Record<ButtonVariant, string>

const buttonSizeClasses = {
  default:
    "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
  lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  icon: "size-9",
  "icon-xs":
    "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
  "icon-sm":
    "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
  "icon-lg": "size-10",
} satisfies Record<ButtonSize, string>

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: buttonVariantClasses,
      size: buttonSizeClasses,
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

/** Props for an interactive button and its supported visual variants. */
export type ButtonProps = React.ComponentProps<"button"> & {
  /** Visual treatment applied to the button. */
  variant?: ButtonVariant

  /** Size applied to the button. */
  size?: ButtonSize

  /** Render the button styles through a single child element. */
  asChild?: boolean

  /** Destination route or URL that renders the button as a link. */
  href?: string
}

export const buttonMdxDocs = {
  description:
    "Renders a button or button-styled link. Use for a clear action or destination that the reader can select.",
  flow: "inline",
  defaults: {
    variant: "default",
    size: "default",
    asChild: false,
  },
  guidance: [
    "Use short, action-oriented text that tells the reader what the control does.",
    "Choose default for the primary action, success for a completed or approved action, warning for an action that needs caution, secondary or outline for supporting actions, and destructive for an irreversible action.",
    "Use sm or xs when the button appears inside an AlertAction or another compact area.",
    "Use href with a site-relative route or absolute URL for a navigational button. Use asChild only when another direct child must own the rendered semantics.",
    "Use icon, icon-xs, icon-sm, or icon-lg only when the child is an icon with an accessible label.",
  ],
  examples: [
    {
      title: "Primary action",
      mdx: "<Button>Review report</Button>",
    },
    {
      title: "Compact link action",
      mdx: '<Button href="/examples/kitchen-sink" variant="outline" size="sm">View details</Button>',
    },
  ],
} as const satisfies AgentMdxComponentDocs<ButtonProps>

function Button({
  className,
  variant = buttonMdxDocs.defaults.variant,
  size = buttonMdxDocs.defaults.size,
  asChild = buttonMdxDocs.defaults.asChild,
  href,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(buttonVariants({ variant, size, className }))

  if (href) {
    const Component = isInternalHref(href) ? NextLink : "a"
    const linkProps = props as unknown as React.ComponentPropsWithoutRef<"a">

    return (
      <Component
        href={href}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={buttonClassName}
        {...linkProps}
      />
    )
  }

  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonClassName}
      {...props}
    />
  )
}

export { Button, buttonVariants }
