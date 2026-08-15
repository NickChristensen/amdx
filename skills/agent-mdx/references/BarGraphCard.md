# BarGraphCard

Displays categorical values as vertical bars in a card.

**Layout:** Block

## Props

```ts
export type ChartProps = {
  /** Optional heading shown above the chart. */
  title?: string;
  /** Data points rendered in the chart. */
  data: ChartDataPoint[];
  /** Optional reference line drawn across the chart. */
  annotation?: ChartAnnotation;
};

export type ChartDataPoint = {
  /** Category label shown on the horizontal axis. */
  label: string;
  /** Numeric value plotted for the category. */
  value: number;
};

export type ChartAnnotation = {
  /** Numeric reference value shown as a horizontal line. */
  value: number;
  /** Optional label shown beside the reference line. */
  label?: string;
};
```

## Defaults

```ts
export const barGraphCardDefaults = {} satisfies AgentMdxDefaults<ChartProps>;
```

## Guidance

- Use annotation to show a target or threshold in the same units as the data.

## Examples

### Basic bar graph

```mdx
<BarGraphCard
  title="Weekly signups"
  data={[
    { label: "Mon", value: 18 },
    { label: "Tue", value: 24 },
    { label: "Wed", value: 21 },
  ]}
/>
```

### Bar graph with target

```mdx
<BarGraphCard
  title="Weekly signups"
  data={[
    { label: "Mon", value: 18 },
    { label: "Tue", value: 24 },
    { label: "Wed", value: 21 },
  ]}
  annotation={{ value: 20, label: "Target" }}
/>
```
