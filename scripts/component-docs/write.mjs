import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { replaceGeneratedComponentIndex } from "./build.mjs";

/**
 * Synchronizes only the generated skill section and generated reference files.
 * Callers supply paths so tests can exercise orphan removal in an isolated tree.
 */
export async function synchronizeComponentDocs({ skillPath, referencesDirectory, output }) {
  for (const filename of output.references.keys()) {
    assertSafeReferenceFilename(filename, referencesDirectory);
  }

  const skillSource = await readFile(skillPath, "utf8");
  const updatedSkillSource = replaceGeneratedComponentIndex(skillSource, output.componentIndex);

  await writeIfChanged(skillPath, updatedSkillSource);
  await mkdir(referencesDirectory, { recursive: true });

  for (const [filename, source] of output.references) {
    await writeIfChanged(path.join(referencesDirectory, filename), source);
  }

  for (const entry of await generatedReferenceEntries(referencesDirectory)) {
    if (!output.references.has(entry)) {
      await unlink(path.join(referencesDirectory, entry));
    }
  }
}

export function assertSafeReferenceFilename(filename, referencesDirectory) {
  if (typeof filename !== "string" || !/^[A-Z][A-Za-z0-9]*\.md$/.test(filename)) {
    throw new Error(`Generated component reference filename ${JSON.stringify(filename)} must be a contained capitalized .md filename.`);
  }

  const resolvedDirectory = path.resolve(referencesDirectory);
  const resolvedFile = path.resolve(resolvedDirectory, filename);
  const relative = path.relative(resolvedDirectory, resolvedFile);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Generated component reference filename ${JSON.stringify(filename)} must be a contained capitalized .md filename.`);
  }
}

export async function generatedReferenceEntries(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeIfChanged(filePath, source) {
  const current = await readFile(filePath, "utf8").catch((error) => {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  });

  if (current !== source) {
    await writeFile(filePath, source, "utf8");
  }
}
