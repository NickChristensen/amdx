# LineChartCard

**Components:** LineChartCard (root), ChartItem (Required), ChartSeries (Optional), ChartAnnotation (Optional)

## Composition

- Use direct ChartItem children for one filled line series.
- Use ChartSeries children for multiple filled line series and ChartAnnotation for a target or threshold.

## Component contracts

### LineChartCard

Displays composed changing series as filled line charts in a card.

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
