"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  composableBarDomain,
  createChartRows,
} from "@/components/custom/chart-model";
import type {
  ChartAnnotation,
  ChartRow,
  ChartSeriesModel,
  ComposableChartModel,
} from "@/components/custom/chart-model";

function AnnotationLabel({
  text,
  viewBox,
  below = false,
}: {
  text: string;
  viewBox?: {
    x?: number;
    y?: number;
  };
  below?: boolean;
}) {
  const x = viewBox?.x ?? 0;
  const y = (viewBox?.y ?? 0) + (below ? 13 : -8);
  const width = text.length * 6 + 8;

  return (
    <g>
      <rect
        fill="color-mix(in oklab, var(--card) 50%, transparent)"
        height={16}
        rx={4}
        width={width}
        x={x - 4}
        y={y - 11}
      />
      <text
        dominantBaseline="middle"
        fill="var(--color-muted-foreground)"
        fontSize={11}
        x={x}
        y={y - 2}
      >
        {text}
      </text>
    </g>
  );
}

function AnnotationReferenceLine({
  annotation,
  labelBelow = false,
}: {
  annotation?: ChartAnnotation;
  labelBelow?: boolean;
}) {
  if (!annotation) {
    return null;
  }

  const annotationText = annotation.label
    ? `${annotation.label}: ${annotation.value}`
    : String(annotation.value);

  return (
    <ReferenceLine
      ifOverflow="extendDomain"
      stroke="var(--color-muted-foreground)"
      strokeDasharray="4 4"
      y={annotation.value}
      label={(labelProps) => (
        <AnnotationLabel
          below={labelBelow}
          text={annotationText}
          viewBox={labelProps.viewBox}
        />
      )}
    ></ReferenceLine>
  );
}

function composableChartConfig(series: ChartSeriesModel[]): ChartConfig {
  return Object.fromEntries(
    series.map((currentSeries, index) => [
      currentSeries.key,
      {
        label: currentSeries.name,
        color: chartColor(index),
      },
    ]),
  );
}

function chartColor(index: number) {
  return `var(--chart-${[3, 5, 2, 4, 1][index % 5]})`;
}

function chartColorVar(key: string) {
  return `var(--color-${key})`;
}

function composableBarValues(
  series: ChartSeriesModel[],
  stacked: boolean,
  rows: ChartRow[],
) {
  if (!stacked) {
    return series.flatMap((currentSeries) =>
      currentSeries.data.map((datum) => datum.value),
    );
  }

  return rows.flatMap((row) => {
    let negative = 0;
    let positive = 0;

    for (const currentSeries of series) {
      const value = row[currentSeries.key];

      if (typeof value !== "number") {
        continue;
      }

      if (value < 0) {
        negative += value;
      } else {
        positive += value;
      }
    }

    return [negative, positive];
  });
}

function composableLineValues(series: ChartSeriesModel[]) {
  return series.flatMap((currentSeries) =>
    currentSeries.data.map((datum) => datum.value),
  );
}

function composableLineDomain(
  series: ChartSeriesModel[],
  annotations: ChartAnnotation[],
) {
  const values = [
    ...composableLineValues(series),
    ...annotations.map((annotation) => annotation.value),
  ];
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;
  const range = max - min || 1;

  return [min - range * 0.15, max + range * 0.1] satisfies [number, number];
}

function ComposableAnnotations({
  annotations,
  renderedValues,
}: {
  annotations: ChartAnnotation[];
  renderedValues: number[];
}) {
  const maxRenderedValue = renderedValues.reduce(
    (maximum, value) => Math.max(maximum, value),
    Number.NEGATIVE_INFINITY,
  );

  return annotations.map((annotation, index) => (
    <AnnotationReferenceLine
      annotation={annotation}
      labelBelow={annotation.value > maxRenderedValue}
      key={`${annotation.label ?? "annotation"}-${annotation.value}-${index}`}
    />
  ));
}

export function BarChartVisualization({
  model,
  stacked,
}: {
  model: ComposableChartModel;
  stacked: boolean;
}) {
  const { annotations, series } = model;
  const rows = createChartRows(series);
  const renderedValues = composableBarValues(series, stacked, rows);
  const hasNegativeValue = stacked && series.some((currentSeries) =>
    currentSeries.data.some((datum) => datum.value < 0),
  );
  const config = composableChartConfig(series);
  const tooltipContent =
    series.length === 1 ? (
      <ChartTooltipContent
        hideLabel
        nameFormatter={(name, item) => item.payload?.label ?? name}
      />
    ) : (
      <ChartTooltipContent />
    );

  return (
    <ChartContainer className="aspect-auto h-56 w-full" config={config}>
      <BarChart
        accessibilityLayer={false}
        data={rows}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        stackOffset={stacked ? "sign" : undefined}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          tickLine={false}
          tickMargin={4}
        />
        <YAxis
          domain={composableBarDomain(series, annotations, stacked)}
          hide
        />
        <ChartTooltip
          content={tooltipContent}
          cursor={false}
        />
        <ComposableAnnotations
          annotations={annotations}
          renderedValues={renderedValues}
        />
        {series.map((currentSeries, index) => {
          return (
            <Bar
              dataKey={currentSeries.key}
              fill={chartColorVar(currentSeries.key)}
              key={currentSeries.key}
              radius={
                hasNegativeValue
                  ? 0
                  : stacked && index < series.length - 1
                    ? 0
                    : [8, 8, 0, 0]
              }
              stackId={stacked ? "stacked" : undefined}
            />
          );
        })}
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
      </BarChart>
    </ChartContainer>
  );
}

export function LineChartVisualization({
  model,
}: {
  model: ComposableChartModel;
}) {
  const gradientId = useId().replace(/:/g, "");
  const { annotations, series } = model;
  const renderedValues = composableLineValues(series);
  const rows = createChartRows(series);
  const config = composableChartConfig(series);
  const tooltipContent =
    series.length === 1 ? (
      <ChartTooltipContent
        hideLabel
        nameFormatter={(name, item) => item.payload?.label ?? name}
      />
    ) : (
      <ChartTooltipContent />
    );

  return (
    <ChartContainer className="aspect-auto h-56 w-full" config={config}>
      <AreaChart
        accessibilityLayer={false}
        data={rows}
        margin={{ top: 0, right: 4, bottom: 0, left: 4 }}
      >
        <defs>
          {series.map((currentSeries) => {
            const currentGradientId = `${gradientId}-${currentSeries.key}`;

            return (
              <linearGradient
                id={currentGradientId}
                key={currentGradientId}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={chartColorVar(currentSeries.key)}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={chartColorVar(currentSeries.key)}
                  stopOpacity={0}
                />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          tickLine={false}
          tickMargin={4}
        />
        <YAxis
          domain={composableLineDomain(series, annotations)}
          hide
        />
        <ChartTooltip content={tooltipContent} />
        <ComposableAnnotations
          annotations={annotations}
          renderedValues={renderedValues}
        />
        {series.map((currentSeries) => (
          <Area
            activeDot={{ r: 4 }}
            dataKey={currentSeries.key}
            dot={{ fill: chartColorVar(currentSeries.key), r: 2 }}
            fill={`url(#${gradientId}-${currentSeries.key})`}
            fillOpacity={1}
            key={currentSeries.key}
            stroke={chartColorVar(currentSeries.key)}
            strokeWidth={2}
            type="monotone"
          />
        ))}
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
      </AreaChart>
    </ChartContainer>
  );
}

export function PieChartVisualization({
  model,
}: {
  model: ComposableChartModel;
}) {
  const { series } = model;
  const data = series[0]?.data ?? [];
  const sliceData = data.map((datum, index) => ({
    ...datum,
    colorKey: `slice-${index}`,
    fill: chartColorVar(`slice-${index}`),
  }));
  const config = Object.fromEntries(
    sliceData.flatMap((datum, index) => [
      [datum.label, { label: datum.label }],
      [datum.colorKey, { label: datum.label, color: chartColor(index) }],
    ]),
  ) satisfies ChartConfig;

  return (
    <>
      <ChartContainer
        className="aspect-auto h-64 w-full"
        config={config}
      >
        <PieChart accessibilityLayer={false}>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={sliceData}
            dataKey="value"
            nameKey="label"
            outerRadius="90%"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
    </>
  );
}
