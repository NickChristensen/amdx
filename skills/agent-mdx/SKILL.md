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
   Do not add the document's creation date to the title or filename. The document tool supplies the creation date in the path and metadata. Examples: Morning Briefing, Monthly P&L Review, Executor Codebase Explainer.
2. Continue only when it exits with status 0 and standard output is one absolute `.mdx` path. This is the new document. Save and use that exact path.
3. Do not construct a document path, route, agent name, date, slug, or front matter yourself. Preserve the generated front matter.
4. Write the complete document at the returned path.
5. Run `"{skillDir}/scripts/validate-document.mjs" "<absolute-path>"`.
6. On a nonzero exit, batch all current content repairs into one edit, then validate again. For a path or filesystem diagnostic, correct the command or stop. For an Analyzer process failure, retry once without editing.
7. After every edit batch, run validation before you send a link or make another edit.

If creation fails, correct an actionable argument or workspace error and retry once. Do not create a path or front matter manually.

The first validation follows the initial document. You may make at most two repair-and-validation rounds. Stop earlier when the complete diagnostic set is unchanged, or when a diagnostic directly addressed by the previous repair remains at the same source location.

Each validation command starts a cold validator process. Validation succeeds only when it exits with status 0 and standard output parses as JSON with exactly `ok: true`, the stored `path`, and a non-empty `url`. A nonzero exit, missing or invalid JSON, or a different path is failure. Send only the URL from the latest successful validation.

Each validation command automatically appends one local JSONL telemetry record.

Do not request the rendered route during this loop. Static validation is the per-document readiness gate. Service health is tested separately.

## Markdown and MDX syntax

Use CommonMark Markdown. The local renderer also supports GitHub Flavored Markdown tables, task lists, strikethrough, autolinks, `==highlight==`, and fenced code blocks with a language name.

Put blank lines around Markdown blocks inside a JSX component:

```mdx
<Card>

Markdown content goes here.

- a list
- another list item

</Card>
```

Use only the capitalized components in this skill's catalog. Do not assume an internal application component is available.

Do not use MDX imports, exports, scripts, or executable expressions. Component prop expressions may contain literal strings, numbers, booleans, arrays, and objects only. Do not use variables, function calls, property access, template strings, or computed values in an expression.

These are mandatory authoring rules. Static validation does not yet enforce every syntax restriction. Before final validation, inspect the complete MDX source and remove imports, exports, raw HTML tags, scripts, event props, and every expression outside literal component prop values.

## Component selection

Read `references/<component>.md` for every component you select when that file is present. It defines the supported props, defaults, semantic guidance, and a validated example.

<!-- BEGIN GENERATED COMPONENT INDEX -->
## Components

### UI elements

- [Badge](references/Badge.md): Inline. Renders a short inline label. Use for a status, category, or compact piece of metadata that should stand out from nearby text.
- [Button](references/Button.md): Inline. Renders a button or button-styled link. Use for a clear action or destination that the reader can select.
- [Icon](references/Icon.md): Inline. Renders a Lucide icon inline with optional semantic color. Use to reinforce a nearby label or status when the symbol improves scanning.
- [Metric](references/Metric.md): Block. Renders one prominent labeled value with optional change context. Use to highlight a key number that readers should understand at a glance.
- [Progress](references/Progress.md): Block. Renders a horizontal progress bar. Use to show completion toward a known percentage or that a process has started.
- [Term](references/Term.md): Inline. Adds a short definition to the first occurrence of jargon or another unfamiliar term. Use when a reader may need help understanding the term without interrupting the report.

### Composition

- [Alert](references/Alert.md): Block. Renders an emphasized semantic message with optional title and action content. Use for important context, status, caution, or next steps that readers should not miss.
- [Card](references/Card.md): Block. Renders a structured block surface with optional header, content, and footer sections. Use to group one self-contained topic that needs stronger separation than headings alone.
- [Collapsible](references/Collapsible.md): Block. Renders a section that readers can expand or collapse. Use to keep secondary details available without making the main report harder to scan.
- [Stack](references/Stack.md): Block. Arranges peer components in a wrapping row. Use for compact items such as buttons and badges, or enable flexItems to give cards and metrics equal widths. On small screens, flexItems falls back to a full-width column.

### Charts

- [BarChartCard](references/BarChartCard.md): Block. Renders categorical values as grouped or stacked bars in a card. Use to compare discrete categories or show composition within each category.
- [LineChartCard](references/LineChartCard.md): Block. Renders one or more filled line series in a card. Use to show change across an ordered sequence, usually time, or to compare trends.
- [PieChartCard](references/PieChartCard.md): Block. Renders labeled values as proportional slices in a card. Use to show how a small number of categories contribute to one meaningful whole.

### Domain components

- [CalendarCard](references/CalendarCard.md): Block. Renders calendar events as a local-day agenda with times, durations, locations, and source colors. Use to show a schedule or help readers understand upcoming commitments.
- [ChatCard](references/ChatCard.md): Block. Renders one message thread as sorted, direction-aware chat bubbles with sender and time context. Use when the exact conversation or exchange supports the report.
- [StockQuoteCard](references/StockQuoteCard.md): Block. Fetches current quotes, intraday, 7-day, 30-day, and year-to-date changes, for ticker symbols. Use when readers need a market snapshot for specific securities.
- [TodoListCard](references/TodoListCard.md): Block. Renders Things todos as compact rows with tags and project or area context. Use to show an actionable task list from Things.
- [TweetCard](references/TweetCard.md): Block. Fetches and renders an X post with its author, text, links, and available media. Use when the original post provides evidence or context that readers should inspect directly.
<!-- END GENERATED COMPONENT INDEX -->

Components whose names end in `Card` provide their own surface. Do not place a `Card` inside another `Card`, or place a `*Card` component inside `Card`. Use `Stack` or Markdown headings to arrange card-level content.

## Static validation boundary

`validate-document.mjs` checks the returned file path, required front matter, compilation through the local renderer pipeline, available components, required props, and prop types. Diagnostics identify the path, line, column, and problem. A successful result proves only these static checks.

Use diagnostics to repair the document. Do not treat a created file, a route, or a browser request as proof that the document is ready. The URL in a successful result is the user handoff target.

Before final validation, read the complete document once. Confirm that it answers every requested point, contains no placeholders, preserves factual freshness and uncertainty, protects private content, uses useful link and image text, labels visual controls, stays readable on a narrow screen, and has one clear conclusion.

## Bounded failure handling

If validation succeeds, send a short Telegram message with the returned URL and a useful one-sentence description.

If validation still fails after the allowed rounds, or an earlier stop condition is reached, stop the document workflow. Send the useful answer in Telegram. State briefly that the richer document could not be prepared when that context helps the user.

Do not delay the underlying answer while you continue an unsuccessful document repair loop.
