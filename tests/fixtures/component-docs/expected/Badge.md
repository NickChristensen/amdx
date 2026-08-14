# Badge

Displays a short inline status, category, or label.

**Layout:** Inline

## Props

```ts
export type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Visual treatment for the badge. */
  variant?: "default" | "secondary" | "outline";

  /** Render the badge through its child element. */
  asChild?: boolean;
};
```

## Defaults

```ts
export const badgeDefaults = {
  variant: "default",
  asChild: false,
} satisfies AgentMdxDefaults<BadgeProps>;
```

## Examples

### Status badge

```mdx
<Badge variant="secondary">Draft</Badge>
```
