import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createComponentDocsExtractor } from "../scripts/component-docs/extract.mjs";
import { renderComponentReference } from "../scripts/component-docs/render.mjs";
import { renderComponentIndex } from "../scripts/component-docs/build.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureRoot = fileURLToPath(new URL("./fixtures/component-docs", import.meta.url));
const extract = createComponentDocsExtractor({
  tsConfigFilePath: path.join(repoRoot, "tsconfig.json"),
  projectSourceRoot: fixtureRoot,
});

function extractFixture(catalogFilename = "catalog.ts", catalogName = "agentMdxComponentManifest") {
  return extractFixtureResult(catalogFilename, catalogName).records;
}

function extractFixtureResult(catalogFilename = "catalog.ts", catalogName = "agentMdxComponentManifest") {
  return extract({
    catalogPath: path.join(fixtureRoot, catalogFilename),
    catalogName,
  });
}

function extractCase(catalogName) {
  return extractFixture("cases.ts", catalogName);
}

const extractedRecords = extractFixture();
const extractProduction = createComponentDocsExtractor({
  tsConfigFilePath: path.join(repoRoot, "tsconfig.json"),
  projectSourceRoot: path.join(repoRoot, "src"),
});

function extractProductionCatalog() {
  return extractProductionCatalogResult().records;
}

function extractProductionCatalogResult() {
  return extractProduction({
    catalogPath: path.join(repoRoot, "src/components/mdx/mdx-components.tsx"),
  });
}

test("extracts deterministic source-backed records and renders the final references", async () => {
  assert.deepEqual(extractedRecords, extractFixture());
  assert.deepEqual(extractedRecords.map((record) => record.name), ["Metric", "Badge"]);

  for (const record of extractedRecords) {
    const expected = await readFile(path.join(fixtureRoot, "expected", `${record.name}.md`), "utf8");
    assert.equal(renderComponentReference({ root: record, members: [] }), expected, record.name);
  }
});

test("extracts the production manifest once into ordered grouped capabilities", () => {
  const first = extractProductionCatalogResult();
  const second = extractProductionCatalogResult();

  assert.deepEqual(first, second);
  assert.deepEqual(first.records.map((record) => record.name), [
    "Badge",
    "Button",
    "Icon",
    "Metric",
    "Progress",
    "Alert",
    "AlertTitle",
    "AlertDescription",
    "AlertAction",
    "Card",
    "CardHeader",
    "CardIcon",
    "CardTitle",
    "CardDescription",
    "CardAction",
    "CardContent",
    "CardFooter",
    "Collapsible",
    "CollapsibleTrigger",
    "CollapsibleContent",
    "Stack",
    "BarChartCard",
    "ChartItem",
    "ChartSeries",
    "ChartAnnotation",
    "LineChartCard",
    "PieChartCard",
    "CalendarCard",
    "ChatCard",
    "StockQuoteCard",
    "TodoListCard",
    "TweetCard",
  ]);
  assert.deepEqual(first.groups.map(({ title }) => title), [
    "UI elements",
    "Composition",
    "Charts",
    "Domain components",
  ]);
  assert.deepEqual(first.groups.map(({ capabilities }) => capabilities.map(({ root }) => root.name)), [
    ["Badge", "Button", "Icon", "Metric", "Progress"],
    ["Alert", "Card", "Collapsible", "Stack"],
    ["BarChartCard", "LineChartCard", "PieChartCard"],
    ["CalendarCard", "ChatCard", "StockQuoteCard", "TodoListCard", "TweetCard"],
  ]);

  const charts = first.groups[2].capabilities;
  assert.deepEqual(charts[0].members.map(({ record, required }) => [record.name, required]), [
    ["ChartItem", true],
    ["ChartSeries", false],
    ["ChartAnnotation", false],
  ]);
  assert.deepEqual(charts[1].members.map(({ record, required }) => [record.name, required]), [
    ["ChartItem", true],
    ["ChartSeries", false],
    ["ChartAnnotation", false],
  ]);
  assert.deepEqual(charts[2].members.map(({ record, required }) => [record.name, required]), [["ChartItem", true]]);
  assert.equal(charts[0].members[0].record, charts[1].members[0].record);
  assert.equal(charts[0].members[0].record, charts[2].members[0].record);

  for (const record of extractProductionCatalog()) {
    assert.doesNotThrow(() => renderComponentReference({ root: record, members: [] }), record.name);
  }
});

test("renders only roots in the ordered section index", () => {
  const { groups } = extractProductionCatalogResult();
  const rendered = renderComponentIndex(groups);

  assert.match(rendered, /### UI elements\n\n- \[Badge\]/);
  assert.match(rendered, /### Composition\n\n- \[Alert\][\s\S]*- \[Card\][\s\S]*- \[Collapsible\][\s\S]*- \[Stack\]/);
  assert.match(rendered, /### Charts\n\n- \[BarChartCard\][\s\S]*- \[LineChartCard\][\s\S]*- \[PieChartCard\]/);
  assert.match(rendered, /### Domain components\n\n- \[CalendarCard\]/);
  assert.doesNotMatch(rendered, /\[AlertTitle\]|\[ChartItem\]|\[CardContent\]/);
});

test("preserves root and referenced type source, raw defaults source, and propsTypeName", () => {
  const [metric] = extractedRecords;
  const defaultsSource = metric.defaultsInitializer;

  assert.equal(metric.propsTypeName, "MetricProps");
  assert.equal(metric.typeDeclarations.length, 2);
  assert.match(metric.typeDeclarations[0], /^export type MetricProps =/);
  assert.match(metric.typeDeclarations[1], /^export type MetricTrend =/);
  assert.equal(metric.defaultsInitializer, '{\n    changeType: "neutral",\n  }');
  assert.equal(metric.examples.length, 2);
  renderComponentReference({ root: metric, members: [] });
  assert.equal(metric.defaultsInitializer, defaultsSource);
});

test("preserves concise external React inheritance", () => {
  const [, badge] = extractedRecords;

  assert.equal(badge.propsTypeName, "BadgeProps");
  assert.equal(badge.typeDeclarations.length, 1);
  assert.match(badge.typeDeclarations[0], /^export type BadgeProps = React\.ComponentPropsWithoutRef<"span">/);
  assert.doesNotMatch(badge.typeDeclarations[0], /onClick|HTMLAttributes/);
});

test("requires a direct exported props declaration and one callable signature", () => {
  assert.throws(() => extractCase("catalogInlineProps"), /InlineProps must use an exported direct props alias or interface\./);
  assert.throws(() => extractCase("catalogPrivateRoot"), /PrivateRoot must use an exported direct props alias or interface\./);
  assert.throws(() => extractCase("catalogOverloaded"), /Overloaded must resolve to exactly one callable signature\./);
});

test("rejects unsafe catalog component names before documentation paths are built", () => {
  assert.throws(
    () => extractCase("catalogUnsafeName"),
    /Agent MDX component name "\.\.\/Reference" must match/,
  );
});

test("requires exported referenced types and JSDoc", () => {
  assert.throws(
    () => extractCase("catalogPrivateNested"),
    /PrivateNested must be exported because it appears in an Agent MDX prop type\./,
  );
  assert.throws(() => extractCase("catalogMissingDocs"), /MissingDocs: MissingDocsProps.label requires JSDoc\./);
});

test("follows exported local interfaces in stable declaration order", () => {
  const [record] = extractCase("catalogExtendedInterface");

  assert.equal(record.propsTypeName, "ExtendedInterfaceProps");
  assert.deepEqual(
    record.typeDeclarations.map((declaration) => declaration.match(/^export interface (\w+)/)?.[1]),
    ["ExtendedInterfaceProps", "BaseInterfaceProps", "NestedInterfaceProps"],
  );
});

test("requires exported typed static metadata", () => {
  assert.throws(() => extractCase("catalogPrivateMetadata"), /PrivateMetadata: privateMetadataMdxDocs must be exported\./);
  assert.throws(() => extractCase("catalogMissingMetadata"), /MissingMetadata must export missingMetadataMdxDocs\./);
  assert.throws(
    () => extractCase("catalogUntypedMetadata"),
    /UntypedMetadata: untypedMetadataMdxDocs must satisfy AgentMdxComponentDocs<SharedProps>\./,
  );
  assert.throws(
    () => extractCase("catalogWrongContract"),
    /WrongContract: wrongContractMdxDocs must satisfy AgentMdxComponentDocs<SharedProps>\./,
  );
  assert.throws(
    () => extractCase("catalogWrongProps"),
    /WrongProps: wrongPropsMdxDocs must satisfy AgentMdxComponentDocs<WrongComponentProps>\./,
  );
});

test("rejects project-local typeof queries that cannot stand alone in a reference", () => {
  assert.throws(
    () => extractCase("catalogTypeQuery"),
    /TypeQuery: TypeQueryProps cannot use a project-local typeof query in an Agent MDX prop type\./,
  );
});

test("rejects non-static metadata shapes", () => {
  for (const catalogName of [
    "catalogMetadataSpread",
    "catalogComputedMetadata",
    "catalogShorthandMetadata",
  ]) {
    assert.throws(() => extractCase(catalogName), /must use static property assignments\./);
  }

  for (const catalogName of [
    "catalogCallableMetadata",
    "catalogPropertyReadMetadata",
    "catalogExampleSpread",
    "catalogInvalidUnaryDefaults",
  ]) {
    assert.throws(() => extractCase(catalogName), /must contain only static literals\./);
  }
});

test("accepts plus and minus numeric defaults only", () => {
  const [record] = extractCase("catalogStaticUnaryDefaults");

  assert.equal(record.defaultsInitializer, "{ positive: +1, negative: -1 }");
});

test("validates flow and example count and titles", () => {
  assert.throws(() => extractCase("catalogInvalidFlow"), /invalidFlowMdxDocs.flow must be inline or block\./);
  assert.throws(
    () => extractCase("catalogNoExamples"),
    /NoExamples\.examples must contain one or two examples unless the component is a family member\./,
  );
  assert.throws(() => extractCase("catalogManyExamples"), /manyExamplesMdxDocs.examples must contain zero, one, or two examples\./);
  assert.throws(() => extractCase("catalogDuplicateExamples"), /duplicateExamplesMdxDocs.examples titles must be unique: Repeated\./);
});

test("extracts and renders an ordered family capability", () => {
  const result = extractFixtureResult("cases.ts", "catalogFamily");
  const [root, member] = result.records;
  const [capability] = result.groups[0].capabilities;

  assert.equal(capability.root, root);
  assert.deepEqual(capability.members, [{ record: member, required: true }]);
  const rendered = renderComponentReference(capability);
  assert.match(rendered, /FamilyPart \(Required\)/);
  assert.match(rendered, /### FamilyPart/);
  assert.match(rendered, /A family member fixture\./);
  assert.equal(rendered.match(/Place FamilyPart directly inside FamilyRoot\./g)?.length, 1);
  const emptyMemberRendered = renderComponentReference({
    ...capability,
    members: [{ ...capability.members[0], record: { ...member, examples: [] } }],
  });
  assert.doesNotMatch(emptyMemberRendered.slice(emptyMemberRendered.indexOf("### FamilyPart")), /#### Examples/);
});

test("validates capability topology and family authoring contracts", () => {
  const invalidCases = [
    ["catalogRootMissingFromComponents", /root Missing must name a component/],
    ["catalogRootNotFirst", /must place the root component first/],
    ["catalogUnknownRequiredMember", /required references unknown member\(s\): Missing/],
    ["catalogDuplicateRoot", /FamilyRoot must be the root of only one capability/],
    ["catalogMismatchedSharedMember", /FamilyPart must resolve to the same component symbol/],
    ["catalogFamilyMissingGuidance", /requires root guidance describing its hierarchy/],
    ["catalogFamilyIncompleteExample", /must contain the root and every family member\. Missing: StaticUnaryDefaults/],
  ];

  for (const [catalogName, error] of invalidCases) {
    assert.throws(() => extractCase(catalogName), error, catalogName);
  }
});
