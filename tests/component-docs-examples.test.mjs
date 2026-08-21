import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { compile } from "@mdx-js/mdx";
import {
  buildCombinedExampleMdx,
  buildComponentDocs,
  exampleContextAtLine,
  findLowercaseJsxTags,
} from "../scripts/component-docs/build.mjs";
import { MdxAnalyzer } from "../src/lib/mdx-analyzer.ts";
import { mdxCompileOptions } from "../src/lib/mdx-compile-options.ts";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const virtualPath = path.join(repoRoot, "documents", ".component-docs-examples.mdx");

test("all production component examples compile and pass the MDX Analyzer together", async () => {
  const { records } = buildComponentDocs({ repoRoot });
  const fixture = buildCombinedExampleMdx(records);
  assertProductionExampleContracts(records);
  assertNoLowercaseJsxTags(fixture, virtualPath);

  try {
    await compile(fixture.source, mdxCompileOptions);
  } catch (error) {
    throw new Error(formatExampleFailure(error, fixture, virtualPath, "compiler"), { cause: error });
  }

  const analyzer = new MdxAnalyzer();
  try {
    const diagnostics = await analyzer.diagnose(virtualPath, fixture.source);
    assert.deepEqual(diagnostics, [], formatAnalyzerDiagnostics(diagnostics, fixture, virtualPath));
  } finally {
    await analyzer.close();
  }
});

function assertProductionExampleContracts(records) {
  const examples = new Map(records.map((record) => [
    record.name,
    record.examples.map((example) => example.mdx).join("\n"),
  ]));

  assert.match(examples.get("BarChartCard"), /<BarChartCard[\s\S]*<ChartItem/);
  assert.match(examples.get("BarChartCard"), /<ChartSeries[\s\S]*<\/ChartSeries>/);
  assert.match(examples.get("BarChartCard"), /<BarChartCard[^>]*stacked/);
  assert.match(examples.get("LineChartCard"), /<LineChartCard[\s\S]*<ChartItem/);
  assert.match(examples.get("LineChartCard"), /<ChartSeries[\s\S]*<\/ChartSeries>/);
  assert.match(examples.get("LineChartCard"), /<ChartAnnotation value=\{20\} label="Target" \/>/);
  assert.match(examples.get("PieChartCard"), /<PieChartCard[\s\S]*<ChartItem/);
  assert.match(examples.get("Term"), /<Term definition="[^"]+">[^<]+<\/Term>/);
  assert.match(examples.get("Term"), /Later references to the contract stay plain text\./);
}

function formatAnalyzerDiagnostics(diagnostics, fixture, filePath) {
  return diagnostics
    .map((diagnostic) => {
      const line = diagnostic.range.start.line + 1;
      const column = diagnostic.range.start.character + 1;
      return `${exampleContext(line, fixture)} at ${filePath}:${line}:${column}: ${diagnostic.message}`;
    })
    .join("\n");
}

function formatExampleFailure(error, fixture, filePath, source) {
  const line = error?.line ?? error?.position?.start?.line ?? 1;
  const column = error?.column ?? error?.position?.start?.column ?? 1;
  return `${exampleContext(line, fixture)} at ${filePath}:${line}:${column}: ${source}: ${error.message}`;
}

function exampleContext(line, fixture) {
  const example = exampleContextAtLine(line, fixture.examples);
  return example ? `${example.component} / ${example.title}` : "Combined component examples";
}

function assertNoLowercaseJsxTags(fixture, filePath) {
  const invalidTags = findLowercaseJsxTags(fixture.source);

  if (invalidTags.length === 0) {
    return;
  }

  const tag = invalidTags[0];
  const line = fixture.source.slice(0, tag.index).split("\n").length;
  throw new Error(`${exampleContext(line, fixture)} at ${filePath}:${line}: raw HTML tag <${tag.name}> is not allowed in Agent MDX examples.`);
}
