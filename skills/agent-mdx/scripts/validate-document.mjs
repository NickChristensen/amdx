#!/usr/bin/env node

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = await fs.realpath(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(path.dirname(scriptPath), "../../..");
const validatorPath = path.join(projectRoot, "scripts", "validate-amdx.mjs");
const child = spawn(process.execPath, [validatorPath, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: "inherit",
});

child.once("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
