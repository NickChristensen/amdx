# Button

Displays an interactive action with a semantic visual treatment.

**Layout:** Inline

## Props

```ts
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
```

## Defaults

```ts
export const buttonDefaults = {
  variant: "default",
  size: "default",
  asChild: false,
} satisfies AgentMdxDefaults<ButtonProps>;
```

## Guidance

- Use short, action-oriented text that tells the reader what the control does.
- Choose default for the primary action, success for a completed or approved action, warning for an action that needs caution, secondary or outline for supporting actions, and destructive for an irreversible action.
- Use sm or xs when the button appears inside an AlertAction or another compact area.
- Use href with a site-relative route or absolute URL for a navigational button. Use asChild only when another direct child must own the rendered semantics.
- Use icon, icon-xs, icon-sm, or icon-lg only when the child is an icon with an accessible label.

## Examples

### Primary action

```mdx
<Button>Review report</Button>
```

### Compact link action

```mdx
<Button href="/examples/kitchen-sink" variant="outline" size="sm">View details</Button>
```
