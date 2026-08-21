import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("CalendarCard derives the canonical Google Calendar event URL", async () => {
  const source = await readFile(
    new URL("../src/components/custom/calendar.tsx", import.meta.url),
    "utf8",
  );

  const expectedEid = Buffer.from("event-id calendar-id", "utf8").toString("base64url");
  assert.equal(
    `https://www.google.com/calendar/event?eid=${expectedEid}`,
    "https://www.google.com/calendar/event?eid=ZXZlbnQtaWQgY2FsZW5kYXItaWQ",
  );
  assert.match(source, /import \{ Buffer \} from "node:buffer";/);
  assert.match(
    source,
    /Buffer\.from\(`\$\{id\} \$\{calendarId\}`, "utf8"\)\.toString\("base64url"\)/,
  );
  assert.match(
    source,
    /return `https:\/\/www\.google\.com\/calendar\/event\?eid=\$\{eid\}`;/,
  );
  assert.match(
    source,
    /const \[year, month, day\] = getCalendarDayKey\(start\)\.split\("-"\)\.map\(Number\);/,
  );
  assert.match(
    source,
    /return `https:\/\/calendar\.google\.com\/calendar\/r\/day\/\$\{year\}\/\$\{month\}\/\$\{day\}`;/,
  );
  assert.equal(
    `https://calendar.google.com/calendar/r/day/${2026}/${8}/${14}`,
    "https://calendar.google.com/calendar/r/day/2026/8/14",
  );
  assert.doesNotMatch(source, /calendar\.google\.com\/calendar\/u\//);
});

test("CalendarCard always links the whole event", async () => {
  const source = await readFile(
    new URL("../src/components/custom/calendar.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /const href =\s*id && calendarId\s*\n\s*\? googleCalendarEventHref\(id, calendarId\)\s*\n\s*: googleCalendarDayHref\(start\);/,
  );
  assert.match(
    source,
    /return \(\s*<a\s+href=\{href\}\s+className="flex overflow-hidden rounded-md border p-2 text-xs\/snug"/,
  );
  assert.doesNotMatch(source, /const wrapperProps/);
  assert.doesNotMatch(source, /const content/);
  assert.doesNotMatch(source, /<div \{\.\.\.wrapperProps\}>\{content\}<\/div>/);
});
