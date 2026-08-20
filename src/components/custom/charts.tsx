import type { ReactNode } from "react";

import {
  BarChartVisualization,
  LineChartVisualization,
  PieChartVisualization,
} from "@/components/custom/charts-client";
import { composeChartModel } from "@/components/custom/chart-model";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";

export {
  ChartAnnotation,
  ChartItem,
  ChartSeries,
  chartAnnotationMdxDocs,
  chartItemMdxDocs,
  chartSeriesMdxDocs,
} from "@/components/custom/chart-model";
export type {
  ChartAnnotationProps,
  ChartDataPoint,
  ChartItemProps,
  ChartSeriesProps,
  ChartSeriesModel,
  ComposableChartModel,
} from "@/components/custom/chart-model";

export type ChartCardProps = {
  /** Optional heading shown above the chart. */
  title?: string;
  /** Chart items, series, and annotations rendered in the chart card. */
  children: ReactNode;
};

export type BarChartCardProps = ChartCardProps & {
  /** Stack multiple series at each category instead of grouping them. */
  stacked?: boolean;
};

export type LineChartCardProps = ChartCardProps;

export type PieChartCardProps = ChartCardProps;

function ChartCardFrame({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Card className="min-w-0 gap-3">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function BarChartCard(props: BarChartCardProps) {
  const model = composeChartModel("BarChartCard", props.children);

  return (
    <ChartCardFrame title={props.title}>
      <BarChartVisualization model={model} stacked={Boolean(props.stacked)} />
    </ChartCardFrame>
  );
}

export const barChartCardMdxDocs = {
  description: "Displays composed categorical values as grouped or stacked bars in a card.",
  flow: "block",
  defaults: {},
  guidance: [
    "Use direct ChartItem children for one series.",
    "Use ChartSeries children for grouped bars, or add stacked to combine series at each category.",
    "Use ChartAnnotation to show a target or threshold.",
  ],
  examples: [
    {
      title: "Annotated grouped bars",
      mdx: `<BarChartCard title="Weekly activity">
  <ChartSeries name="Organic">
    <ChartItem label="Mon" value={18} />
    <ChartItem label="Tue" value={24} />
  </ChartSeries>
  <ChartSeries name="Paid">
    <ChartItem label="Mon" value={12} />
    <ChartItem label="Tue" value={15} />
  </ChartSeries>
  <ChartAnnotation value={20} label="Target" />
</BarChartCard>`,
    },
    {
      title: "Grouped and stacked bars",
      mdx: `<BarChartCard title="Weekly activity">
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
</BarChartCard>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<BarChartCardProps>;

export function LineChartCard(props: LineChartCardProps) {
  const model = composeChartModel("LineChartCard", props.children);

  return (
    <ChartCardFrame title={props.title}>
      <LineChartVisualization model={model} />
    </ChartCardFrame>
  );
}

export const lineChartCardMdxDocs = {
  description: "Displays composed changing series as filled line charts in a card.",
  flow: "block",
  defaults: {},
  guidance: [
    "Use direct ChartItem children for one filled line series.",
    "Use ChartSeries children for multiple filled line series and ChartAnnotation for a target or threshold.",
  ],
  examples: [
    {
      title: "Annotated multi-series line chart",
      mdx: `<LineChartCard title="Weekly activity">
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
</LineChartCard>`,
    },
    {
      title: "Multi-series line chart",
      mdx: `<LineChartCard title="Weekly activity">
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
</LineChartCard>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<LineChartCardProps>;

export function PieChartCard(props: PieChartCardProps) {
  const model = composeChartModel("PieChartCard", props.children);

  return (
    <ChartCardFrame title={props.title}>
      <PieChartVisualization model={model} />
    </ChartCardFrame>
  );
}

export const pieChartCardMdxDocs = {
  description: "Displays direct chart items as proportional slices in a card.",
  flow: "block",
  defaults: {},
  guidance: [
    "Use direct ChartItem children for pie slices. Multi-series pie charts are not supported.",
  ],
  examples: [
    {
      title: "Traffic sources",
      mdx: `<PieChartCard title="Traffic sources">
  <ChartItem label="Organic" value={42} />
  <ChartItem label="Paid" value={28} />
  <ChartItem label="Referral" value={18} />
</PieChartCard>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<PieChartCardProps>;
