# LineChartCard

**Components:** LineChartCard (root), ChartItem (Required), ChartSeries (Optional), ChartAnnotation (Optional)

## Composition

- Use direct ChartItem children for one filled line series.
- Use ChartSeries children for multiple filled line series and ChartAnnotation for a target or threshold.
- Use a chart only when the data supports a meaningful comparison, composition, or trend.
- Use clear labels. Include relevant units, dates, source context, and uncertainty in nearby Markdown.

## Component contracts

### LineChartCard

Renders one or more filled line series in a card. Use to show change across an ordered sequence, usually time, or to compare trends.

**Layout:** Block

#### Props

```ts
export type LineChartCardProps = ChartCardProps;

export type ChartCardProps = {
  /** Optional heading shown above the chart. */
  title?: string;
  /** Chart items, series, and annotations rendered in the chart card. */
  children: ReactNode;
};
```

#### Defaults

```ts
export const lineChartCardDefaults = {} satisfies AgentMdxDefaults<LineChartCardProps>;
```

#### Examples

##### Annotated multi-series line chart

```mdx
<LineChartCard title="Weekly activity">
  <ChartSeries name="Signups">
    <ChartItem label="Mon" value={18} />
    <ChartItem label="Tue" value={24} />
    <ChartItem label="Wed" value={21} />
  </ChartSeries>
  <ChartSeries name="Cancellations">
    <ChartItem label="Mon" value={4} />
    <ChartItem label="Tue" value={6} />
    <ChartItem label="Wed" value={3} />
  </ChartSeries>
  <ChartAnnotation value={20} label="Target" />
</LineChartCard>
```

##### Multi-series line chart

```mdx
<LineChartCard title="Weekly activity">
  <ChartSeries name="Signups">
    <ChartItem label="Mon" value={18} />
    <ChartItem label="Tue" value={24} />
    <ChartItem label="Wed" value={21} />
  </ChartSeries>
  <ChartSeries name="Cancellations">
    <ChartItem label="Mon" value={4} />
    <ChartItem label="Tue" value={6} />
    <ChartItem label="Wed" value={3} />
  </ChartSeries>
</LineChartCard>
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

### ChartSeries

Groups ChartItem values under one named series. Use when a bar or line chart compares multiple measures.

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

Renders a labeled horizontal reference line on a bar or line chart. Use for a meaningful target, threshold, or benchmark.

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
