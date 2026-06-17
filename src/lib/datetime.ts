import {
  compareAsc,
  differenceInMinutes,
  format,
  parseISO,
} from "date-fns";

export const MARKET_TIMEZONE = "America/New_York";
export const MARKET_OPEN_MINUTE = 9 * 60 + 30;
export const MARKET_CLOSE_MINUTE = 16 * 60;

export function compareCalendarStarts(
  left: { start: string },
  right: { start: string },
): number {
  return compareAsc(parseISO(left.start), parseISO(right.start));
}

export function getMinutesBetween(startTime: string, endTime: string): number {
  return Math.max(
    differenceInMinutes(parseISO(endTime), parseISO(startTime)),
    0,
  );
}

export function getCalendarDayKey(value: string): string {
  return format(parseISO(value), "yyyy-MM-dd");
}

export function formatCalendarDayHeading(value: string): string {
  return format(parseISO(value), "EEE, MMM d");
}

export function formatCalendarTime(value: string): string {
  return format(parseISO(value), "h:mm a").replace(":00 ", " ");
}

export function formatCalendarDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hourLabel = hours === 1 ? "hour" : "hours";

  if (remainingMinutes === 0) {
    return `${hours} ${hourLabel}`;
  }

  return `${hours} ${hourLabel} ${remainingMinutes} minutes`;
}

function datePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function timeZoneOffset(date: Date, timeZone: string) {
  const parts = datePartsInTimeZone(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - date.getTime();
}

function zonedDateTimeToDate({
  year,
  month,
  day,
  hour,
  minute,
  timeZone,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timeZone: string;
}) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const firstOffset = timeZoneOffset(new Date(utcGuess), timeZone);
  let resolvedTime = utcGuess - firstOffset;
  const secondOffset = timeZoneOffset(new Date(resolvedTime), timeZone);

  if (firstOffset !== secondOffset) {
    resolvedTime = utcGuess - secondOffset;
  }

  return new Date(resolvedTime);
}

export function minutesFromClockTimeLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

export function formatMarketTimeInLocalZone(
  time: string,
  options?: {
    sourceTimeZone?: string;
    referenceDate?: Date;
  },
) {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time;
  }

  const sourceTimeZone = options?.sourceTimeZone ?? MARKET_TIMEZONE;
  const referenceDate = options?.referenceDate ?? new Date();
  const marketDate = datePartsInTimeZone(referenceDate, sourceTimeZone);
  const pointDate = zonedDateTimeToDate({
    year: marketDate.year,
    month: marketDate.month,
    day: marketDate.day,
    hour: hours,
    minute: minutes,
    timeZone: sourceTimeZone,
  });

  return format(pointDate, "h:mm a");
}
