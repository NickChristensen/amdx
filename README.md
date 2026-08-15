# AMDX

AMDX is a local Next.js reading surface for trusted MDX documents written by OpenClaw agents. An agent creates a document in the gitignored `documents/` directory, validates it with the bundled Agent MDX skill, and sends its rendered Tailscale URL to the user.

The app uses Markdown, GitHub Flavored Markdown, Shiki code highlighting, `==highlight==`, and a small curated catalog of React components. Agents can write only the capitalized components exposed by `agentMdxComponents`; the app owns standard Markdown and HTML element overrides.

## Agent workflow

1. Load `skills/agent-mdx` when the response needs a richer presentation than Telegram.
2. Run its `create-document` helper from the OpenClaw workspace.
3. Write the returned `.mdx` file and validate it with the skill's `validate-document` helper.
4. Send the URL from the latest successful validation result.

Documents are lazy-rendered by extensionless route. For example, `documents/2026-08-14/finances/market-review.mdx` is available at `https://amdx.pony-rattlesnake.ts.net/2026-08-14/finances/market-review`.

## Component documentation

Each agent-facing component keeps its exported props, JSDoc, and typed metadata next to its implementation. `npm run generate:component-docs` updates the bounded skill index and exact-name generated component references. `npm run test:component-docs` validates the source contract, examples, generator behavior, and generated-file drift.

Run `npm run lint` and `npm run build` after source changes.

## Git hooks

`npm install` runs the `prepare` script to install Husky hooks. The Husky pre-push hook runs the read-only `npm run test:component-docs` gate and blocks pushes when generated component documentation drifts. `npm run generate:component-docs` remains an explicit command.
