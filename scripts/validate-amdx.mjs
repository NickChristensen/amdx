#!/usr/bin/env node

import { formatAmdxDiagnostic, validateAmdx } from "../src/lib/validate-amdx.ts";
import { recordValidationTelemetry } from "../src/lib/validation-telemetry.ts";

const [inputPath] = process.argv.slice(2);
if (!inputPath || process.argv.length !== 3) {
  console.error("Usage: node scripts/validate-amdx.mjs <absolute-document-path>");
  process.exitCode = 64;
} else {
  const result = await validateAmdx(inputPath);

  try {
    await recordValidationTelemetry({
      result,
      logDirectory: process.env.AMDX_VALIDATION_TELEMETRY_DIRECTORY || undefined,
    });
  } catch (error) {
    console.error(
      `Warning: Validation telemetry could not be recorded: ${error instanceof Error ? error.message : "Unknown error."}`,
    );
  }

  if (result.ok) {
    console.log(JSON.stringify(result));
  } else {
    for (const entry of result.diagnostics) {
      console.error(formatAmdxDiagnostic(result.path, entry));
    }
    console.log(JSON.stringify(result));
    process.exitCode = 1;
  }
}
