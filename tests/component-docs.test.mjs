import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createComponentDocsExtractor } from "../scripts/component-docs/extract.mjs";
import { renderComponentReference } from "../scripts/component-docs/render.mjs";
import { resolveComponentFamilies } from "../scripts/component-docs/build.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureRoot = fileURLToPath(new URL("./fixtures/component-docs", import.meta.url));
const extract = createComponentDocsExtractor({
  tsConfigFilePath: path.join(repoRoot, "tsconfig.json"),
  projectSourceRoot: fixtureRoot,
});

function extractFixture(catalogFilename = "catalog.ts", catalogName = "agentMdxComponents") {
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
  return extractProduction({
    catalogPath: path.join(repoRoot, "src/components/mdx/mdx-components.tsx"),
  });
}

test("extracts deterministic source-backed records and renders the final references", async () => {
  assert.deepEqual(extractedRecords, extractFixture());
  assert.deepEqual(extractedRecords.map((record) => record.name), ["Metric", "Badge"]);

  for (const record of extractedRecords) {
    const expected = await readFile(path.join(fixtureRoot, "expected", `${record.name}.md`), "utf8");
    assert.equal(renderComponentReference(record), expected, record.name);
  }
});

test("extracts and renders the production agent MDX catalog", () => {
  const records = extractProductionCatalog();

  assert.deepEqual(records.map((record) => record.name), [
    "Alert",
    "AlertAction",
    "AlertDescription",
    "AlertTitle",
    "Badge",
    "BarGraphCard",
    "CalendarCard",
    "Card",
    "CardAction",
    "CardContent",
    "CardDescription",
    "CardFooter",
    "CardHeader",
    "CardIcon",
    "CardTitle",
    "ChatCard",
    "Collapsible",
    "CollapsibleContent",
    "CollapsibleTrigger",
    "Icon",
    "LineGraphCard",
    "Metric",
    "Progress",
    "Stack",
    "StockQuoteCard",
    "TodoListCard",
    "TweetCard",
  ]);

  for (const record of records) {
    assert.doesNotThrow(() => renderComponentReference(record), record.name);
  }

  assert.deepEqual(records.find((record) => record.name === "Alert").family, [
    { name: "AlertTitle", required: false },
    { name: "AlertDescription", required: true },
    { name: "AlertAction", required: false },
  ]);
  assert.deepEqual(records.find((record) => record.name === "Collapsible").family, [
    { name: "CollapsibleTrigger", required: true },
    { name: "CollapsibleContent", required: true },
  ]);
  assert.deepEqual(records.find((record) => record.name === "Card").family, [
    { name: "CardHeader", required: false },
    { name: "CardIcon", required: false },
    { name: "CardTitle", required: false },
    { name: "CardDescription", required: false },
    { name: "CardAction", required: false },
    { name: "CardContent", required: true },
    { name: "CardFooter", required: false },
  ]);
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
  renderComponentReference(metric);
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
  assert.throws(() => extractCase("catalogNoExamples"), /noExamplesMdxDocs.examples must contain one or two examples\./);
  assert.throws(() => extractCase("catalogManyExamples"), /manyExamplesMdxDocs.examples must contain one or two examples\./);
  assert.throws(() => extractCase("catalogDuplicateExamples"), /duplicateExamplesMdxDocs.examples titles must be unique: Repeated\./);
});

test("extracts and renders a root-owned family", () => {
  const records = extractCase("catalogFamily");
  const [root, member] = records;

  assert.deepEqual(root.family, [{ name: "FamilyPart", required: true }]);
  assert.deepEqual(resolveComponentFamilies(records), [{ root, members: [member] }]);
  const rendered = renderComponentReference(root, [member]);
  assert.match(rendered, /FamilyPart \(Required\)/);
  assert.match(rendered, /### FamilyPart/);
  assert.match(rendered, /A family member fixture\./);
  assert.equal(rendered.match(/Place FamilyPart directly inside FamilyRoot\./g)?.length, 1);
});

test("validates family relationships and complete root examples", () => {
  const record = (name, family, mdx = `<${name} />`, guidance = ["Use the root with its family members."]) => ({
    name,
    family: family?.map((member) => (typeof member === "string" ? { name: member, required: true } : member)),
    description: `${name} description`,
    flow: "block",
    defaultsInitializer: "{}",
    propsTypeName: `${name}Props`,
    typeDeclarations: [`export type ${name}Props = {};`],
    guidance,
    examples: [{ title: "Example", mdx }],
  });

  assert.throws(
    () => resolveComponentFamilies([record("Root", ["Missing"], "<Root />")]),
    /Root\.family references unknown component Missing\./,
  );
  assert.throws(
    () => resolveComponentFamilies([
      record("Root", ["Part", "Part"], "<Root><Part /></Root>"),
      record("Part"),
    ]),
    /Root\.family members must be unique: Part\./,
  );
  assert.throws(
    () => resolveComponentFamilies([
      record("Root", ["Part"], "<Root><Part /></Root>"),
      record("OtherRoot", ["Part"], "<OtherRoot><Part /></OtherRoot>"),
      record("Part"),
    ]),
    /Part belongs to multiple families: Root and OtherRoot\./,
  );
  assert.throws(
    () => resolveComponentFamilies([
      record("Root", ["Part"], "<Root><Part /></Root>"),
      record("Part", ["Nested"], "<Part><Nested /></Part>"),
      record("Nested"),
    ]),
    /Root\.family member Part cannot declare its own family\./,
  );
  assert.throws(
    () => resolveComponentFamilies([
      record("Root", ["Part"], "<Root />"),
      record("Part"),
    ]),
    /Root\.examples\[0\] must contain the root and every family member\. Missing: Part\./,
  );
  assert.throws(
    () => resolveComponentFamilies([
      record("Root", ["Part"], "<Root><Part /></Root>", []),
      record("Part"),
    ]),
    /Root\.family requires root guidance describing its hierarchy\./,
  );
});

test("rejects malformed static family member metadata", () => {
  const invalidCases = [
    ["catalogFamilyMissingRequired", /familyMissingRequiredMdxDocs\.family\[0\] is missing required field\(s\): required\./],
    ["catalogFamilyExtraField", /familyExtraFieldMdxDocs\.family\[0\] has unsupported field\(s\): extra\./],
    ["catalogFamilyComputedField", /familyComputedFieldMdxDocs\.family\[0\] must use exactly static name and required property assignments\./],
    ["catalogFamilySpread", /familySpreadMdxDocs\.family\[0\] must use exactly static name and required property assignments\./],
    ["catalogFamilyNonliteralName", /familyNonliteralNameMdxDocs\.family\[0\]\.name must be a string literal\./],
    ["catalogFamilyNonliteralRequired", /familyNonliteralRequiredMdxDocs\.family\[0\]\.required must be a boolean literal\./],
    ["catalogFamilyNonliteralArray", /familyNonliteralArrayMdxDocs\.family must be a non-empty array of member objects\./],
  ];

  for (const [catalogName, error] of invalidCases) {
    assert.throws(() => extractCase(catalogName), error, catalogName);
  }
});
