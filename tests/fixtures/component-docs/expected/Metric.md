# Metric

Displays one important value with optional comparison context.

**Layout:** Block

## Props

```ts
export type MetricProps = {
  /** Short label that identifies the value. */
  label: string;

  /** Main value, already formatted for display. */
  value: string;

  /** Optional comparison details shown below the value. */
  trend?: MetricTrend;

  /** Semantic direction used to style the trend. */
  changeType?: "positive" | "negative" | "neutral";
};

export type MetricTrend = {
  /** Text that describes the comparison period. */
  label: string;

  /** Numeric change from the comparison period. */
  value: number;
};
```

## Defaults

```ts
export const metricDefaults = {
  changeType: "neutral",
} satisfies AgentMdxDefaults<MetricProps>;
```

## Guidance

- Format the value before passing it to the component.
- Use changeType only when the comparison has a clear direction.

## Examples

### Basic metric

```mdx
<Metric label="Revenue" value="$42,000" />
```

### Metric with trend

```mdx
<Metric label="Revenue" value="$42,000" trend={{ label: "Month over month", value: 12 }} />
```
