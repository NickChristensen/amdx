# Badge

Renders a short inline label. Use for a status, category, or compact piece of metadata that should stand out from nearby text.

**Layout:** Inline

## Props

```ts
export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Visual treatment applied to the badge. */
  variant?: BadgeVariant

  /** Render the badge through its single child element. */
  asChild?: boolean

  /** Destination route or URL that renders the badge as a link. */
  href?: string
}

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
```

## Defaults

```ts
export const badgeDefaults = {
  variant: "default",
  asChild: false,
} satisfies AgentMdxDefaults<BadgeProps>;
```

## Guidance

- Choose a variant that matches the status emphasis: use default for the neutral base, success for completed or approved states, warning for states that need caution, secondary or outline for quieter labels, and destructive for errors or blocked states.
- Use href with a site-relative route or absolute URL for a navigational badge. Use asChild only when another direct child must own the rendered semantics.

## Examples

### Default status

```mdx
<Badge>Draft</Badge>
```

### Linked status

```mdx
<Badge href="/examples/kitchen-sink" variant="link">View report</Badge>
```
