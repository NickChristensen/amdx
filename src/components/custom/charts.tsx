"use client";

import { useId, type ComponentProps } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type ChartProps = {
  title?: string;
  data: Array<{
    label: string;
    value: number;
  }>;
  annotation?: {
    value: number;
    label?: string;
  };
};

const chartConfig = {
  value: {
    label: "Value",
    theme: {
      light: "var(--chart-3)",
      dark: "var(--chart-3)",
    },
  },
  fill: {
    label: "Fill",
    theme: {
      light: "var(--chart-2)",
      dark: "var(--chart-2)",
    },
  },
  annotation: {
    label: "Reference",
    theme: {
      light: "var(--color-muted-foreground)",
      dark: "var(--color-muted-foreground)",
    },
  },
} satisfies ChartConfig;

function getBarDomain({ data, annotation }: ChartProps) {
  return [
    0,
    Math.max(
      ...data.map((datum) => datum.value),
      annotation?.value ?? Number.NEGATIVE_INFINITY,
      1,
    ),
  ] satisfies [number, number];
}

function getLineDomain({ data, annotation }: ChartProps) {
  const values = data.map((datum) => datum.value);

  if (annotation) {
    values.push(annotation.value);
  }

  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;
  const range = max - min || 1;

  return [min - range * 0.15, max + range * 0.1] satisfies [number, number];
}

function ChartTitle({ title }: { title?: string }) {
  if (!title) {
    return null;
  }

  return <div className="text-sm font-medium">{title}</div>;
}

function AnnotationLabel({
  text,
  viewBox,
}: {
  text: string;
  viewBox?: {
    x?: number;
    y?: number;
  };
}) {
  const x = viewBox?.x ?? 0;
  const y = (viewBox?.y ?? 0) - 8;
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
}: {
  annotation?: ChartProps["annotation"];
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
      stroke="var(--color-annotation)"
      strokeDasharray="4 4"
      y={annotation.value}
      label={(labelProps) => (
        <AnnotationLabel text={annotationText} viewBox={labelProps.viewBox} />
      )}
    ></ReferenceLine>
  );
}

function ChartValueTooltipContent(
  props: ComponentProps<typeof ChartTooltipContent>,
) {
  return (
    <ChartTooltipContent
      {...props}
      hideLabel
      formatter={(value, _name, item) => (
        <>
          <span className="text-muted-foreground">
            {String(item.payload?.label ?? "Value")}
          </span>
          <span className="ml-auto font-mono font-medium text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : String(value)}
          </span>
        </>
      )}
    />
  );
}

export function BarGraph(props: ChartProps) {
  const data = props.data ?? [];

  return (
    <div className="min-w-0 space-y-3">
      <ChartTitle title={props.title} />
      <ChartContainer className="aspect-auto h-56 w-full" config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={4}
          />
          <YAxis domain={getBarDomain(props)} hide />
          <ChartTooltip content={<ChartValueTooltipContent />} cursor={false} />
          <AnnotationReferenceLine annotation={props.annotation} />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function LineGraph(props: ChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const data = props.data ?? [];

  return (
    <div className="min-w-0 space-y-3">
      <ChartTitle title={props.title} />
      <ChartContainer className="aspect-auto h-56 w-full" config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 0, right: 4, bottom: 0, left: 4 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-fill)"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="var(--color-fill)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={4}
          />
          <YAxis domain={getLineDomain(props)} hide />
          <ChartTooltip content={<ChartValueTooltipContent />} />
          <AnnotationReferenceLine annotation={props.annotation} />
          <Area
            activeDot={{ r: 4 }}
            dataKey="value"
            dot={{ fill: "var(--color-value)", r: 2 }}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            stroke="var(--color-value)"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
