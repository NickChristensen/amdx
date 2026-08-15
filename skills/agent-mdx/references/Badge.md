# Badge

Displays a short inline status, category, or label.

**Layout:** Inline

## Props

```ts
export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Visual treatment applied to the badge. */
  variant?: BadgeVariant

  /** Render the badge through its single child element. */
  asChild?: boolean
}

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
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

- Choose a variant that matches the status emphasis: use secondary or outline for quieter labels and destructive for errors or blocked states.
- Use asChild when the badge should adopt the semantics and behavior of its single child element.

## Examples

### Default status

```mdx
<Badge>Draft</Badge>
```

### Destructive status

```mdx
<Badge variant="destructive">Blocked</Badge>
```
