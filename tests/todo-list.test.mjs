import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("TodoListCard makes the whole todo row a UUID-driven Things link", async () => {
  const source = await readFile(
    new URL("../src/components/custom/todo-list.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /<Button\s+asChild\s+variant="ghost"/);
  assert.match(
    source,
    /"h-auto w-full justify-start[^"]*font-normal",\s*item\.highlighted &&\s*"bg-primary\/10 dark:bg-primary\/30 hover:bg-primary\/10 dark:hover:bg-primary\/30"/,
  );
  assert.match(source, /<a href=\{thingsTodoHref\(item\.uuid\)\}>/);
  assert.match(
    source,
    /return `things:\/\/\/show\?id=\$\{encodeURIComponent\(uuid\)\}`;/,
  );
  assert.match(source, /\{item\.title\}/);
});
