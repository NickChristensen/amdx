# AMDX Operationalization

This document records the current decisions for making AMDX available to OpenClaw agents. It describes the selected operating approach and the shared contract. Implementation details that still need investigation are listed separately.

## Purpose

OpenClaw agents primarily communicate through Telegram, which supports limited text formatting. AMDX gives those agents a richer local presentation surface for reports, explanations, plans, briefings, calendars, charts, and other structured content.

AMDX has one document format. Reports, briefings, dashboards, and similar terms describe content patterns rather than separate AMDX document types.

## Selected Operating Approach

Direct OpenClaw authoring is the selected operating approach. The OpenClaw domain agent reads the AMDX skill package, creates and repairs the document, completes the validation and readiness gate, and sends the resulting URL. See [Direct OpenClaw Authoring Approach](OPERATIONALIZATION-DIRECT-OPENCLAW-AUTHORING.md) for the detailed workflow.

This selection keeps the source conversation, domain facts, user intent, and document composition in one agent context. It also keeps the normal user-handoff path small. The AMDX skill package keeps the complete workflow, global Markdown and MDX syntax, and a compact component index in `SKILL.md`. The agent loads detailed generated references only for the components it selects.

The [Dedicated Pi Authoring Agent Approach](OPERATIONALIZATION-PI-AUTHORING-AGENT.md) remains in the repository as a possible future experiment. It is outside the selected operating path.

### Shared contract

The selected approach uses:

- one lowercase `.mdx` file format;
- the same Markdown syntax and MDX renderer pipeline;
- the same curated agent-facing component catalog and React prop types;
- YAML front matter with trusted `agent` and full `created` timestamp metadata;
- the same repo-local, gitignored `documents/<yyyy-mm-dd>/<agent>/<slug>.mdx` path for documents in every authoring state;
- the same extensionless route derived from the relative path below `documents/`;
- the same Tailscale user-facing URL shape;
- the same validation requirements for syntax, component availability, required props, and prop types;
- the same controlled document creation and path-containment requirements;
- the same final outcome of a short Telegram message with the rendered AMDX URL.

The sections that follow define this shared contract. A future Pi experiment should use the same contract unless a later decision changes it.

### Selected responsibility split

The selected workflow assigns these responsibilities:

- **Authorship:** The OpenClaw domain agent writes the MDX document from its existing domain and conversation context.
- **Validation workflow:** The same agent requests diagnostics, interprets them, and repairs the document until the readiness gate succeeds.
- **Readiness workflow:** The same agent exits the repair loop only after the deterministic gate validates the document and returns the derived user-facing URL.

Deterministic tooling remains responsible for initial document creation, trusted metadata, path derivation, collision handling, validation, and URL derivation.

## Authoring Contract

The exported component map in [`src/components/mdx/mdx-components.tsx`](src/components/mdx/mdx-components.tsx) is the current runtime source of truth.

The authoring contract must preserve the distinction between:

- capitalized agent-facing components that an agent can write directly in MDX;
- lowercase Markdown and HTML element overrides controlled by the app.

The agent-facing entries live in an explicit `agentMdxComponents` object. The complete renderer map combines that object with the lowercase element overrides. The object uses `satisfies MDXComponents` so TypeScript retains the exact component types for documentation and validation tooling.

### Component layout

Every agent-facing component should be documented as one of:

- `inline`, such as `Badge` and `Icon`;
- `block`, such as `TweetCard` and `BarGraphCard`.

Components whose names end in `Card` own their outer card surface. This naming rule is sufficient unless a future component creates an exception.

### Generated component reference

A script should inspect `agentMdxComponents`, its React component types, nearby JSDoc, public defaults, and validated examples. It should generate:

- a machine-readable component catalog for tooling;
- a compact component index inside `SKILL.md`, with each component's name, purpose, layout, and direct reference link;
- one readable Markdown file per component under `references/`, such as `references/badge.md` and `references/metric.md`.

Each component reference should include:

- component name;
- purpose;
- inline or block layout;
- an authoring-facing TypeScript declaration with public prop names, required or optional status, and types;
- public default values when available, expressed as typed TypeScript;
- concise semantic guidance;
- a short validated MDX example.

Prop descriptions should live in JSDoc near the component prop types so the generated references stay connected to the source contract. The generated index and component reference files should fail a check when they differ from their source declarations. The generator should update a bounded generated section of `SKILL.md` and preserve its handwritten workflow and syntax sections.

### Markdown and MDX syntax

`SKILL.md` must directly document the global syntax supported by the real renderer pipeline in [`src/components/mdx/mdx-renderer.tsx`](src/components/mdx/mdx-renderer.tsx), including:

- CommonMark Markdown;
- GitHub Flavored Markdown features such as tables, task lists, strikethrough, and autolinks;
- `==highlight==` markers;
- GitHub-style alerts;
- fenced code blocks and syntax highlighting;
- Markdown blocks inside JSX component children;
- expressions and any restrictions AMDX adopts later.

This syntax section is part of the always-loaded skill guidance because it applies to every document. Its examples should compile through AMDX's real renderer pipeline as contract tests.

## Front Matter

AMDX documents will use YAML front matter. The initial required metadata is:

```yaml
---
title: Morning briefing
agent: finances
created: 2026-08-07T07:30:00-05:00
---
```

The `new-document` command should add `agent` and `created` automatically:

- `agent` comes from the OpenClaw workspace identity or its working directory;
- `created` is a full ISO 8601 timestamp with the local UTC offset.

If AMDX supports replacing an existing document, the document tooling should preserve `created` and add or update `modified`.

The page renderer should receive the parsed metadata. The page template can use it for shared presentation such as a breadcrumb:

```text
2026-08-07 / finances / Morning briefing
```

The design should also allow MDX content or future components to read the metadata when useful.

## File and Route Shape

Documents live under the repo-local, gitignored `documents/` directory throughout creation, editing, validation, and use:

```text
documents/<yyyy-mm-dd>/<agent>/<slug>.mdx
```

Example:

```text
documents/2026-08-07/finances/morning-briefing.mdx
```

The corresponding AMDX route is:

```text
/2026-08-07/finances/morning-briefing
```

The documents root belongs to AMDX. Keeping it inside the repository gives the renderer, validator, and document tools one filesystem and TypeScript-project context. Git ignores the directory because documents are runtime data. This order matches the visible breadcrumb, groups documents by date, and prevents daily briefings from colliding across dates or agents.

The skill invokes the helper through its installed path without changing the caller's working directory:

```text
node {skillDir}/scripts/new-document.mjs "Morning briefing"
```

`new-document` accepts the title as its first positional argument. It reads the caller's current working directory, resolves symlinks, and walks upward to find a direct child of `~/.openclaw` whose name matches `workspace` or `workspace-<agent>`. The plain `~/.openclaw/workspace` maps to agent `main`. A `workspace-<agent>` directory maps to the suffix after `workspace-`. The command must reject every working directory that does not resolve inside one of these workspace roots.

The command derives the local date, slugifies the title, creates the namespaced directory, writes required front matter, and returns the absolute document path and route in a machine-readable result. The agent should use that absolute path for every later edit and validation call. The command must use exclusive file creation. When the target already exists, it appends the first available deterministic numeric suffix, such as `morning-briefing-2.mdx`.

User-facing links use the Tailscale hostname `macmini.pony-rattlesnake.ts.net` with the active AMDX protocol and port.

## Rendering and Readiness

AMDX reads and compiles a document from `documents/` only when its route is requested. Creating or editing a file does not trigger rendering. A document remains in the same path through creation, repair, validation, and later use.

Successful static validation marks a document ready for handoff. The validation command should derive the route and user-facing URL from the validated absolute path and return them without requesting the route. Per-document publication does not include an HTTP request.

Document-root resolution, path containment, route derivation, and user-facing URL construction should live in shared deterministic functions used by the validator and renderer. Their behavior should be verified in the test suite. Runtime availability should be checked separately with a known-document application smoke test during application testing, startup, or deployment.

## Validation Requirements

Before a link is sent, AMDX should catch:

- invalid MDX syntax;
- unavailable agent-facing components;
- missing required component props;
- component props with incompatible types.

The validator proof of concept implements the planned agent-facing command. It accepts one absolute lowercase `.mdx` path under `documents/`, parses required front matter, compiles with AMDX's exact plugin pipeline, and uses MDX Analyzer with `MDXProvidedComponents` for component and React prop diagnostics. It returns one-based source locations on failure and a machine-readable path, route, and URL on success. It does not request the rendered route.

The proof of concept omits the earlier remark-stage catalog check. MDX Analyzer already catches unavailable components against the authoritative TypeScript contract.

Strict diagnostics use `@mdx-js/language-server` through its LSP interface. Documents live inside the AMDX repository so they can belong to its TypeScript project and receive `mdx.checkMdx` and the global `MDXProvidedComponents` type. The project includes `.mdx` files in `tsconfig.json`.

The language server publishes diagnostics instead of exposing a one-shot validation command. The proof of concept uses a small JSON-RPC client and waits for the published diagnostics. Its current dependency tree also needs separate `vscode-uri` versions for the MDX and Markdown language services; `package.json` records those targeted overrides.

## Performance Findings

The completed proof-of-concept benchmark compared separate validator processes with repeated validations through one persistent Analyzer. In the initial three-iteration run, cold validation took 3.46 to 4.21 seconds. The persistent Analyzer took 3.37 seconds for startup and its first validation, then 256 to 261 milliseconds per validation. The benchmark utility is not part of the planned workflow.

The initial OpenClaw workflow uses a cold Analyzer start for every validation pass. Documents are created infrequently enough that the simpler process lifecycle is worth the repeated startup cost during repair. A temporary Analyzer session scoped to one repair loop remains a deferred enhancement in [GitHub issue #5](https://github.com/NickChristensen/amdx/issues/5). It must not become an always-running validation service.

## Publication Contract Tests

Publication is the deterministic handoff from a validated absolute document path to a route and user-facing URL. The initial test suite should cover:

- a valid absolute path under `documents/` maps to the expected extensionless date, agent, and slug route;
- the route maps back to the same document so validator and renderer resolution cannot drift;
- containment rejects paths outside `documents/`, traversal attempts, and symlink escapes;
- unsupported extensions and malformed document paths are rejected;
- URL construction uses the configured protocol and port with the required `macmini.pony-rattlesnake.ts.net` hostname;
- a successful validator result contains the exact absolute path, derived route, and derived URL in its machine-readable output;
- validation failures never return a ready result or user-facing URL;
- a known valid fixture renders through the running AMDX application with an expected content marker;
- a missing document route returns the application's expected not-found response.

The known-fixture request is an application smoke test. It runs once for the application boundary rather than once for every agent-authored document.

## Open Decisions

- Whether the language-server client used by the proof of concept is suitable for the production readiness command or should be replaced by a lower-level integration.
- Update semantics for living documents, including `modified`.
- Retention and cleanup policy for old documents.
- Backup and recovery policy for the gitignored `documents/` directory.
- Future restrictions on MDX imports, exports, expressions, and raw HTML.
