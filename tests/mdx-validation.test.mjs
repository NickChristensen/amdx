import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";
import {
  AMDX_DOCUMENTS_DIR,
  documentRoute,
  routeToDocumentPath,
  userFacingUrl,
} from "../src/lib/amdx-document-paths.ts";
import { MdxAnalyzer } from "../src/lib/mdx-analyzer.ts";
import {
  formatAmdxDiagnostic,
  validateAmdx,
} from "../src/lib/validate-amdx.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const agent = `validator-test-${process.pid}`;
const documentDirectory = path.join(AMDX_DOCUMENTS_DIR, "2099-12-31", agent);
const outsideDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "amdx-validator-"));
let analyzer;

function documentSource(body, frontMatter = {}) {
  const metadata = {
    title: "Validator test",
    agent,
    created: "2099-12-31T12:34:56-06:00",
    ...frontMatter,
  };
  const lines = Object.entries(metadata).map(([key, value]) => `${key}: ${value}`);

  return `---\n${lines.join("\n")}\n---\n\n${body}\n`;
}

async function writeDocument(name, body, frontMatter) {
  const filePath = path.join(documentDirectory, name);
  await fs.writeFile(filePath, documentSource(body, frontMatter), "utf8");
  return filePath;
}

before(async () => {
  await fs.mkdir(documentDirectory, { recursive: true });
  await Promise.all([
    "valid.mdx",
    "unknown-component.mdx",
    "missing-required-prop.mdx",
    "wrong-prop-type.mdx",
    "invalid-syntax.mdx",
    "missing-front-matter.mdx",
    "command.mdx",
  ].map((name) => fs.writeFile(path.join(documentDirectory, name), documentSource("# Initial"), "utf8")));
  analyzer = new MdxAnalyzer();
});

after(async () => {
  await analyzer?.close();
  await fs.rm(path.join(AMDX_DOCUMENTS_DIR, "2099-12-31", agent), {
    recursive: true,
    force: true,
  });
  await fs.rmdir(path.join(AMDX_DOCUMENTS_DIR, "2099-12-31")).catch(() => undefined);
  await fs.rm(outsideDirectory, { recursive: true, force: true });
});

test("validates a document with the real compiler pipeline and returns handoff data", async () => {
  const filePath = await writeDocument(
    "valid.mdx",
    '<Metric label="Revenue" value="$42" />',
  );

  const result = await validateAmdx(filePath, { analyzer });

  assert.deepEqual(result, {
    ok: true,
    path: filePath,
    url: `https://amdx.pony-rattlesnake.ts.net/2099-12-31/${agent}/valid`,
  });
});

test("uses the MDX Analyzer for component availability and prop diagnostics", async () => {
  const cases = [
    ["unknown-component.mdx", "<QuoteCard />", /QuoteCard/],
    ["missing-required-prop.mdx", '<Metric label="Revenue" />', /Property 'value' is missing/],
    ["wrong-prop-type.mdx", '<Metric label="Revenue" value={42} />', /Type 'number' is not assignable to type 'string'/],
  ];

  for (const [name, body, message] of cases) {
    const result = await validateAmdx(await writeDocument(name, body), { analyzer });

    assert.equal(result.ok, false);
    assert.equal(result.diagnostics[0].source, "analyzer");
    assert.equal(Object.hasOwn(result.diagnostics[0], "path"), false);
    assert.match(result.diagnostics.map((entry) => entry.message).join("\n"), message);
    assert.ok(result.diagnostics.every((entry) => entry.line >= 1 && entry.column >= 1));
  }
});

test("formats diagnostic locations with the result path", () => {
  assert.equal(
    formatAmdxDiagnostic("/documents/report.mdx", {
      line: 12,
      column: 3,
      message: "Property 'value' is missing.",
      source: "analyzer",
    }),
    "/documents/report.mdx:12:3: Property 'value' is missing.",
  );
});

test("reports compiler and front matter failures with one-based source locations", async () => {
  const syntax = await validateAmdx(
    await writeDocument("invalid-syntax.mdx", '<Metric label="Revenue" value="$42"'),
    { analyzer },
  );
  assert.equal(syntax.ok, false);
  assert.equal(syntax.diagnostics[0].source, "compiler");
  assert.ok(syntax.diagnostics[0].line >= 1);
  assert.ok(syntax.diagnostics[0].column >= 1);

  const missingFrontMatter = path.join(documentDirectory, "missing-front-matter.mdx");
  await fs.writeFile(missingFrontMatter, "# Missing front matter\n", "utf8");
  const frontMatter = await validateAmdx(missingFrontMatter, { analyzer });
  assert.equal(frontMatter.ok, false);
  assert.equal(frontMatter.diagnostics[0].source, "frontmatter");
  assert.match(frontMatter.diagnostics[0].message, /Required front matter field/);
  assert.equal(frontMatter.diagnostics[0].line, 1);
  assert.equal(frontMatter.diagnostics[0].column, 1);
});

test("accepts YAML front matter scalars and quoting", async () => {
  const filePath = path.join(documentDirectory, "yaml-scalars.mdx");
  await fs.writeFile(
    filePath,
    `---
title: "Morning: Briefing"
agent: '${agent}'
created: 2099-12-31T12:34:56-06:00
published: true
priority: 3
---

<Metric label="Revenue" value="$42" />
`,
    "utf8",
  );

  const result = await validateAmdx(filePath, { analyzer });

  assert.equal(result.ok, true);
});

test("reports malformed YAML and missing required front matter fields", async () => {
  const malformedPath = path.join(documentDirectory, "malformed-yaml.mdx");
  await fs.writeFile(
    malformedPath,
    `---
title: [unfinished
agent: ${agent}
created: 2099-12-31T12:34:56-06:00
---
`,
    "utf8",
  );

  const malformed = await validateAmdx(malformedPath, { analyzer });
  assert.equal(malformed.ok, false);
  assert.equal(malformed.diagnostics[0].source, "frontmatter");
  assert.match(malformed.diagnostics[0].message, /end with a \]/);
  assert.equal(malformed.diagnostics[0].line, 3);
  assert.ok(malformed.diagnostics[0].column >= 1);

  const missingPath = path.join(documentDirectory, "missing-key.mdx");
  await fs.writeFile(
    missingPath,
    `---
title: Validator test
agent: ${agent}
---
`,
    "utf8",
  );

  const missing = await validateAmdx(missingPath, { analyzer });
  assert.equal(missing.ok, false);
  assert.deepEqual(
    missing.diagnostics.map((entry) => entry.message),
    ['Required front matter field "created" is missing or empty.'],
  );
});

test("rejects paths outside documents, uppercase extensions, and symlink escapes", async () => {
  const outsidePath = path.join(outsideDirectory, "outside.mdx");
  await fs.writeFile(outsidePath, documentSource("# Outside"), "utf8");
  const outside = await validateAmdx(outsidePath, { analyzer });
  assert.equal(outside.ok, false);
  assert.equal(outside.diagnostics[0].source, "path");
  assert.match(outside.diagnostics[0].message, /contained under/);

  const uppercase = await validateAmdx(path.join(documentDirectory, "UPPER.MDX"), { analyzer });
  assert.equal(uppercase.ok, false);
  assert.match(uppercase.diagnostics[0].message, /lowercase .mdx/);

  const symlinkPath = path.join(documentDirectory, "escaped.mdx");
  await fs.symlink(outsidePath, symlinkPath);
  const escaped = await validateAmdx(symlinkPath, { analyzer });
  assert.equal(escaped.ok, false);
  assert.match(escaped.diagnostics[0].message, /resolves outside/);
});

test("uses the fixed AMDX Tailscale URL", () => {
  assert.equal(
    userFacingUrl("/2099-12-31/agent/report"),
    "https://amdx.pony-rattlesnake.ts.net/2099-12-31/agent/report",
  );
});

test("derives a route that maps back to the same document path", async () => {
  const filePath = await writeDocument(
    "round-trip.mdx",
    '<Metric label="Revenue" value="$42" />',
  );
  const result = await validateAmdx(filePath, { analyzer });

  assert.equal(result.ok, true);
  assert.equal(routeToDocumentPath(documentRoute(filePath).slice(1).split("/")), filePath);
});

test("the command prints the path and URL after static validation", async () => {
  const filePath = await writeDocument(
    "command.mdx",
    '<Metric label="Revenue" value="$42" />',
  );
  const child = spawn(process.execPath, ["scripts/validate-amdx.mjs", filePath], {
    cwd: projectRoot,
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
  const result = JSON.parse(stdout);
  assert.deepEqual(result, {
    ok: true,
    path: filePath,
    url: `https://amdx.pony-rattlesnake.ts.net/2099-12-31/${agent}/command`,
  });
});
