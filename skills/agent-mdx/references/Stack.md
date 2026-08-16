# Stack

Lays out content in a horizontal or vertical flex stack.

**Layout:** Block

## Props

```ts
export type StackProps = React.ComponentProps<"div"> & {
  /** Spacing between child elements, using the project's Tailwind gap scale. */
  gap?: number;

  /** Cross-axis alignment for child elements. */
  align?: "start" | "center" | "end" | "stretch";

  /** Main-axis distribution for child elements. */
  justify?: "start" | "center" | "end" | "between" | "around";

  /** Direction in which child elements are laid out. */
  direction?: "horizontal" | "vertical";

  /** Give each direct child an equal flex share. */
  flexItems?: boolean;
};
```

## Defaults

```ts
export const stackDefaults = {
  gap: 2,
  align: "start",
  justify: "start",
  direction: "horizontal",
  flexItems: false,
} satisfies AgentMdxDefaults<StackProps>;
```

## Guidance

- Use vertical direction for a readable group of blocks and horizontal direction for a compact row.
- Use flexItems when direct children should share the available space equally.

## Examples

### Basic stack

```mdx
<Stack>
  <Badge>First item</Badge>
  <Badge>Second item</Badge>
</Stack>
```

### Vertical equal-width stack

```mdx
<Stack direction="vertical" gap={4} flexItems>
  <Card>
    <CardHeader>
      <CardTitle>Primary content</CardTitle>
    </CardHeader>
    <CardContent>
      The primary block shares the available width.
    </CardContent>
  </Card>
  <Card>
    <CardHeader>
      <CardTitle>Secondary content</CardTitle>
    </CardHeader>
    <CardContent>
      The secondary block shares the available width.
    </CardContent>
  </Card>
</Stack>
```
