import {
  CONSULTATION_TIME_ZONE,
  CONSULTATION_WINDOW_DAYS,
} from '../../../src/constants/app.constants';

// Consultation slots are 30 minutes, Monday to Friday, 9:00 to 17:00 Montreal time. Dates and
// times travel as Montreal-local strings (YYYY-MM-DD, HH:MM) so a slot means the same thing to
// every visitor whatever their own time zone.
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MINUTE_MS = 60_000;
const DAY_MS = HOURS_PER_DAY * MINUTES_PER_HOUR * MINUTE_MS;
const OPENING_HOUR = 9;
const CLOSING_HOUR = 17;
const SLOT_MINUTES = 30;
// Slots starting sooner than this are not offered, so there's time to prepare.
const MIN_LEAD_MINUTES = 120;
const MONDAY = 1;
const FRIDAY = 5;
const MONTH_OFFSET = 1;
const TWO_DIGITS = 2;
const ISO_DATE_START = 0;
const ISO_DATE_LENGTH = 10;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

const pad = (value: number): string => String(value).padStart(TWO_DIGITS, '0');

const parseDate = (date: string): number => {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - MONTH_OFFSET, day);
};

const formatDate = (utcMs: number): string =>
  new Date(utcMs).toISOString().slice(ISO_DATE_START, ISO_DATE_LENGTH);

// Rejects impossible dates such as 2026-02-30, which Date.UTC would silently roll over.
export const isValidDate = (date: string): boolean =>
  DATE_PATTERN.test(date) && formatDate(parseDate(date)) === date;

const zoneFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CONSULTATION_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const zonedParts = (instant: number) => {
  const parts = zoneFormatter.formatToParts(new Date(instant));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
};

// How far Montreal is ahead of UTC at a given instant, in ms (negative: EST -5h, EDT -4h).
const zoneOffsetMs = (instant: number): number => {
  const { year, month, day, hour, minute } = zonedParts(instant);
  const flooredInstant = instant - (instant % MINUTE_MS);

  return Date.UTC(year, month - MONTH_OFFSET, day, hour, minute) - flooredInstant;
};

export const todayInZone = (now: number): string => {
  const { year, month, day } = zonedParts(now);
  return `${year}-${pad(month)}-${pad(day)}`;
};

/** The UTC instant a Montreal-local slot starts at, daylight saving time included. */
export const slotStartsAt = (date: string, time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  const asIfUtc = parseDate(date) + (hour * MINUTES_PER_HOUR + minute) * MINUTE_MS;

  return asIfUtc - zoneOffsetMs(asIfUtc - zoneOffsetMs(asIfUtc));
};

const isWeekday = (date: string): boolean => {
  const weekday = new Date(parseDate(date)).getUTCDay();
  return weekday >= MONDAY && weekday <= FRIDAY;
};

const isWithinWindow = (date: string, now: number): boolean => {
  const today = todayInZone(now);
  const lastDay = formatDate(parseDate(today) + CONSULTATION_WINDOW_DAYS * DAY_MS);

  return date >= today && date <= lastDay;
};

/** Every slot of a weekday, e.g. ['09:00', '09:30', …, '16:30']; none on weekends. */
export const listDaySlots = (date: string): string[] => {
  if (!isWeekday(date)) {
    return [];
  }

  const slots: string[] = [];
  for (
    let minutes = OPENING_HOUR * MINUTES_PER_HOUR;
    minutes < CLOSING_HOUR * MINUTES_PER_HOUR;
    minutes += SLOT_MINUTES
  ) {
    slots.push(`${pad(Math.floor(minutes / MINUTES_PER_HOUR))}:${pad(minutes % MINUTES_PER_HOUR)}`);
  }
  return slots;
};

/** Slots of `date` that are still open: in the booking window, not too soon and not taken. */
export const availableSlots = (date: string, now: number, taken: ReadonlySet<string>): string[] => {
  if (!isValidDate(date) || !isWithinWindow(date, now)) {
    return [];
  }

  const earliestStart = now + MIN_LEAD_MINUTES * MINUTE_MS;
  return listDaySlots(date).filter(
    (time) => !taken.has(time) && slotStartsAt(date, time) >= earliestStart
  );
};

/** Whether a slot follows the booking rules, ignoring whether someone already took it. */
export const isBookableSlot = (date: string, time: string, now: number): boolean =>
  TIME_PATTERN.test(time) && availableSlots(date, now, new Set()).includes(time);
