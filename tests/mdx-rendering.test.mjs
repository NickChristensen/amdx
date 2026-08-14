import assert from "node:assert/strict";
import test from "node:test";
import { compile } from "@mdx-js/mdx";
import { mdxCompileOptions } from "../src/lib/mdx-compile-options.ts";
import { renderableMdxSource } from "../src/lib/mdx-source.ts";

test("strips YAML front matter before the renderer compiles the document body", async () => {
  const source = `---
title: frontmatter-only-title
agent: frontmatter-only-agent
created: 2099-12-31T12:34:56-06:00
---

# rendered-body-heading

rendered-body-paragraph
`;

  const renderableSource = renderableMdxSource(source);
  const compiled = String(await compile(renderableSource, mdxCompileOptions));

  assert.doesNotMatch(renderableSource, /frontmatter-only-title|frontmatter-only-agent/);
  assert.match(renderableSource, /rendered-body-heading|rendered-body-paragraph/);
  assert.doesNotMatch(compiled, /frontmatter-only-title|frontmatter-only-agent/);
  assert.match(compiled, /rendered-body-heading|rendered-body-paragraph/);
});
