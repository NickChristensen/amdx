#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildComponentDocs } from "./component-docs/build.mjs";
import { synchronizeComponentDocs } from "./component-docs/write.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = path.join(repoRoot, "skills/agent-mdx/SKILL.md");
const referencesDirectory = path.join(repoRoot, "skills/agent-mdx/references");
const output = buildComponentDocs({ repoRoot });

await synchronizeComponentDocs({ skillPath, referencesDirectory, output });
