import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildComponentDocs,
  componentIndexBeginMarker,
  componentIndexEndMarker,
  extractGeneratedComponentIndex,
  replaceGeneratedComponentIndex,
} from "../scripts/component-docs/build.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const skillPath = path.join(repoRoot, "skills/agent-mdx/SKILL.md");
const referencesDirectory = path.join(repoRoot, "skills/agent-mdx/references");
const repair = "Run npm run generate:component-docs to update generated component documentation.";

test("generated Agent MDX component documentation has no drift", async () => {
  const output = buildComponentDocs({ repoRoot });
  const skillSource = await readFile(skillPath, "utf8");
  const actualComponentIndex = extractGeneratedComponentIndex(skillSource);

  assert.equal(actualComponentIndex, output.componentIndex, `skills/agent-mdx/SKILL.md has generated component index drift. ${repair}`);

  const entries = await referenceMarkdownFiles();
  const expectedNames = [...output.references.keys()].sort();
  const missing = expectedNames.filter((name) => !entries.includes(name));
  const orphaned = entries.filter((name) => !output.references.has(name));
  assert.deepEqual(missing, [], `Generated references are missing: ${missing.join(", ")}. ${repair}`);
  assert.deepEqual(orphaned, [], `Generated references are orphaned: ${orphaned.join(", ")}. ${repair}`);

  for (const [name, expected] of output.references) {
    const actual = await readFile(path.join(referencesDirectory, name), "utf8");
    assert.equal(actual, expected, `skills/agent-mdx/references/${name} has drift. ${repair}`);
  }
});

test("checks only the generated component index when validating SKILL.md drift", async () => {
  const output = buildComponentDocs({ repoRoot });
  const skillSource = `handwritten before\n${componentIndexBeginMarker}\n\n${output.componentIndex}\n\n${componentIndexEndMarker}\nhandwritten after`;
  const proseOnlyChange = skillSource.replace("handwritten before", "updated handwritten prose");
  const componentIndexChange = replaceGeneratedComponentIndex(skillSource, `${output.componentIndex}\n- [Unexpected](references/Unexpected.md): Block. Drift.`);

  assert.equal(extractGeneratedComponentIndex(proseOnlyChange), output.componentIndex);
  assert.notEqual(extractGeneratedComponentIndex(componentIndexChange), output.componentIndex);
});

async function referenceMarkdownFiles() {
  try {
    return (await readdir(referencesDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}
