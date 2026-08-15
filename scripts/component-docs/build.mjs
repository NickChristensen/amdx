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
  const records = extract({
    catalogPath: path.join(resolvedRepoRoot, "src/components/mdx/mdx-components.tsx"),
  });
  const entries = resolveComponentFamilies(records);

  return {
    records,
    componentIndex: renderComponentIndex(entries),
    references: new Map(entries.map(({ root, members }) => [
      `${root.name}.md`,
      renderComponentReference(root, members),
    ])),
  };
}

/**
 * Resolves root-owned family metadata into the generated documentation entries.
 * The returned entries own the public index and reference files. `records`
 * remains the complete catalog so the example compiler can validate members.
 */
export function resolveComponentFamilies(records) {
  const recordsByName = new Map(records.map((record) => [record.name, record]));
  const familyMembership = new Map();
  const familiesByRoot = new Map();

  for (const root of records) {
    if (!root.family) {
      continue;
    }

    if (root.family.length === 0) {
      throw new Error(`${root.name}.family must contain at least one member.`);
    }

    if (!root.guidance || root.guidance.length === 0) {
      throw new Error(`${root.name}.family requires root guidance describing its hierarchy.`);
    }

    const memberRecords = [];
    const seenMembers = new Set();

    for (const familyMember of root.family) {
      const memberName = familyMember.name;

      if (seenMembers.has(memberName)) {
        throw new Error(`${root.name}.family members must be unique: ${memberName}.`);
      }

      seenMembers.add(memberName);
      const member = recordsByName.get(memberName);

      if (!member) {
        throw new Error(`${root.name}.family references unknown component ${memberName}.`);
      }

      if (memberName === root.name) {
        throw new Error(`${root.name}.family cannot include its root component.`);
      }

      if (member.family) {
        throw new Error(`${root.name}.family member ${memberName} cannot declare its own family.`);
      }

      const previousRoot = familyMembership.get(memberName);

      if (previousRoot) {
        throw new Error(`${memberName} belongs to multiple families: ${previousRoot} and ${root.name}.`);
      }

      familyMembership.set(memberName, root.name);
      memberRecords.push(member);
    }

    assertCompleteFamilyExample(root, root.family.map(({ name }) => name));
    familiesByRoot.set(root.name, memberRecords);
  }

  return records
    .filter((record) => !familyMembership.has(record.name) || familiesByRoot.has(record.name))
    .map((root) => ({ root, members: familiesByRoot.get(root.name) ?? [] }));
}

export function renderComponentIndex(entries) {
  return [
    "## Components",
    "",
    ...entries.map(({ root }) => `- [${root.name}](references/${root.name}.md): ${capitalize(root.flow)}. ${root.description}`),
  ].join("\n");
}

function assertCompleteFamilyExample(root, members) {
  const example = root.examples[0];
  const tags = new Set([...example.mdx.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]));
  const missing = [root.name, ...members].filter((name) => !tags.has(name));

  if (missing.length > 0) {
    throw new Error(`${root.name}.examples[0] must contain the root and every family member. Missing: ${missing.join(", ")}.`);
  }
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
