import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";
import { AMDX_DOCUMENTS_DIR } from "../src/lib/amdx-document-paths.ts";
import {
  recordValidationTelemetry,
  validationTelemetryLogPath,
} from "../src/lib/validation-telemetry.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const agent = "telemetry-test-" + process.pid;
const documentDirectory = path.join(AMDX_DOCUMENTS_DIR, "2099-12-31", agent);
const successPath = path.join(documentDirectory, "success.mdx");
const failurePath = path.join(documentDirectory, "failure.mdx");
const lineBreak = "\n";

const success = {
  ok: true,
  path: successPath,
  url: "https://amdx.pony-rattlesnake.ts.net/2099-12-31/" + agent + "/success",
};

const failure = {
  ok: false,
  path: failurePath,
  diagnostics: [
    {
      source: "analyzer",
      line: 7,
      column: 2,
      message: "Property 'value' is missing.",
    },
  ],
};

function source(body) {
  return [
    "---",
    "title: Telemetry test",
    "agent: " + agent,
    "created: 2099-12-31T12:34:56-06:00",
    "---",
    "",
    body,
    "",
  ].join(lineBreak);
}

function runValidationCommand(inputPath, logDirectory) {
  const child = spawn(process.execPath, ["scripts/validate-amdx.mjs", inputPath], {
    cwd: projectRoot,
    env: {
      ...process.env,
      AMDX_VALIDATION_TELEMETRY_DIRECTORY: logDirectory,
    },
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

  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}

before(async () => {
  await fs.mkdir(documentDirectory, { recursive: true });
  await Promise.all([
    fs.writeFile(successPath, source('<Metric label="Revenue" value="$42" />'), "utf8"),
    fs.writeFile(failurePath, source('<Metric label="Revenue" />'), "utf8"),
  ]);
});

after(async () => {
  await fs.rm(path.join(AMDX_DOCUMENTS_DIR, "2099-12-31", agent), {
    recursive: true,
    force: true,
  });
  await fs.rmdir(path.join(AMDX_DOCUMENTS_DIR, "2099-12-31")).catch(() => undefined);
});

test("ignores validation telemetry logs", async () => {
  const gitignore = await fs.readFile(path.join(projectRoot, ".gitignore"), "utf8");

  assert.match(gitignore, /^logs\/validation\/$/mu);
});

test("records success and failure events with the exact event shape", async () => {
  const logDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "amdx-validation-telemetry-"));

  try {
    const timestamp = new Date("2026-08-14T21:42:19.000Z");
    const successRecord = await recordValidationTelemetry({
      result: success,
      now: timestamp,
      logDirectory,
    });
    const failureRecord = await recordValidationTelemetry({
      result: failure,
      now: new Date("2026-08-14T21:42:20.000Z"),
      logDirectory,
    });

    assert.deepEqual(Object.keys(successRecord), [
      "schemaVersion",
      "timestamp",
      "document",
      "ok",
      "diagnostics",
    ]);
    assert.equal(successRecord.schemaVersion, 1);
    assert.equal(successRecord.timestamp, timestamp.toISOString());
    assert.equal(successRecord.document, "documents/2099-12-31/" + agent + "/success.mdx");
    assert.equal(successRecord.ok, true);
    assert.deepEqual(successRecord.diagnostics, []);
    assert.deepEqual(Object.keys(failureRecord), Object.keys(successRecord));
    assert.equal(failureRecord.document, "documents/2099-12-31/" + agent + "/failure.mdx");
    assert.equal(failureRecord.ok, false);
    assert.equal(failureRecord.diagnostics, failure.diagnostics);
  } finally {
    await fs.rm(logDirectory, { recursive: true, force: true });
  }
});

test("appends events to their UTC month files", async () => {
  const logDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "amdx-validation-telemetry-"));

  try {
    const august = new Date("2026-08-31T23:59:59.000Z");
    const september = new Date("2026-09-01T00:00:00.000Z");
    await recordValidationTelemetry({ result: success, now: august, logDirectory });
    await recordValidationTelemetry({ result: failure, now: august, logDirectory });
    await recordValidationTelemetry({ result: success, now: september, logDirectory });

    const augustLogPath = validationTelemetryLogPath(august.toISOString(), logDirectory);
    const septemberLogPath = validationTelemetryLogPath(september.toISOString(), logDirectory);
    const augustLines = (await fs.readFile(augustLogPath, "utf8")).trim().split(lineBreak);
    const septemberLines = (await fs.readFile(septemberLogPath, "utf8")).trim().split(lineBreak);
    assert.equal(augustLines.length, 2);
    assert.equal(septemberLines.length, 1);
    assert.ok(augustLines.every((line) => JSON.parse(line).schemaVersion === 1));
    assert.equal((await fs.stat(augustLogPath)).mode & 0o777, 0o600);
  } finally {
    await fs.rm(logDirectory, { recursive: true, force: true });
  }
});

test("the real CLI keeps its JSON output and status for success and failure", async () => {
  const logDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "amdx-validation-cli-"));

  try {
    const succeeded = await runValidationCommand(successPath, logDirectory);
    assert.equal(succeeded.exitCode, 0, succeeded.stderr);
    assert.equal(succeeded.stderr, "");
    assert.deepEqual(JSON.parse(succeeded.stdout), success);

    const failed = await runValidationCommand(failurePath, logDirectory);
    assert.equal(failed.exitCode, 1);
    const failureResult = JSON.parse(failed.stdout);
    assert.equal(failureResult.ok, false);
    assert.equal(failureResult.path, failurePath);
    assert.match(failureResult.diagnostics[0].message, /Property 'value' is missing/u);
    assert.match(failed.stderr, /Property 'value' is missing/u);

    const lines = (await fs.readFile(
      validationTelemetryLogPath(new Date().toISOString(), logDirectory),
      "utf8",
    )).trim().split(lineBreak).map((line) => JSON.parse(line));
    assert.equal(lines.length, 2);
    assert.deepEqual(lines.map((record) => record.ok), [true, false]);
  } finally {
    await fs.rm(logDirectory, { recursive: true, force: true });
  }
});

test("the CLI warns once when its telemetry directory override is a file", async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "amdx-validation-cli-"));
  const telemetryOverride = path.join(temporaryDirectory, "not-a-directory");
  await fs.writeFile(telemetryOverride, "blocked", "utf8");

  try {
    const result = await runValidationCommand(successPath, telemetryOverride);

    assert.equal(result.exitCode, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), success);
    const warnings = result.stderr.trim().split(lineBreak).filter(Boolean);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /^Warning: Validation telemetry could not be recorded:/u);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});
