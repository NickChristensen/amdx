import path from "node:path";
import { fileURLToPath } from "node:url";
import { createComponentDocsExtractor } from "./extract.mjs";
import { renderComponentReference } from "./render.mjs";

export const componentIndexBeginMarker = "<!-- BEGIN GENERATED COMPONENT INDEX -->";
export const componentIndexEndMarker = "<!-- END GENERATED COMPONENT INDEX -->";

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Reads the live Agent MDX source catalog and derives every generated output.
 * This function has no filesystem writes, so tests and the generator share one
 * deterministic source of expected documentation.
 */
export function buildComponentDocs({ repoRoot = defaultRepoRoot } = {}) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const extract = createComponentDocsExtractor({
    tsConfigFilePath: path.join(resolvedRepoRoot, "tsconfig.json"),
    projectSourceRoot: path.join(resolvedRepoRoot, "src"),
  });
  const { records, groups } = extract({
    catalogPath: path.join(resolvedRepoRoot, "src/components/mdx/mdx-components.tsx"),
  });
  const entries = groups.flatMap(({ capabilities }) => capabilities);

  return {
    records,
    componentIndex: renderComponentIndex(groups),
    references: new Map(entries.map((capability) => [
      `${capability.root.name}.md`,
      renderComponentReference(capability),
    ])),
  };
}

export function renderComponentIndex(groups) {
  return [
    "## Components",
    ...groups.map(({ title, capabilities }) => [
      `### ${title}`,
      "",
      ...capabilities.map(renderComponentIndexEntry),
    ].join("\n")),
  ].join("\n\n");
}

function renderComponentIndexEntry({ root }) {
  return `- [${root.name}](references/${root.name}.md): ${capitalize(root.flow)}. ${root.description}`;
}

export function replaceGeneratedComponentIndex(skillSource, componentIndex) {
  const { begin, end } = generatedComponentIndexBounds(skillSource);

  const before = skillSource.slice(0, begin + componentIndexBeginMarker.length);
  const after = skillSource.slice(end);
  return `${before}\n${componentIndex}\n${after}`;
}

export function extractGeneratedComponentIndex(skillSource) {
  const { begin, end } = generatedComponentIndexBounds(skillSource);
  return skillSource.slice(begin + componentIndexBeginMarker.length, end).trim();
}

export function buildCombinedExampleMdx(records) {
  const lines = [
    "---",
    "title: Agent MDX component examples",
    "agent: component-docs-test",
    "created: 2000-01-01T00:00:00Z",
    "---",
    "",
    "# Agent MDX component examples",
  ];
  const examples = [];

  for (const record of records) {
    for (const example of record.examples) {
      lines.push("", `## ${record.name}: ${example.title}`, "");
      const startLine = lines.length + 1;
      lines.push(...example.mdx.split("\n"));
      examples.push({
        component: record.name,
        title: example.title,
        startLine,
        endLine: lines.length,
      });
    }
  }

  return { source: `${lines.join("\n")}\n`, examples };
}

export function findLowercaseJsxTags(source) {
  return [...source.matchAll(/<\/?([a-z][A-Za-z0-9-]*)\b/g)].map((match) => ({
    name: match[1],
    index: match.index,
  }));
}

export function exampleContextAtLine(line, examples) {
  const containingExample = examples.find((entry) => line >= entry.startLine && line <= entry.endLine);

  if (containingExample) {
    return containingExample;
  }

  return examples.filter((entry) => entry.startLine <= line).at(-1);
}

function findSingleMarker(source, marker) {
  const first = source.indexOf(marker);

  if (first === -1) {
    throw new Error(`SKILL.md is missing generated component index marker: ${marker}.`);
  }

  if (source.indexOf(marker, first + marker.length) !== -1) {
    throw new Error(`SKILL.md has duplicate generated component index marker: ${marker}.`);
  }

  return first;
}

function generatedComponentIndexBounds(skillSource) {
  const begin = findSingleMarker(skillSource, componentIndexBeginMarker);
  const end = findSingleMarker(skillSource, componentIndexEndMarker);

  if (begin > end) {
    throw new Error(`Generated component index markers are reversed in SKILL.md: ${componentIndexEndMarker} appears before ${componentIndexBeginMarker}.`);
  }

  return { begin, end };
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
