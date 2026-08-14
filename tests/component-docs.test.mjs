import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createComponentDocsExtractor } from "../scripts/component-docs/extract.mjs";
import { renderComponentReference } from "../scripts/component-docs/render.mjs";

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

test("extracts deterministic source-backed records and renders the final references", async () => {
  assert.deepEqual(extractedRecords, extractFixture());
  assert.deepEqual(extractedRecords.map((record) => record.name), ["Metric", "Badge"]);

  for (const record of extractedRecords) {
    const expected = await readFile(path.join(fixtureRoot, "expected", `${record.name}.md`), "utf8");
    assert.equal(renderComponentReference(record), expected, record.name);
  }
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
