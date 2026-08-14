import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { matter } from "vfile-matter";
import { VFile } from "vfile";
import {
  agentFromWorkspace,
  createDocument,
  localDate,
  localTimestamp,
  slugifyTitle,
} from "../skills/agent-mdx/scripts/create-document.mjs";

const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "amdx-create-document-"));
const openClawDirectory = path.join(fixtureRoot, ".openclaw");
const projectRoot = path.join(fixtureRoot, "amdx");
const skillScript = fileURLToPath(new URL("../skills/agent-mdx/scripts/create-document.mjs", import.meta.url));

after(async () => {
  await fs.rm(fixtureRoot, { recursive: true, force: true });
});

test("derives main and named agents from workspace descendants", async () => {
  const mainDirectory = path.join(openClawDirectory, "workspace", "notes");
  const namedDirectory = path.join(openClawDirectory, "workspace-finances", "state");
  await Promise.all([
    fs.mkdir(mainDirectory, { recursive: true }),
    fs.mkdir(namedDirectory, { recursive: true }),
  ]);

  assert.equal(await agentFromWorkspace(mainDirectory, openClawDirectory), "main");
  assert.equal(await agentFromWorkspace(namedDirectory, openClawDirectory), "finances");
});

test("uses the resolved workspace path and rejects other directories", async () => {
  const workspace = path.join(openClawDirectory, "workspace-fitness");
  const linkedWorkspace = path.join(fixtureRoot, "linked-workspace");
  const outside = path.join(fixtureRoot, "outside");
  await Promise.all([
    fs.mkdir(workspace, { recursive: true }),
    fs.mkdir(outside, { recursive: true }),
  ]);
  await fs.symlink(workspace, linkedWorkspace);

  assert.equal(await agentFromWorkspace(linkedWorkspace, openClawDirectory), "fitness");
  await assert.rejects(
    agentFromWorkspace(outside, openClawDirectory),
    /Run this command from an OpenClaw workspace/,
  );
});

test("creates safe front matter and collision suffixes", async () => {
  const cwd = path.join(openClawDirectory, "workspace-finances");
  const now = new Date(2026, 7, 14, 9, 8, 7);
  await fs.mkdir(cwd, { recursive: true });

  const options = { cwd, now, openClawDirectory, projectRoot };
  const firstPath = await createDocument('Morning: "Briefing"', options);
  const secondPath = await createDocument('Morning: "Briefing"', options);

  assert.equal(firstPath, path.join(projectRoot, "documents", localDate(now), "finances", "morning-briefing.mdx"));
  assert.equal(secondPath, path.join(projectRoot, "documents", localDate(now), "finances", "morning-briefing-2.mdx"));

  const file = new VFile(await fs.readFile(firstPath, "utf8"));
  matter(file);
  assert.deepEqual(file.data.matter, {
    title: 'Morning: "Briefing"',
    agent: "finances",
    created: localTimestamp(now),
  });
});

test("prints only the created absolute path", async () => {
  const workspace = path.join(openClawDirectory, "workspace");
  const title = `CLI output ${process.pid}-${Date.now()}`;
  await fs.mkdir(workspace, { recursive: true });

  const child = spawn(skillScript, [title], {
    cwd: workspace,
    env: { ...process.env, HOME: fixtureRoot },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", resolve);
  });

  assert.equal(exitCode, 0, stderr);
  const documentPath = stdout.trim();
  assert.equal(stdout, `${documentPath}\n`);
  assert.equal(path.isAbsolute(documentPath), true);

  await fs.rm(documentPath, { force: true });
});

test("slugifies titles and rejects titles without a usable slug", async () => {
  assert.equal(slugifyTitle("  Café & Revenue  "), "cafe-revenue");
  await assert.rejects(
    createDocument("💰", {
      cwd: path.join(openClawDirectory, "workspace"),
      openClawDirectory,
      projectRoot,
    }),
    /must contain at least one letter or number/,
  );
});
