# Metric

Displays one important value with a label and optional change context.

**Layout:** Block

## Props

```ts
export type MetricProps = {
  /** Short label that identifies the value. */
  label: string;

  /** Main value, already formatted for display. */
  value: string;

  /** Change relative to the comparison period. */
  change?: string;

  /** Semantic direction used to style the change indicator. */
  changeType?: "positive" | "negative" | "neutral";

  /** Text shown immediately before the value. */
  prefix?: string;

  /** Text shown immediately after the value. */
  suffix?: string;
};
```

## Defaults

```ts
export const metricDefaults = {
  changeType: "neutral",
} satisfies AgentMdxDefaults<MetricProps>;
```

## Guidance

- Format the value for display before passing it to the component.
- Use changeType only when the direction has a clear meaning.

## Examples

### Basic metric

```mdx
<Metric label="Revenue" value="$42,000" />
```

### Metric with change

```mdx
<Metric
  label="Monthly active users"
  value="18,420"
  change="+12%"
  changeType="positive"
/>
```
