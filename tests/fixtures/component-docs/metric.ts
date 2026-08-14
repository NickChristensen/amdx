export type MetricTrend = {
  /** Text that describes the comparison period. */
  label: string;

  /** Numeric change from the comparison period. */
  value: number;
};

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

export function Metric(_props: MetricProps) {
  void _props;
  return null;
}

export const metricMdxDocs = {
  description: "Displays one important value with optional comparison context.",
  flow: "block",
  defaults: {
    changeType: "neutral",
  },
  guidance: [
    "Format the value before passing it to the component.",
    "Use changeType only when the comparison has a clear direction.",
  ],
  examples: [
    {
      title: "Basic metric",
      mdx: '<Metric label="Revenue" value="$42,000" />',
    },
    {
      title: "Metric with trend",
      mdx: '<Metric label="Revenue" value="$42,000" trend={{ label: "Month over month", value: 12 }} />',
    },
  ],
} as const satisfies AgentMdxComponentDocs<MetricProps>;
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
