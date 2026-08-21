import { Buffer } from "node:buffer";
import { Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import {
  compareCalendarStarts,
  formatCalendarDayHeading,
  formatCalendarDuration,
  formatCalendarTime,
  getCalendarDayKey,
  getMinutesBetween,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";

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

  /** Optional Google Calendar event ID from the source event. Use with calendarId to make the event clickable. */
  id?: string;

  /** Optional Google Calendar ID from the source event. Use with id to make the event clickable. */
  calendarId?: string;
};

export type CalendarCardProps = {
  /** Calendar event records, typically from a calendar agenda, grouped by day and sorted by start time. */
  events: CalendarEventProps[];
};

export const calendarCardMdxDocs = {
  description:
    "Renders calendar events as a local-day agenda with times, durations, locations, and source colors. Use to show a schedule or help readers understand upcoming commitments.",
  flow: "block",
  defaults: {},
  guidance: [
    "For timed events, pass start and end as ISO 8601 date-times with timezone offsets so sorting and displayed local times are correct.",
    "All-day events may use ISO 8601 date-only start and end values with allDay set to true; omit it or use false for timed events.",
    "Pass the source calendar color as backgroundColor when preserving calendar identity matters; otherwise omit it for the primary accent.",
    "Calendar events are always clickable: Google events with both id and calendarId open the exact event, and other events open that date in Google Calendar.",
    "Events from multiple dates may share one CalendarCard; it groups them by day and adds day headings.",
  ],
  examples: [
    {
      title: "Basic calendar",
      mdx: `<CalendarCard
  events={[
    {
      summary: "Team standup",
      start: "2026-08-14T09:00:00-05:00",
      end: "2026-08-14T09:30:00-05:00",
      id: "event-id",
      calendarId: "calendar-id",
    },
    {
      summary: "Design review",
      start: "2026-08-14T13:00:00-05:00",
      end: "2026-08-14T14:00:00-05:00",
      location: "Conference room",
    },
  ]}
/>`,
    },
    {
      title: "Calendar across multiple days",
      mdx: `<CalendarCard
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
/>`,
    },
  ],
} as const satisfies AgentMdxComponentDocs<CalendarCardProps>;

const HOUR_HEIGHT = 64;
const ALL_DAY_HEIGHT = 48;

function getHeight(minutes: number): number {
  return Math.max((minutes / 60) * HOUR_HEIGHT, 16) + 16;
}

function getShadeScale(color: string) {
  const whiteFormats = ["#ffffff", "#fff", "#ffffff00", "white"];
  const resolvedColor = whiteFormats.includes(color)
    ? "var(--muted-foreground)"
    : color;

  return {
    background: `color-mix(in oklab, var(--background) 82%, ${resolvedColor} 18%)`,
    border: `color-mix(in oklab, var(--background) 50%, ${resolvedColor} 50%)`,
    stripe: resolvedColor,
    text: `color-mix(in oklab, var(--foreground) 25%, ${resolvedColor} 75%)`,
  };
}

function googleCalendarEventHref(id: string, calendarId: string): string {
  const eid = Buffer.from(`${id} ${calendarId}`, "utf8").toString("base64url");
  return `https://www.google.com/calendar/event?eid=${eid}`;
}

function googleCalendarDayHref(start: string): string {
  const [year, month, day] = getCalendarDayKey(start).split("-").map(Number);
  return `https://calendar.google.com/calendar/r/day/${year}/${month}/${day}`;
}

function CalendarEventCard({
  summary,
  start,
  end,
  allDay = false,
  location,
  backgroundColor = "var(--primary)",
  id,
  calendarId,
}: CalendarEventProps) {
  const height = allDay
    ? ALL_DAY_HEIGHT
    : getHeight(getMinutesBetween(start, end));
  const shades = getShadeScale(backgroundColor);
  const iconWrapperClasses = "flex items-center gap-0.5";
  const iconClasses = "w-2.5 h-2.5 shrink-0";
  const layoutInline = allDay || height < 48;
  const href =
    id && calendarId
      ? googleCalendarEventHref(id, calendarId)
      : googleCalendarDayHref(start);
  return (
    <a
      href={href}
      className="flex overflow-hidden rounded-md border p-2 text-xs/snug"
      style={{
        borderColor: shades.border,
        backgroundColor: shades.background,
        color: shades.text,
        height,
      }}
    >
      <div
        className="w-1 shrink-0 rounded-sm"
        style={{ backgroundColor: shades.stripe }}
      />

      <div
        className={cn(
          "grow shrink-0 pl-2",
          layoutInline && "flex items-center gap-2",
        )}
      >
        <p className="font-bold">{summary}</p>
        {allDay ? null : (
          <div className={iconWrapperClasses}>
            <Clock className={iconClasses} />
            <p>
              {formatCalendarTime(start)} - {formatCalendarTime(end)}
            </p>
          </div>
        )}
      </div>
      {location ? (
        <div
          className={cn(
            iconWrapperClasses,
            "shrink grow-0 pl-2",
            layoutInline ? "self-center" : "self-start",
          )}
        >
          <MapPin className={iconClasses} />
          <p className="truncate">{location.split("\n")[0]}</p>
        </div>
      ) : null}
    </a>
  );
}

function GhostGap({ minutes }: { minutes: number }) {
  return (
    <div className="flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 py-1">
      <span className="text-sm text-muted-foreground">
        {formatCalendarDuration(minutes)}
      </span>
    </div>
  );
}

type CalendarDayEvent = CalendarCardProps["events"][number];

function CalendarDay({ events }: { events: CalendarDayEvent[] }) {
  const sortedEvents = [...events].sort(compareCalendarStarts);

  const items: Array<
    | { type: "gap"; minutes: number }
    | { type: "event"; event: (typeof sortedEvents)[number] }
  > = [];

  sortedEvents.forEach((event, index) => {
    if (index > 0) {
      const previousEvent = sortedEvents[index - 1];
      const gapMinutes = getMinutesBetween(previousEvent.end, event.start);

      if (gapMinutes > 0) {
        items.push({
          type: "gap",
          minutes: gapMinutes,
        });
      }
    }

    items.push({
      type: "event",
      event,
    });
  });

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) =>
        item.type === "gap" ? (
          <GhostGap key={`gap-${index}`} minutes={item.minutes} />
        ) : (
          <CalendarEventCard
            key={`${item.event.start}-${item.event.summary}-${index}`}
            {...item.event}
          />
        ),
      )}
    </div>
  );
}

function DateHeading({ date }: { date: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {formatCalendarDayHeading(date)}
    </p>
  );
}

export function CalendarCard(props: CalendarCardProps) {
  const eventsByDay = new Map<string, CalendarDayEvent[]>();

  for (const event of props.events) {
    const dayKey = getCalendarDayKey(event.start);
    const dayEvents = eventsByDay.get(dayKey);

    if (dayEvents) {
      dayEvents.push(event);
    } else {
      eventsByDay.set(dayKey, [event]);
    }
  }

  const dayGroups = [...eventsByDay.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const showDayHeadings = dayGroups.length > 1;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {dayGroups.map(([day, events]) => (
          <div key={day} className="flex flex-col gap-2">
            {showDayHeadings ? (
              <DateHeading date={events[0]?.start ?? day} />
            ) : null}
            <CalendarDay events={events} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
