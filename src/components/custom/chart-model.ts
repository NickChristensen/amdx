import * as React from "react";
import type { ReactNode } from "react";

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";

export type ChartDataPoint = {
  /** Category label shown on the horizontal axis. */
  label: string;
  /** Numeric value plotted for the category. */
  value: number;
};

export type ChartAnnotation = {
  /** Numeric reference value shown as a horizontal line. */
  value: number;
  /** Optional label shown beside the reference line. */
  label?: string;
};

export type ChartItemProps = {
  /** Category label shown for this numeric value. */
  label: string;
  /** Numeric value represented by this chart item. */
  value: number;
};

export type ChartSeriesProps = {
  /** Series name shown in chart tooltips and legends. */
  name: string;
  /** Chart items that make up this series. */
  children: ReactNode;
};

export type ChartAnnotationProps = ChartAnnotation;

/** Represents one labeled numeric value inside a composable chart. */
export function ChartItem(_props: ChartItemProps) {
  void _props;
  return null;
}

export const chartItemMdxDocs = {
  description: "Represents one labeled numeric value inside a composable chart.",
  flow: "inline",
  defaults: {},
  examples: [],
} as const satisfies AgentMdxComponentDocs<ChartItemProps>;

/** Groups chart items under a named series. */
export function ChartSeries(_props: ChartSeriesProps) {
  void _props;
  return null;
}

export const chartSeriesMdxDocs = {
  description: "Groups chart items under a named series for multi-series charts.",
  flow: "block",
  defaults: {},
  examples: [],
} as const satisfies AgentMdxComponentDocs<ChartSeriesProps>;

/** Adds a horizontal reference value to a composable chart. */
export function ChartAnnotation(_props: ChartAnnotationProps) {
  void _props;
  return null;
}

export const chartAnnotationMdxDocs = {
  description: "Adds a horizontal reference value to a composable chart.",
  flow: "inline",
  defaults: {},
  examples: [],
} as const satisfies AgentMdxComponentDocs<ChartAnnotationProps>;

export type ChartSeriesModel = {
  key: string;
  name: string;
  data: ChartDataPoint[];
};

export type ComposableChartModel = {
  annotations: ChartAnnotation[];
  series: ChartSeriesModel[];
};

export type ChartRow = {
  categoryKey: string;
  label: string;
  [key: string]: number | string;
};

function findChartRow(
  rows: ChartRow[],
  label: string,
  occurrence: number,
): ChartRow | undefined {
  let matchingOccurrence = 0;

  for (const row of rows) {
    if (row.label !== label) {
      continue;
    }

    if (matchingOccurrence === occurrence) {
      return row;
    }

    matchingOccurrence += 1;
  }

  return undefined;
}

export function createChartRows(series: ChartSeriesModel[]): ChartRow[] {
  const rows: ChartRow[] = [];

  for (const currentSeries of series) {
    for (const [datumIndex, datum] of currentSeries.data.entries()) {
      const occurrence = currentSeries.data
        .slice(0, datumIndex)
        .filter((previousDatum) => previousDatum.label === datum.label)
        .length;
      let row = findChartRow(rows, datum.label, occurrence);

      if (!row) {
        row = {
          categoryKey: `category-${rows.length}`,
          label: datum.label,
        };
        rows.push(row);
      }

      row[currentSeries.key] = datum.value;
    }
  }

  return rows;
}

export function composableBarDomain(
  series: ChartSeriesModel[],
  annotations: ChartAnnotation[],
  stacked: boolean,
): [number, number] {
  if (!stacked) {
    const values = series.flatMap((currentSeries) =>
      currentSeries.data.map((datum) => datum.value),
    );

    return [
      0,
      Math.max(
        ...values,
        ...annotations.map((annotation) => annotation.value),
        1,
      ),
    ];
  }

  const rows = createChartRows(series);

  let minimum = 0;
  let maximum = 0;

  for (const row of rows) {
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

    minimum = Math.min(minimum, negative);
    maximum = Math.max(maximum, positive);
  }

  for (const annotation of annotations) {
    minimum = Math.min(minimum, annotation.value);
    maximum = Math.max(maximum, annotation.value);
  }

  if (minimum === 0 && maximum === 0) {
    maximum = 1;
  } else if (maximum > 0 && maximum < 1) {
    maximum = 1;
  }

  return [minimum, maximum];
}

export type ChartRootName = "BarChartCard" | "LineChartCard" | "PieChartCard";

type ChildErrors = {
  element: string;
  number: string;
  text: string;
};

function chartChildElements(
  children: ReactNode,
  errors: ChildErrors,
): React.ReactElement[] {
  const elements: React.ReactElement[] = [];

  React.Children.forEach(children, (child) => {
    if (child === null || typeof child === "boolean") {
      return;
    }

    if (typeof child === "string") {
      if (child.trim().length === 0) {
        return;
      }

      throw new Error(errors.text);
    }

    if (typeof child === "number") {
      throw new Error(errors.number);
    }

    if (!React.isValidElement(child)) {
      throw new Error(errors.element);
    }

    if (child.type === React.Fragment) {
      const fragment = child as React.ReactElement<{ children?: ReactNode }>;
      elements.push(...chartChildElements(fragment.props.children, errors));
      return;
    }

    elements.push(child);
  });

  return elements;
}

function isChartItemElement(
  element: React.ReactElement,
): element is React.ReactElement<ChartItemProps> {
  return element.type === ChartItem;
}

function isChartSeriesElement(
  element: React.ReactElement,
): element is React.ReactElement<ChartSeriesProps> {
  return element.type === ChartSeries;
}

function isChartAnnotationElement(
  element: React.ReactElement,
): element is React.ReactElement<ChartAnnotationProps> {
  return element.type === ChartAnnotation;
}

function chartSeriesData(
  rootName: Exclude<ChartRootName, "PieChartCard">,
  element: React.ReactElement<ChartSeriesProps>,
) {
  const onlyItemsMessage = `${rootName}: ChartSeries accepts only ChartItem children.`;
  const elements = chartChildElements(element.props.children, {
    element: onlyItemsMessage,
    number: onlyItemsMessage,
    text: onlyItemsMessage,
  });

  for (const child of elements) {
    if (isChartAnnotationElement(child)) {
      throw new Error(`${rootName}: ChartAnnotation must be a direct child, outside ChartSeries.`);
    }

    if (!isChartItemElement(child)) {
      throw new Error(onlyItemsMessage);
    }
  }

  const data = elements.map((child) => (child as React.ReactElement<ChartItemProps>).props);

  if (data.length === 0) {
    throw new Error(`${rootName}: ChartSeries "${element.props.name}" must contain at least one ChartItem.`);
  }

  return data;
}

function composeCartesianChartModel(
  rootName: Exclude<ChartRootName, "PieChartCard">,
  children: ReactNode,
): ComposableChartModel {
  const elements = chartChildElements(children, {
    element: `${rootName}: unsupported child element.`,
    number: `${rootName}: number children are not supported.`,
    text: `${rootName}: text children are not supported.`,
  });
  const itemElements: React.ReactElement<ChartItemProps>[] = [];
  const seriesElements: React.ReactElement<ChartSeriesProps>[] = [];
  const annotations: ChartAnnotation[] = [];

  for (const element of elements) {
    if (isChartItemElement(element)) {
      itemElements.push(element);
    } else if (isChartSeriesElement(element)) {
      seriesElements.push(element);
    } else if (isChartAnnotationElement(element)) {
      annotations.push(element.props);
    } else {
      throw new Error(`${rootName}: unsupported child element.`);
    }
  }

  if (itemElements.length > 0 && seriesElements.length > 0) {
    throw new Error(`${rootName}: direct ChartItem and ChartSeries children cannot be mixed.`);
  }

  if (seriesElements.length > 0) {
    return {
      annotations,
      series: seriesElements.map((element, index) => ({
        key: `series-${index}`,
        name: element.props.name,
        data: chartSeriesData(rootName, element),
      })),
    };
  }

  if (itemElements.length === 0) {
    throw new Error(`${rootName}: at least one ChartItem or ChartSeries is required.`);
  }

  return {
    annotations,
    series: [{
      key: "value",
      name: "Value",
      data: itemElements.map((element) => element.props),
    }],
  };
}

function composePieChartModel(children: ReactNode): ComposableChartModel {
  const rootName = "PieChartCard";
  const onlyItemsMessage = `${rootName}: only direct ChartItem children are supported.`;
  const elements = chartChildElements(children, {
    element: onlyItemsMessage,
    number: `${rootName}: number children are not supported.`,
    text: `${rootName}: text children are not supported.`,
  });

  for (const element of elements) {
    if (!isChartItemElement(element)) {
      throw new Error(onlyItemsMessage);
    }
  }

  if (elements.length === 0) {
    throw new Error(`${rootName}: at least one ChartItem is required.`);
  }

  return {
    annotations: [],
    series: [{
      key: "value",
      name: "Value",
      data: elements.map((element) => (element as React.ReactElement<ChartItemProps>).props),
    }],
  };
}

export function composeChartModel(
  rootName: ChartRootName,
  children: ReactNode,
): ComposableChartModel {
  return rootName === "PieChartCard"
    ? composePieChartModel(children)
    : composeCartesianChartModel(rootName, children);
}
