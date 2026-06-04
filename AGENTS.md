# AGENTS.md

This project is AMDX: a local Next.js app that lazily renders agent-written
`.mdx` reports from `~/.openclaw/media/mdx`.

## Commands

- `npm run dev` starts the local dev server. Port `3000` may already be in use;
  Next will choose another port, commonly `3002`.
- `npm run lint` must pass after source changes.
- `npm run build` must pass after source changes.
- Package installs generally require approval because network access is
  restricted. Ask directly before running `npm install ...`.

## Content Model

- Source files live outside the repo in `~/.openclaw/media/mdx`.
- Only lowercase `.mdx` is supported.
- Routes are extensionless:
  - `/demo` maps to `~/.openclaw/media/mdx/demo.mdx`
  - `/reports/foo` maps to `~/.openclaw/media/mdx/reports/foo.mdx`
- Path resolution is centralized in `src/lib/content.ts`; keep the path
  containment guard intact.
- Rendering is lazy: the requested MDX file is read and compiled on request.
- Do not add static generation over the whole media directory. The directory is
  expected to grow.
- The root index currently recursively lists `.mdx` files. If this becomes too
  expensive, replace it with pagination, a manifest, or an index database rather
  than eager rendering.

## MDX Pipeline

The renderer is `src/components/mdx/mdx-renderer.tsx`.

Current remark plugins:

- `remark-gfm` for GitHub Flavored Markdown: tables, strikethrough, task lists,
  autolink literals, etc.
- `remark-flexible-markers` for `==highlight==`, emitted as semantic `<mark>`.

Current rehype plugin:

- `rehype-pretty-code` for Shiki syntax highlighting.
- Themes are `github-light` in light mode and `github-dark` in dark mode.

Shiki theme switching relies on CSS variables in `src/app/globals.css`.

## Component Catalog

The component map is `src/components/mdx/mdx-components.tsx`.

Keep a clear distinction between:

- **Agent-facing components:** capitalized names agents may write directly in
  MDX, such as `<Card>...</Card>`.
- **Element overrides:** lowercase HTML/Markdown elements that are rendered with
  app components, such as `table`, `thead`, `tbody`, `tr`, `th`, and `td`.

Capitalized entries are the curated agent catalog. Do not add arbitrary app
components there casually. Lowercase element overrides do not make the
underlying shadcn component names globally available to MDX.

Current agent-facing component:

- `Card`

Current element overrides:

- `a`: internal links use Next `Link`; external links open with
  `target="_blank"` and `rel="noreferrer"`.
- Table tags render through generated shadcn table primitives.

Markdown inside JSX children is supported when written with normal MDX block
spacing, for example:

```mdx
<Card>

## Heading

**Bold**, *italic*, ~~strike~~, ==highlight==.

</Card>
```

## Styling

- Global styles live in `src/app/globals.css`.
- The shadcn preset is recorded in `package.json` as `b2wz1laZLk`.
- The preset has been applied for theme/font. `shadcn info` may report a
  normalized equivalent preset code, but the intended attributes are indigo
  theme, Inter body font, and Outfit heading font.
- shadcn components should be generated fresh in this project, not copied from
  Prism.
- Use `npx shadcn@latest add <component> --yes` for new shadcn components, with
  approval.

## Known Issues

See `TODO.md`.

Current known issue:

- On a real phone, Markdown tables may cause page-level horizontal scroll
  instead of confining scroll to the generated shadcn table container. Agent
  Browser/Chromium mobile emulation did not reproduce the issue. Prefer real
  mobile Safari inspection before adding broad overflow guards.

## Trust Policy Notes

This has not been finalized yet.

Important current facts:

- MDX is treated as trusted local content written by the user's agents.
- The runtime compiles MDX on request and evaluates the compiled function body.
- The curated component map is the main convenience and safety boundary.
- Future trust hardening may restrict MDX imports/exports, expressions, raw HTML,
  or available components. Preserve the catalog/element-override separation when
  making those changes.

## Related Paths

- `src/app/[[...slug]]/page.tsx`: dynamic route and index page.
- `src/lib/content.ts`: media directory, route listing, path safety.
- `src/components/mdx/mdx-renderer.tsx`: MDX compile/render pipeline.
- `src/components/mdx/mdx-components.tsx`: MDX component map.
- `src/components/ui/*`: generated shadcn components.
- `~/.openclaw/media/mdx/demo.mdx`: current demo document.
