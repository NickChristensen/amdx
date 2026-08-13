#!/usr/bin/env node

import { formatAmdxDiagnostic, validateAmdx } from "../src/lib/validate-amdx.ts";

const [inputPath] = process.argv.slice(2);
if (!inputPath || process.argv.length !== 3) {
  console.error("Usage: node scripts/validate-amdx.mjs <absolute-document-path>");
  process.exitCode = 64;
} else {
  const result = await validateAmdx(inputPath);
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
