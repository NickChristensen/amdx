# BarChartCard

**Components:** BarChartCard (root), ChartItem (Required), ChartSeries (Optional), ChartAnnotation (Optional)

## Composition

- Use direct ChartItem children for one series.
- Use ChartSeries children for grouped bars, or add stacked to combine series at each category.
- Use ChartAnnotation to show a target or threshold.

## Component contracts

### BarChartCard

Displays composed categorical values as grouped or stacked bars in a card.

**Layout:** Block

#### Props

```ts
export type BarChartCardProps = ChartCardProps & {
  /** Stack multiple series at each category instead of grouping them. */
  stacked?: boolean;
};

export type ChartCardProps = {
  /** Optional heading shown above the chart. */
  title?: string;
  /** Chart items, series, and annotations rendered in the chart card. */
  children: ReactNode;
};
```

#### Defaults

```ts
export const barChartCardDefaults = {} satisfies AgentMdxDefaults<BarChartCardProps>;
```

#### Examples

##### Annotated grouped bars

```mdx
<BarChartCard title="Weekly activity">
  <ChartSeries name="Organic">
    <ChartItem label="Mon" value={18} />
    <ChartItem label="Tue" value={24} />
  </ChartSeries>
  <ChartSeries name="Paid">
    <ChartItem label="Mon" value={12} />
    <ChartItem label="Tue" value={15} />
  </ChartSeries>
  <ChartAnnotation value={20} label="Target" />
</BarChartCard>
```

##### Grouped and stacked bars

```mdx
<BarChartCard title="Weekly activity">
  <ChartSeries name="Organic">
    <ChartItem label="Mon" value={18} />
    <ChartItem label="Tue" value={24} />
  </ChartSeries>
  <ChartSeries name="Paid">
    <ChartItem label="Mon" value={12} />
    <ChartItem label="Tue" value={15} />
  </ChartSeries>
</BarChartCard>

<BarChartCard title="Weekly activity" stacked>
  <ChartSeries name="Organic">
    <ChartItem label="Mon" value={18} />
    <ChartItem label="Tue" value={24} />
  </ChartSeries>
  <ChartSeries name="Paid">
    <ChartItem label="Mon" value={12} />
    <ChartItem label="Tue" value={15} />
  </ChartSeries>
</BarChartCard>
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

### ChartSeries

Groups chart items under a named series for multi-series charts.

**Layout:** Block

#### Props

```ts
export type ChartSeriesProps = {
  /** Series name shown in chart tooltips and legends. */
  name: string;
  /** Chart items that make up this series. */
  children: ReactNode;
};
```

#### Defaults

```ts
export const chartSeriesDefaults = {} satisfies AgentMdxDefaults<ChartSeriesProps>;
```

### ChartAnnotation

Adds a horizontal reference value to a composable chart.

**Layout:** Inline

#### Props

```ts
export type ChartAnnotationProps = ChartAnnotation;

export type ChartAnnotation = {
  /** Numeric reference value shown as a horizontal line. */
  value: number;
  /** Optional label shown beside the reference line. */
  label?: string;
};
```

#### Defaults

```ts
export const chartAnnotationDefaults = {} satisfies AgentMdxDefaults<ChartAnnotationProps>;
```
