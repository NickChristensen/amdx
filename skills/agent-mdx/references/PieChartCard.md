# PieChartCard

**Components:** PieChartCard (root), ChartItem (Required)

## Composition

- Use direct ChartItem children for pie slices. Multi-series pie charts are not supported.
- Use a chart only when the data supports a meaningful comparison, composition, or trend.
- Use clear labels. Include relevant units, dates, source context, and uncertainty in nearby Markdown.

## Component contracts

### PieChartCard

Renders labeled values as proportional slices in a card. Use to show how a small number of categories contribute to one meaningful whole.

**Layout:** Block

#### Props

```ts
export type PieChartCardProps = ChartCardProps;

export type ChartCardProps = {
  /** Optional heading shown above the chart. */
  title?: string;
  /** Chart items, series, and annotations rendered in the chart card. */
  children: ReactNode;
};
```

#### Defaults

```ts
export const pieChartCardDefaults = {} satisfies AgentMdxDefaults<PieChartCardProps>;
```

#### Examples

##### Traffic sources

```mdx
<PieChartCard title="Traffic sources">
  <ChartItem label="Organic" value={42} />
  <ChartItem label="Paid" value={28} />
  <ChartItem label="Referral" value={18} />
</PieChartCard>
```

### ChartItem

Defines one labeled numeric value for a chart. Use directly for one series or inside ChartSeries for multi-series bar and line charts.

**Layout:** Inline

#### Props

```ts
export type ChartItemProps = {
  /** Category label shown for this numeric value. */
  label: string;
  /** Numeric value represented by this chart item. */
  value: number;
};
```

#### Defaults

```ts
export const chartItemDefaults = {} satisfies AgentMdxDefaults<ChartItemProps>;
```
