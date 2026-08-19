import assert from "node:assert/strict";
import test from "node:test";
import React from "react";

import {
  ChartAnnotation,
  ChartItem,
  ChartSeries,
  composableBarDomain,
  composeChartModel,
  createChartRows,
} from "../src/components/custom/chart-model.ts";

const item = (label, value) => React.createElement(ChartItem, { label, value });
const annotation = (value, label) => React.createElement(ChartAnnotation, { label, value });
const series = (name, ...children) => React.createElement(ChartSeries, { name }, ...children);
const fragment = (...children) => React.createElement(React.Fragment, null, ...children);
const modelSeries = (key, name, ...data) => ({
  key,
  name,
  data: data.map(([label, value]) => ({ label, value })),
});

function assertError(callback, message) {
  assert.throws(callback, (error) => {
    assert.equal(error.message, message);
    return true;
  });
}

test("normalizes direct items, annotations, fragments, and ignorable children", () => {
  for (const rootName of ["BarChartCard", "LineChartCard"]) {
    const model = composeChartModel(rootName, [
      null,
      false,
      true,
      " \n ",
      fragment(item("Mon", 18), fragment(item("Tue", 24))),
      annotation(20, "Target"),
      fragment(annotation(30, "Stretch")),
    ]);

    assert.deepEqual(model, {
      annotations: [
        { label: "Target", value: 20 },
        { label: "Stretch", value: 30 },
      ],
      series: [{
        key: "value",
        name: "Value",
        data: [
          { label: "Mon", value: 18 },
          { label: "Tue", value: 24 },
        ],
      }],
    });
  }
});

test("normalizes named series and recursively nested fragments", () => {
  for (const rootName of ["BarChartCard", "LineChartCard"]) {
    const model = composeChartModel(rootName, [
      fragment(
        series("Organic", fragment(item("Mon", 18)), null, " \n "),
        series("Paid", item("Mon", 12), fragment(item("Tue", 15))),
      ),
      annotation(20, "Target"),
    ]);

    assert.deepEqual(model, {
      annotations: [{ label: "Target", value: 20 }],
      series: [
        {
          key: "series-0",
          name: "Organic",
          data: [{ label: "Mon", value: 18 }],
        },
        {
          key: "series-1",
          name: "Paid",
          data: [
            { label: "Mon", value: 12 },
            { label: "Tue", value: 15 },
          ],
        },
      ],
    });
  }
});

test("normalizes pie items through fragments", () => {
  assert.deepEqual(
    composeChartModel("PieChartCard", [
      null,
      false,
      " \n ",
      fragment(item("Organic", 42), fragment(item("Paid", 28))),
    ]),
    {
      annotations: [],
      series: [{
        key: "value",
        name: "Value",
        data: [
          { label: "Organic", value: 42 },
          { label: "Paid", value: 28 },
        ],
      }],
    },
  );
});

test("keeps repeated direct labels as separate ordered rows", () => {
  const model = composeChartModel("BarChartCard", [
    item("Tue", 24),
    item("Tue", 6),
  ]);

  assert.deepEqual(createChartRows(model.series), [
    { categoryKey: "category-0", label: "Tue", value: 24 },
    { categoryKey: "category-1", label: "Tue", value: 6 },
  ]);
});

test("pairs repeated labels across series by occurrence order", () => {
  const model = composeChartModel("BarChartCard", [
    series(
      "Organic",
      item("Mon", 18),
      item("Tue", 24),
      item("Tue", 6),
    ),
    series(
      "Paid",
      item("Tue", 14),
      item("Tue", 4),
      item("Mon", 8),
    ),
  ]);

  assert.deepEqual(createChartRows(model.series), [
    { categoryKey: "category-0", label: "Mon", "series-0": 18, "series-1": 8 },
    { categoryKey: "category-1", label: "Tue", "series-0": 24, "series-1": 14 },
    { categoryKey: "category-2", label: "Tue", "series-0": 6, "series-1": 4 },
  ]);
});

test("rejects mixed direct items and named series", () => {
  for (const rootName of ["BarChartCard", "LineChartCard"]) {
    assertError(
      () => composeChartModel(rootName, [item("Mon", 18), series("Paid", item("Mon", 12))]),
      `${rootName}: direct ChartItem and ChartSeries children cannot be mixed.`,
    );
  }
});

test("requires chart data and non-empty series", () => {
  for (const rootName of ["BarChartCard", "LineChartCard"]) {
    assertError(
      () => composeChartModel(rootName, [null, false, " \n ", annotation(20, "Target")]),
      `${rootName}: at least one ChartItem or ChartSeries is required.`,
    );
    assertError(
      () => composeChartModel(rootName, series("Empty", fragment(null, false, " \n "))),
      `${rootName}: ChartSeries "Empty" must contain at least one ChartItem.`,
    );
  }

  assertError(
    () => composeChartModel("PieChartCard", [null, false, true, " \n "]),
    "PieChartCard: at least one ChartItem is required.",
  );
});

test("rejects invalid root children with root-specific errors", () => {
  assertError(
    () => composeChartModel("BarChartCard", "visible text"),
    "BarChartCard: text children are not supported.",
  );
  assertError(
    () => composeChartModel("LineChartCard", 7),
    "LineChartCard: number children are not supported.",
  );
  assertError(
    () => composeChartModel("BarChartCard", React.createElement("span")),
    "BarChartCard: unsupported child element.",
  );
});

test("rejects misplaced and unsupported ChartSeries children", () => {
  assertError(
    () => composeChartModel("BarChartCard", series("Bad", annotation(20, "Target"))),
    "BarChartCard: ChartAnnotation must be a direct child, outside ChartSeries.",
  );

  for (const child of [
    "visible text",
    7,
    React.createElement("span"),
    series("Nested", item("Mon", 1)),
  ]) {
    assertError(
      () => composeChartModel("LineChartCard", series("Bad", child)),
      "LineChartCard: ChartSeries accepts only ChartItem children.",
    );
  }
});

test("rejects every unsupported pie child", () => {
  for (const child of [
    annotation(20, "Target"),
    series("Series", item("Mon", 1)),
    React.createElement("span"),
  ]) {
    assertError(
      () => composeChartModel("PieChartCard", child),
      "PieChartCard: only direct ChartItem children are supported.",
    );
  }

  assertError(
    () => composeChartModel("PieChartCard", "visible text"),
    "PieChartCard: text children are not supported.",
  );
  assertError(
    () => composeChartModel("PieChartCard", 7),
    "PieChartCard: number children are not supported.",
  );
});

test("computes mixed-sign stacked domains from separate positive and negative totals", () => {
  assert.deepEqual(
    composableBarDomain(
      [
        modelSeries("organic", "Organic", ["Mon", 10], ["Tue", 4]),
        modelSeries("paid", "Paid", ["Mon", -3], ["Tue", -6]),
      ],
      [
        { label: "Target", value: 12 },
        { label: "Floor", value: -8 },
      ],
      true,
    ),
    [-8, 12],
  );
});

test("pairs repeated labels by occurrence when computing stacked domains", () => {
  assert.deepEqual(
    composableBarDomain(
      [
        modelSeries("organic", "Organic", ["Tue", 10], ["Tue", 6]),
        modelSeries("paid", "Paid", ["Tue", -3], ["Tue", -5]),
      ],
      [],
      true,
    ),
    [-5, 10],
  );
});

test("computes all-negative stacked domains down to zero", () => {
  assert.deepEqual(
    composableBarDomain(
      [
        modelSeries("organic", "Organic", ["Mon", -4], ["Tue", -9]),
        modelSeries("paid", "Paid", ["Mon", -2], ["Tue", -3]),
      ],
      [{ label: "Floor", value: -10 }],
      true,
    ),
    [-12, 0],
  );
});

test("keeps positive-only stacked domains above zero", () => {
  assert.deepEqual(
    composableBarDomain(
      [
        modelSeries("organic", "Organic", ["Mon", 4], ["Tue", 7]),
        modelSeries("paid", "Paid", ["Mon", 2], ["Tue", 3]),
      ],
      [],
      true,
    ),
    [0, 10],
  );
});

test("keeps grouped bar domains based on individual values", () => {
  assert.deepEqual(
    composableBarDomain(
      [
        modelSeries("organic", "Organic", ["Mon", 4], ["Tue", 7]),
        modelSeries("paid", "Paid", ["Mon", 2], ["Tue", 3]),
      ],
      [],
      false,
    ),
    [0, 7],
  );
});
