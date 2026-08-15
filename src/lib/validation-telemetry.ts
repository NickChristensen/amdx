import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AmdxDiagnostic,
  AmdxValidationResult,
} from "./validate-amdx.ts";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const VALIDATION_TELEMETRY_SCHEMA_VERSION = 1;
export const VALIDATION_TELEMETRY_DIRECTORY = path.join(
  projectRoot,
  "logs",
  "validation",
);

export type ValidationTelemetryRecord = {
  schemaVersion: typeof VALIDATION_TELEMETRY_SCHEMA_VERSION;
  timestamp: string;
  document: string;
  ok: boolean;
  diagnostics: AmdxDiagnostic[];
};

export type RecordValidationTelemetryOptions = {
  result: AmdxValidationResult;
  now?: Date;
  logDirectory?: string;
};

function telemetryDocumentPath(documentPath: string) {
  if (!path.isAbsolute(documentPath)) {
    return "unknown";
  }

  const relativePath = path.relative(projectRoot, documentPath);
  if (
    !relativePath
    || relativePath === ".."
    || relativePath.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativePath)
  ) {
    return "unknown";
  }

  return relativePath.split(path.sep).join("/");
}

function telemetryMonth(timestamp: string) {
  return timestamp.slice(0, 7);
}

export function validationTelemetryLogPath(
  timestamp: string,
  logDirectory = VALIDATION_TELEMETRY_DIRECTORY,
) {
  return path.join(logDirectory, `${telemetryMonth(timestamp)}.jsonl`);
}

export async function recordValidationTelemetry({
  result,
  now = new Date(),
  logDirectory = VALIDATION_TELEMETRY_DIRECTORY,
}: RecordValidationTelemetryOptions): Promise<ValidationTelemetryRecord> {
  const timestamp = now.toISOString();
  const record: ValidationTelemetryRecord = {
    schemaVersion: VALIDATION_TELEMETRY_SCHEMA_VERSION,
    timestamp,
    document: telemetryDocumentPath(result.path),
    ok: result.ok,
    diagnostics: result.ok ? [] : result.diagnostics,
  };
  const logPath = validationTelemetryLogPath(timestamp, logDirectory);

  await mkdir(logDirectory, { recursive: true, mode: 0o700 });
  await appendFile(logPath, `${JSON.stringify(record)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  return record;
}
