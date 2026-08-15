# AMDX Operationalization

This document records the durable AMDX architecture and current decisions for OpenClaw-authored MDX documents.

## Purpose

AMDX is the richer local presentation surface for OpenClaw agents when a Telegram message cannot present a report, explanation, plan, briefing, calendar, chart, or review well.

AMDX renders one MDX document format. Terms such as report, briefing, and dashboard describe content patterns inside that format.

## Selected Workflow

Direct OpenClaw authoring is the selected workflow. The domain agent uses the repository's `skills/agent-mdx` package, writes the document from its existing conversation and source context, validates it, and sends the returned URL in its Telegram response.

The skill package is the executable authoring instruction. It contains the selection boundary, authoring rules, create-and-validate loop, failure handling, syntax rules, and bounded component index. Generated references provide the exact API for selected components.

The global OpenClaw configuration loads this repository's `skills` directory through `skills.load.extraDirs`, so `agent-mdx` must remain unique across higher-precedence skill sources.

[Dedicated Pi Authoring Agent Approach](OPERATIONALIZATION-PI-AUTHORING-AGENT.md) remains a future experiment. It is outside the selected workflow.

## Shared Document Contract

- Documents are lowercase `.mdx` files in the gitignored `documents/` directory.
- A document path has the form `documents/<yyyy-mm-dd>/<agent>/<slug>.mdx` and maps to the extensionless route `/<yyyy-mm-dd>/<agent>/<slug>`.
- `create-document` derives the agent, local date, slug, front matter, and collision-safe path. Agents preserve the generated front matter and use the returned absolute path for later edits and validation.
- Required front matter is `title`, `agent`, and `created`. The `created` value is a full ISO 8601 timestamp with its local UTC offset.
- User-facing links use `https://amdx.pony-rattlesnake.ts.net/<route>`.
- AMDX renders documents lazily. The renderer, document tooling, and validator share the same repository and TypeScript project.
- The MDX content is trusted local content from the user's agents. The existing curated component map is the current authoring boundary.

`create-document` accepts a title, verifies that the caller is inside a recognized OpenClaw workspace, derives the document path, writes the required front matter with exclusive creation, and prints the absolute path. It appends a deterministic numeric suffix when a target path already exists.

## Component Documentation Contract

`agentMdxComponents` in [`src/components/mdx/mdx-components.tsx`](src/components/mdx/mdx-components.tsx) is the machine-readable TypeScript catalog of capitalized components available to MDX. The complete renderer map adds lowercase element overrides, which are not agent-facing component names.

Each catalog component exports its authoring-facing props declaration with JSDoc and a typed `<camelCaseComponentName>MdxDocs` metadata constant collocated with the component. The metadata defines the description, `inline` or `block` flow, public defaults, optional guidance, and one or two validated MDX examples.

`npm run generate:component-docs` derives the bounded component index in `skills/agent-mdx/SKILL.md` and the exact-case reference files in `skills/agent-mdx/references/`. These generated files are owned by the generator. Do not hand-edit them.

`npm run test:component-docs` extracts the collocated contract, validates the combined examples with the real MDX compiler and Analyzer, tests generator behavior, and reports generated-file drift without writing files.

Components ending in `Card` own their outer surface. `inline` components, including `Badge` and `Icon`, must remain suitable for inline MDX use. New catalog entries need the collocated contract before their generated reference can exist.

## Authoring and Validation

The skill documents CommonMark, GitHub Flavored Markdown, `==highlight==`, fenced code blocks, Markdown inside JSX children, and literal-only component prop expressions. It prohibits imports, exports, scripts, raw HTML, event props, and executable expressions.

The author writes the complete document, then calls `skills/agent-mdx/scripts/validate-document.mjs` with the returned absolute path. The validator checks path containment and lowercase extension, required front matter, compilation through the renderer pipeline, component availability, required props, and prop types. It returns one-based diagnostics on failure or JSON containing `ok`, `path`, and `url` on success.

Each completed command appends one gitignored JSONL event record at `logs/validation/YYYY-MM.jsonl`. Every record has only `schemaVersion`, UTC `timestamp`, repo-relative `document` path or `"unknown"`, `ok`, and unchanged `diagnostics`. The validator keeps its JSON standard-output contract when telemetry storage has an error.

The v1 validator uses the MDX language server through its JSON-RPC/LSP client and the project's `MDXProvidedComponents` type. This is the current production implementation. Validation starts a cold Analyzer process for each command, and no route request is part of the per-document gate.

Static validation makes a document ready for handoff. Application availability remains a separate concern. A live known-document HTTP smoke test remains an application-level test to add for startup or deployment validation.

## Deferred Decisions

- [GitHub issue #5](https://github.com/NickChristensen/amdx/issues/5) tracks a temporary Analyzer session for a single repair loop. It must not become a permanent validation service.
- Define update semantics for living documents, including when `modified` is added or changed.
- Define retention and cleanup for old documents.
- Define backup and recovery for the gitignored `documents/` directory.
- Enforce the skill's restrictions on imports, exports, expressions, raw HTML, and event props as part of a future trust-policy decision.
- Evaluate the dedicated Pi authoring approach after the selected workflow has sufficient operational evidence.
