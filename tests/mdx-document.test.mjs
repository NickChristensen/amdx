import assert from "node:assert/strict";
import test from "node:test";
import { readMdxFile } from "../src/lib/content.ts";
import { metadataForMdxSource } from "../src/lib/mdx-source.ts";

test("generates document metadata from a trimmed front matter title", () => {
  const metadata = metadataForMdxSource(`---
title: "  Example report  "
agent: metadata-test
created: 2099-12-31T12:34:56-06:00
---

# Example report
`);

  assert.deepEqual(metadata, { title: "Example report" });
});

test("rejects a missing document with ENOENT for the route to map to notFound", async () => {
  await assert.rejects(
    readMdxFile(["2099-12-31", `missing-${process.pid}-${Date.now()}`]),
    (error) => error?.code === "ENOENT",
  );
});
