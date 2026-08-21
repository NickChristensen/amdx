"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs"
import { cn } from "@/lib/utils"

/** Props for the root that coordinates a collapsible trigger and content. */
export type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>

/** Props for the control that toggles collapsible content. */
export type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>

/** Props for the content region shown by the collapsible root. */
export type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
>

export const collapsibleMdxDocs = {
  description:
    "Renders a section that readers can expand or collapse. Use to keep secondary details available without making the main report harder to scan.",
  flow: "block",
  defaults: {
    defaultOpen: false,
  },
  guidance: [
    "Use one CollapsibleTrigger and one CollapsibleContent inside each Collapsible.",
    "Set defaultOpen when the report should show the content on first render.",
  ],
  examples: [
    {
      title: "Basic collapsible section",
      mdx: `<Collapsible>
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsibleContent>
    This content is hidden until the trigger is selected.
  </CollapsibleContent>
</Collapsible>`,
    },
    {
      title: "Open by default",
      mdx: `<Collapsible defaultOpen>
  <CollapsibleTrigger>Hide details</CollapsibleTrigger>
  <CollapsibleContent>
    This content is visible when the document loads.
  </CollapsibleContent>
</Collapsible>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CollapsibleProps>

export const collapsibleTriggerMdxDocs = {
  description:
    "Renders the control that opens or closes a Collapsible. Use clear action text that tells readers what detail it reveals.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place the trigger directly inside its Collapsible root and pair it with that root's CollapsibleContent.",
    "Use clear action text that describes whether the control reveals or hides detail.",
  ],
  examples: [
    {
      title: "Collapsible trigger",
      mdx: `<Collapsible>
  <CollapsibleTrigger>Show details</CollapsibleTrigger>
  <CollapsibleContent>Additional context.</CollapsibleContent>
</Collapsible>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CollapsibleTriggerProps>

export const collapsibleContentMdxDocs = {
  description:
    "Renders the content controlled by a CollapsibleTrigger. Use for secondary detail that readers may choose to reveal.",
  flow: "block",
  defaults: {},
  guidance: [
    "Place the content directly inside the same Collapsible root as its trigger.",
    "Put secondary detail inside this region so the document remains easy to scan when it is closed.",
  ],
  examples: [
    {
      title: "Collapsible content",
      mdx: `<Collapsible defaultOpen>
  <CollapsibleTrigger>Hide details</CollapsibleTrigger>
  <CollapsibleContent>
    Include supporting text, a list, or other MDX content here.
  </CollapsibleContent>
</Collapsible>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CollapsibleContentProps>

function Collapsible({
  defaultOpen = collapsibleMdxDocs.defaults.defaultOpen,
  ...props
}: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      defaultOpen={defaultOpen}
      {...props}
    />
  )
}

function CollapsibleTrigger({
  ...props
}: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  className,
  ...props
}: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden data-[state=open]:animate-[amdx-collapsible-down_var(--collapsible-duration)_var(--ease-out)] data-[state=closed]:animate-[amdx-collapsible-up_var(--collapsible-duration)_var(--ease-out)] motion-reduce:duration-200 motion-reduce:data-[state=open]:animate-in motion-reduce:data-[state=closed]:animate-out motion-reduce:fade-in motion-reduce:fade-out",
        className,
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
