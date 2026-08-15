# Card

Provides a block surface for grouping related content.

**Layout:** Block

## Props

```ts
export type CardProps = React.ComponentProps<"div"> & {
  /** Controls the card's outer spacing. */
  size?: "default" | "sm";
};
```

## Defaults

```ts
export const cardDefaults = {
  size: "default",
} satisfies AgentMdxDefaults<CardProps>;
```

## Guidance

- Use Card as the outer surface for one complete report block.
- Use size="sm" when the block needs tighter outer spacing.

## Examples

### Basic card

```mdx
<Card>

## Revenue

**$42,000** this month.

</Card>
```

### Compact card

```mdx
<Card size="sm">

A compact block with reduced outer spacing.

</Card>
```
