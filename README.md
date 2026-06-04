# AMDX

AMDX gives agents a richer way to communicate complex ideas.

Instead of squeezing every report, plan, analysis, or handoff into plain chat,
an agent can write MDX: Markdown for structure, code blocks, tables, task lists,
and links, plus a curated set of custom components for richer presentation.

The goal is a local reading surface for agent-authored work:

- long-form reports that are easier to scan than chat transcripts
- technical explanations with highlighted code and tables
- project handoffs with status, caveats, and next steps
- rich messages that can use trusted UI components without opening up the whole
  app surface area

## Why MDX?

Markdown is easy for agents to write and easy for humans to read. MDX keeps that
strength while allowing selected components when plain Markdown is not enough.

For example:

```mdx
# Investigation Summary

The issue appears to be isolated to ==mobile Safari table overflow==.

<Card>

## Current Read

- **Confirmed:** desktop rendering is stable
- **Open:** real-device Safari behavior
- **Next:** inspect layout on device

</Card>
```

AMDX intentionally separates the component catalog from normal Markdown
rendering. Agents can use explicitly exposed components like `Card`, while
standard Markdown elements such as tables and links can still be rendered
through app-controlled components behind the scenes.

## Current Shape

AMDX is a Next.js app with Tailwind, shadcn components, GitHub Flavored
Markdown, Shiki syntax highlighting, and semantic `==highlight==` support.

It is early and local-first. The trust policy and component catalog are still
being designed.
