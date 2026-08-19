# PieChartCard

**Components:** PieChartCard (root), ChartItem (Required)

## Composition

- Use direct ChartItem children for pie slices. Multi-series pie charts are not supported.

## Component contracts

### PieChartCard

Displays direct chart items as proportional slices in a card.

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

Represents one labeled numeric value inside a composable chart.

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
