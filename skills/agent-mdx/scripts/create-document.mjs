#!/usr/bin/env node

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

function pad(value) {
  return String(value).padStart(2, "0");
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localTimestamp(date = new Date()) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetRemainder = Math.abs(offsetMinutes) % 60;

  return `${localDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${pad(offsetHours)}:${pad(offsetRemainder)}`;
}

export function slugifyTitle(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function agentFromWorkspace(cwd, openClawDirectory = path.join(os.homedir(), ".openclaw")) {
  const [resolvedCwd, resolvedOpenClaw] = await Promise.all([
    fs.realpath(cwd),
    fs.realpath(openClawDirectory),
  ]);
  const relative = path.relative(resolvedOpenClaw, resolvedCwd);

  if (relative === "" || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error("Run this command from an OpenClaw workspace under ~/.openclaw/workspace or ~/.openclaw/workspace-<agent>.");
  }

  const [workspace] = relative.split(path.sep);
  if (workspace === "workspace") {
    return "main";
  }

  const match = /^workspace-([a-z0-9][a-z0-9_-]*)$/.exec(workspace);
  if (!match) {
    throw new Error("Run this command from an OpenClaw workspace under ~/.openclaw/workspace or ~/.openclaw/workspace-<agent>.");
  }

  return match[1];
}

async function canonicalProjectRoot() {
  const scriptPath = await fs.realpath(fileURLToPath(import.meta.url));
  return path.resolve(path.dirname(scriptPath), "../../..");
}

export async function createDocument(title, options = {}) {
  const normalizedTitle = title?.trim();
  if (!normalizedTitle) {
    throw new Error("A non-empty document title is required as the first argument.");
  }

  const slug = slugifyTitle(normalizedTitle);
  if (!slug) {
    throw new Error("The document title must contain at least one letter or number for its URL slug.");
  }

  const now = options.now ?? new Date();
  const date = localDate(now);
  const agent = await agentFromWorkspace(
    options.cwd ?? process.cwd(),
    options.openClawDirectory,
  );
  const projectRoot = options.projectRoot ?? await canonicalProjectRoot();
  const directory = path.join(projectRoot, "documents", date, agent);
  await fs.mkdir(directory, { recursive: true });

  const source = `---\ntitle: ${JSON.stringify(normalizedTitle)}\nagent: ${JSON.stringify(agent)}\ncreated: ${JSON.stringify(localTimestamp(now))}\n---\n\n# ${normalizedTitle}\n`;

  for (let suffix = 1; ; suffix += 1) {
    const filename = suffix === 1 ? `${slug}.mdx` : `${slug}-${suffix}.mdx`;
    const documentPath = path.join(directory, filename);

    try {
      await fs.writeFile(documentPath, source, { encoding: "utf8", flag: "wx" });
      return documentPath;
    } catch (error) {
      if (error?.code !== "EEXIST") {
        throw error;
      }
    }
  }
}

async function main() {
  const [title, ...extraArguments] = process.argv.slice(2);
  if (!title || extraArguments.length > 0) {
    console.error('Usage: {skillDir}/scripts/create-document.mjs "<title>"');
    process.exitCode = 64;
    return;
  }

  try {
    console.log(await createDocument(title));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

async function isMainModule() {
  if (!process.argv[1]) {
    return false;
  }

  const [modulePath, entryPath] = await Promise.all([
    fs.realpath(fileURLToPath(import.meta.url)),
    fs.realpath(process.argv[1]),
  ]);
  return modulePath === entryPath;
}

if (await isMainModule()) {
  await main();
}
