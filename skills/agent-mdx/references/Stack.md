# Stack

Arranges peer components in a wrapping row. Use for compact items such as buttons and badges, or enable flexItems to give cards and metrics equal widths. On small screens, flexItems falls back to a full-width column.

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

  /**
   * Give each direct child an equal flex share in the wrapping row from the
   * `sm` breakpoint upward. On small screens, each child falls back to a
   * full-width column.
   */
  flexItems?: boolean;
};
```

## Defaults

```ts
export const stackDefaults = {
  gap: 2,
  align: "start",
  justify: "start",
  flexItems: false,
} satisfies AgentMdxDefaults<StackProps>;
```

## Guidance

- Use without flexItems for compact peer items such as buttons, badges, or inline controls. Children wrap when the row runs out of space.
- Use flexItems for peer cards or metrics that should share equal widths in a wrapping row from the sm breakpoint upward. On small screens, flexItems falls back to a full-width column.
- Use ordinary MDX flow for vertical content.

## Examples

### Compact wrapping row

```mdx
<Stack gap={2} align="center">
  <Badge>First item</Badge>
  <Badge>Second item</Badge>
</Stack>
```

### Responsive equal-width metrics

```mdx
<Stack gap={4} flexItems>
  <Metric label="Monthly revenue" value="$42,000" change="+8%" changeType="positive" />
  <Metric label="Active users" value="18,420" change="+12%" changeType="positive" />
</Stack>
```
