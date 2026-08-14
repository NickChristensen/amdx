---
name: agent-mdx
description: Create, validate, and publish clear MDX documents with Markdown and React components. Required when a response needs more than simple Telegram formatting.
---

# Agent MDX

Use Agent MDX to create one local MDX document, then send its validated URL in a short Telegram reply. MDX combines Markdown with React components. The responding OpenClaw agent owns the facts, source context, document choices, and user handoff.

## Selection boundary

Use this skill when the user needs a document that benefits from visual hierarchy, structured data, comparison, charts, a plan, a calendar, a review, or detailed explanation.

Keep a simple answer in Telegram when plain text answers the request well. Do not create an MDX document only to restate a short reply.

Use the current conversation, user intent, and domain evidence as the source of truth. Check time-sensitive facts before you write them. State important unknowns in the document instead of inventing data.

## Authoring quality

Write for the user's decision or understanding. Start with the answer, then add the evidence, context, and detail that support it.

Give the document a concise title. Use headings that describe the content. Keep paragraphs short. Prefer a list, a small table, or a chart only when it makes the information easier to scan.

Use Markdown first. Add a component only when it gives the content a clear semantic or visual benefit. Keep one main idea in each section.

Design for a narrow phone screen. Keep tables short, with few columns and compact cells. Turn wide comparisons into sections, lists, or cards.

## Create, author, and validate

1. From the current OpenClaw workspace, run `"{skillDir}/scripts/create-document.mjs" "<title>"`.
2. Continue only when it exits with status 0 and standard output is one absolute `.mdx` path. This is the new document. Save and use that exact path.
3. Do not construct a document path, route, agent name, date, slug, or front matter yourself. Preserve the generated front matter.
4. Write the complete document at the returned path.
5. Run `"{skillDir}/scripts/validate-document.mjs" "<absolute-path>"`.
6. On a nonzero exit, batch all current content repairs into one edit, then validate again. For a path or filesystem diagnostic, correct the command or stop. For an Analyzer process failure, retry once without editing.
7. After every edit batch, run validation before you send a link or make another edit.

If creation fails, correct an actionable argument or workspace error and retry once. Do not create a path or front matter manually.

The first validation follows the initial document. You may make at most two repair-and-validation rounds. Stop earlier when the complete diagnostic set is unchanged, or when a diagnostic directly addressed by the previous repair remains at the same source location.

Each validation command starts a cold validator process. Validation succeeds only when it exits with status 0 and standard output parses as JSON with exactly `ok: true`, the stored `path`, and a non-empty `url`. A nonzero exit, missing or invalid JSON, or a different path is failure. Send only the URL from the latest successful validation.

Do not request the rendered route during this loop. Static validation is the per-document readiness gate. Service health is tested separately.

## Markdown and MDX syntax

Use CommonMark Markdown. The local renderer also supports GitHub Flavored Markdown tables, task lists, strikethrough, autolinks, `==highlight==`, GitHub-style alerts, and fenced code blocks with a language name.

Use alerts for material notes, warnings, or constraints:

```md
> [!WARNING]
> This data is delayed by 15 minutes.
```

Put blank lines around Markdown blocks inside a JSX component:

```mdx
<Card>

## Section heading

Markdown content goes here.

</Card>
```

Use only the capitalized components in this skill's catalog. Do not assume an internal application component is available.

Do not use MDX imports, exports, scripts, or executable expressions. Component prop expressions may contain literal strings, numbers, booleans, arrays, and objects only. Do not use variables, function calls, property access, template strings, or computed values in an expression.

These are mandatory authoring rules. Static validation does not yet enforce every syntax restriction. Before final validation, inspect the complete MDX source and remove imports, exports, raw HTML tags, scripts, event props, and every expression outside literal component prop values.

## Component selection

Read `references/<component>.md` for every component you select when that file is present. It defines the supported props, defaults, semantic guidance, and a validated example.

When a selected component has no reference file, read only its relevant example in `{skillDir}/../../examples/kitchen-sink.mdx`. Follow that validated prop shape with new literal data. Use Markdown when neither source documents the needed use. Never guess props.

- `Badge`: Short status, category, or label. Keep it brief and inline.
- `BarGraphCard`: Bar comparison. Use for a small set of comparable values.
- `CalendarCard`: Calendar information. Use when dates and schedule context matter.
- `Card`: One grouped content surface. Use for ordinary Markdown content.
- `ChatCard`: Conversation or message sequence. Use only for actual dialogue.
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`: Optional supporting detail.
- `Icon`: Small supported icon. Pair it with a clear label where meaning matters.
- `LineGraphCard`: Trend over an ordered time sequence.
- `Metric`: One key value with its label and optional change context.
- `Progress`: Completion or progress toward a known total.
- `Stack`: Directional layout and spacing for child content.
- `StockQuoteCard`: Market quote with a clear timestamp or freshness note.
- `TodoListCard`: Actionable task list with clear owners or next steps where known.
- `TweetCard`: A post from X. Use only when the original post adds necessary context.

Components whose names end in `Card` provide their own surface. Do not place a `Card` inside another `Card`, or place a `*Card` component inside `Card`. Use `Stack` or Markdown headings to arrange card-level content.

Use charts for data with clear labels and a meaningful comparison or trend. Include units, dates, source context, and uncertainty in nearby Markdown when they affect interpretation.

## Static validation boundary

`validate-document.mjs` checks the returned file path, required front matter, compilation through the local renderer pipeline, available components, required props, and prop types. Diagnostics identify the path, line, column, and problem. A successful result proves only these static checks.

Use diagnostics to repair the document. Do not treat a created file, a route, or a browser request as proof that the document is ready. The URL in a successful result is the user handoff target.

Before final validation, read the complete document once. Confirm that it answers every requested point, contains no placeholders, preserves factual freshness and uncertainty, protects private content, uses useful link and image text, labels visual controls, stays readable on a narrow screen, and has one clear conclusion.

## Bounded failure handling

If validation succeeds, send a short Telegram message with the returned URL and a useful one-sentence description.

If validation still fails after the allowed rounds, or an earlier stop condition is reached, stop the document workflow. Send the useful answer in Telegram. State briefly that the richer document could not be prepared when that context helps the user.

Do not delay the underlying answer while you continue an unsuccessful document repair loop.
