# Icon

Displays a named Lucide icon with an optional status or presentation color.

**Layout:** Inline

## Props

```ts
export type IconProps = Omit<
  React.ComponentProps<typeof DynamicIcon>,
  "color" | "fallback" | "name"
> & {
  /** Status or presentation color used for the icon. */
  color?: IconColor;

  /** Lucide icon name to render. Unknown names render nothing. */
  name: string;
};

export type IconColor =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "secondary"
  | "primary";
```

## Defaults

```ts
export const iconDefaults = {
  color: "default",
  size: "1em",
} satisfies AgentMdxDefaults<IconProps>;
```

## Guidance

- Use the kebab-case Lucide icon name, such as check, arrow-right, or circle-alert.
- Use a color when it communicates status or emphasis.

## Examples

### Basic icon

```mdx
<Icon name="check" aria-label="Complete" />
```

### Colored icon

```mdx
<Icon name="circle-alert" color="warning" size={20} aria-label="Warning" />
```
