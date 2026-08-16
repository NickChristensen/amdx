import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { compile } from "@mdx-js/mdx";
import { isInternalHref } from "../src/components/ui/link-utils.ts";
import { mdxCompileOptions } from "../src/lib/mdx-compile-options.ts";
import { parseMdxSource } from "../src/lib/mdx-source.ts";

test("strips YAML front matter before the renderer compiles the document body", async () => {
  const source = `---
title: frontmatter-only-title
agent: frontmatter-only-agent
created: 2099-12-31T12:34:56-06:00
---

# rendered-body-heading

rendered-body-paragraph
`;

  const renderableSource = parseMdxSource(source).source;
  const compiled = String(await compile(renderableSource, mdxCompileOptions));

  assert.doesNotMatch(renderableSource, /frontmatter-only-title|frontmatter-only-agent/);
  assert.match(renderableSource, /rendered-body-heading|rendered-body-paragraph/);
  assert.doesNotMatch(compiled, /frontmatter-only-title|frontmatter-only-agent/);
  assert.match(compiled, /rendered-body-heading|rendered-body-paragraph/);
});

test("renders alert marker syntax as an ordinary blockquote", async () => {
  const source = "> [!NOTE]\n> This remains a plain blockquote.\n";
  const compiled = String(await compile(source, mdxCompileOptions));

  assert.match(compiled, /_components\.blockquote/);
  assert.match(compiled, /\[!NOTE\]/);
  assert.match(compiled, /This remains a plain blockquote\./);
  assert.doesNotMatch(compiled, /markdown-alert/);
});

test("keeps the shared text-link class contract", async () => {
  const linkStylesSource = await readFile(
    new URL("../src/components/ui/link-utils.ts", import.meta.url),
    "utf8",
  );

  assert.match(linkStylesSource, /export const textLinkClasses = "text-primary underline-offset-4 hover:underline"/);
  assert.equal(isInternalHref("/reports/latest"), true);
  assert.equal(isInternalHref("https://example.com/report"), false);
});

test("routes shared text-link classes through MDX links and variants", async () => {
  const [mdxComponentsSource, buttonSource, badgeSource, tweetSource] = await Promise.all([
    readFile(new URL("../src/components/mdx/mdx-components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/button.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ui/badge.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/custom/tweet.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(mdxComponentsSource, /import NextLink from "next\/link"/);
  assert.match(mdxComponentsSource, /isInternalHref\(href\)/);
  assert.match(mdxComponentsSource, /className=\{cn\(textLinkClasses, className\)\}/);
  assert.match(buttonSource, /default: "bg-primary text-primary-foreground hover:bg-primary\/80"/);
  assert.match(buttonSource, /href\?: string/);
  assert.match(buttonSource, /const Component = isInternalHref\(href\) \? NextLink : "a"/);
  assert.match(buttonSource, /isInternalHref\(href\)/);
  assert.match(buttonSource, /link: textLinkClasses/);
  assert.match(badgeSource, /href\?: string/);
  assert.match(badgeSource, /const Component = isInternalHref\(href\) \? NextLink : "a"/);
  assert.match(badgeSource, /isInternalHref\(href\)/);
  assert.match(badgeSource, /link: textLinkClasses/);
  assert.match(tweetSource, /className=\{textLinkClasses\}/);
});

test("compiles Button and Badge href navigation without paragraph wrappers", async () => {
  const compiled = String(
    await compile(
      '<Button href="/">Open the index</Button>\n<Badge href="/">Status</Badge>',
      mdxCompileOptions,
    ),
  );

  assert.match(compiled, /_jsx\(Button, \{[\s\S]*href: "\/"/);
  assert.match(compiled, /_jsx\(Badge, \{[\s\S]*href: "\/"/);
  assert.doesNotMatch(compiled, /children: _jsx\(_components\.p/);
});
