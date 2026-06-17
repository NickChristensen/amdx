import { Clock, MapPin } from "lucide-react";
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
  summary: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  backgroundColor?: string;
};

type CalendarProps = {
  events: CalendarEventProps[];
};

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

function CalendarEventCard({
  summary,
  start,
  end,
  allDay = false,
  location,
  backgroundColor = "var(--primary)",
}: CalendarEventProps) {
  const height = allDay
    ? ALL_DAY_HEIGHT
    : getHeight(getMinutesBetween(start, end));
  const shades = getShadeScale(backgroundColor);
  const iconWrapperClasses = "flex items-center gap-0.5";
  const iconClasses = "w-2.5 h-2.5 shrink-0";
  const layoutInline = allDay || height < 48;

  return (
    <div
      className="flex overflow-hidden rounded-lg border p-2 text-xs/snug"
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
    </div>
  );
}

function GhostGap({ minutes }: { minutes: number }) {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-1">
      <span className="text-sm text-muted-foreground">
        {formatCalendarDuration(minutes)}
      </span>
    </div>
  );
}

type CalendarDayEvent = CalendarProps["events"][number];

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

export function Calendar(props: CalendarProps) {
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
    <div className="flex flex-col gap-4">
      {dayGroups.map(([day, events]) => (
        <div key={day} className="flex flex-col gap-2">
          {showDayHeadings ? <DateHeading date={events[0]?.start ?? day} /> : null}
          <CalendarDay events={events} />
        </div>
      ))}
    </div>
  );
}
