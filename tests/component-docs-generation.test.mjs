import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import {
  componentIndexBeginMarker,
  componentIndexEndMarker,
  exampleContextAtLine,
  findLowercaseJsxTags,
  replaceGeneratedComponentIndex,
} from "../scripts/component-docs/build.mjs";
import { assertSafeReferenceFilename, synchronizeComponentDocs } from "../scripts/component-docs/write.mjs";

const temporaryDirectories = [];

after(async () => {
  await Promise.all(temporaryDirectories.map((directory) => rm(directory, { recursive: true, force: true })));
});

test("replaces only the bounded generated skill section", () => {
  const prefix = "header bytes\r\nhandwritten before\n";
  const suffix = "\nhandwritten after\r\ntrailer bytes";
  const source = `${prefix}${componentIndexBeginMarker}\nold generated content\n${componentIndexEndMarker}${suffix}`;
  const result = replaceGeneratedComponentIndex(source, "## Components\n\n- [Metric](references/Metric.md): Block. Value.");

  assert.equal(
    result,
    `${prefix}${componentIndexBeginMarker}\n## Components\n\n- [Metric](references/Metric.md): Block. Value.\n${componentIndexEndMarker}${suffix}`,
  );
});

test("rejects missing, duplicate, and reversed generated skill markers", () => {
  assert.throws(
    () => replaceGeneratedComponentIndex("handwritten", "generated"),
    /missing generated component index marker/i,
  );
  assert.throws(
    () => replaceGeneratedComponentIndex(`${componentIndexBeginMarker}\n${componentIndexBeginMarker}\n${componentIndexEndMarker}`, "generated"),
    /duplicate generated component index marker/i,
  );
  assert.throws(
    () => replaceGeneratedComponentIndex(`${componentIndexBeginMarker}\n${componentIndexEndMarker}\n${componentIndexEndMarker}`, "generated"),
    /duplicate generated component index marker/i,
  );
  assert.throws(
    () => replaceGeneratedComponentIndex(`${componentIndexEndMarker}\n${componentIndexBeginMarker}`, "generated"),
    /markers are reversed/i,
  );
});

test("finds raw HTML tags and maps parser errors after an example to its nearest context", () => {
  assert.deepEqual(findLowercaseJsxTags("<span>Text</span>"), [
    { name: "span", index: 0 },
    { name: "span", index: 10 },
  ]);
  assert.deepEqual(
    exampleContextAtLine(99, [
      { component: "Metric", title: "Basic", startLine: 10, endLine: 10 },
      { component: "Stack", title: "Layout", startLine: 20, endLine: 22 },
    ]),
    { component: "Stack", title: "Layout", startLine: 20, endLine: 22 },
  );
});

test("removes orphaned generated references in an isolated directory", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "amdx-component-docs-"));
  temporaryDirectories.push(directory);
  const skillPath = path.join(directory, "SKILL.md");
  const referencesDirectory = path.join(directory, "references");
  await writeFile(skillPath, `before\n${componentIndexBeginMarker}\nold\n${componentIndexEndMarker}\nafter\n`, "utf8");
  await mkdir(referencesDirectory);
  await writeFile(path.join(referencesDirectory, "Metric.md"), "stale\n", "utf8");
  await writeFile(path.join(referencesDirectory, "Retired.md"), "orphan\n", "utf8");

  await synchronizeComponentDocs({
    skillPath,
    referencesDirectory,
    output: {
      componentIndex: "## Components\n\n- [Metric](references/Metric.md): Block. Value.",
      references: new Map([["Metric.md", "generated\n"]]),
    },
  });

  assert.equal(
    await readFile(skillPath, "utf8"),
    `before\n${componentIndexBeginMarker}\n## Components\n\n- [Metric](references/Metric.md): Block. Value.\n${componentIndexEndMarker}\nafter\n`,
  );
  assert.deepEqual(await readdir(referencesDirectory), ["Metric.md"]);
  assert.equal(await readFile(path.join(referencesDirectory, "Metric.md"), "utf8"), "generated\n");
});

test("rejects references that escape the generated reference directory", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "amdx-component-docs-"));
  temporaryDirectories.push(directory);
  const skillPath = path.join(directory, "SKILL.md");
  const referencesDirectory = path.join(directory, "references");
  const skillSource = `before\n${componentIndexBeginMarker}\nold\n${componentIndexEndMarker}\nafter\n`;
  await writeFile(skillPath, skillSource, "utf8");

  assert.throws(
    () => assertSafeReferenceFilename("../outside.md", referencesDirectory),
    /must be a contained capitalized .md filename/,
  );
  await assert.rejects(
    () => synchronizeComponentDocs({
      skillPath,
      referencesDirectory,
      output: {
        componentIndex: "generated",
        references: new Map([["../outside.md", "unsafe\n"]]),
      },
    }),
    /must be a contained capitalized .md filename/,
  );
  assert.equal(await readFile(skillPath, "utf8"), skillSource);
});
