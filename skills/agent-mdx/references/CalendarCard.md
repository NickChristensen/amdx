# CalendarCard

Renders calendar events as a local-day agenda with times, durations, locations, and source colors. Use to show a schedule or help readers understand upcoming commitments.

**Layout:** Block

## Props

```ts
export type CalendarCardProps = {
  /** Calendar event records, typically from a calendar agenda, grouped by day and sorted by start time. */
  events: CalendarEventProps[];
};

export type CalendarEventProps = {
  /** Calendar event title shown in the schedule. */
  summary: string;

  /** ISO 8601 event start: timed events use a date-time with a timezone offset; all-day events may use a date-only value with allDay true. */
  start: string;

  /** ISO 8601 event end: timed events use a date-time with a timezone offset; all-day events may use a date-only value with allDay true. */
  end: string;

  /** Whether the calendar event is all-day rather than time-specific. */
  allDay?: boolean;

  /** Optional calendar event location or address; only its first line is displayed. */
  location?: string;

  /** Optional CSS color from the source calendar, used for the event accent. */
  backgroundColor?: string;
};
```

## Defaults

```ts
export const calendarCardDefaults = {} satisfies AgentMdxDefaults<CalendarCardProps>;
```

## Guidance

- For timed events, pass start and end as ISO 8601 date-times with timezone offsets so sorting and displayed local times are correct.
- All-day events may use ISO 8601 date-only start and end values with allDay set to true; omit it or use false for timed events.
- Pass the source calendar color as backgroundColor when preserving calendar identity matters; otherwise omit it for the primary accent.

## Examples

### Basic calendar

```mdx
<CalendarCard
  events={[
    {
      summary: "Team standup",
      start: "2026-08-14T09:00:00-05:00",
      end: "2026-08-14T09:30:00-05:00",
    },
    {
      summary: "Design review",
      start: "2026-08-14T13:00:00-05:00",
      end: "2026-08-14T14:00:00-05:00",
      location: "Conference room",
    },
  ]}
/>
```

### Calendar with an all-day event

```mdx
<CalendarCard
  events={[
    {
      summary: "Company holiday",
      start: "2026-08-17",
      end: "2026-08-18",
      allDay: true,
    },
    {
      summary: "Planning session",
      start: "2026-08-18T10:00:00-05:00",
      end: "2026-08-18T11:30:00-05:00",
      location: "Room 204",
      backgroundColor: "var(--chart-2)",
    },
  ]}
/>
```
