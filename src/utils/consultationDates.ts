import { CONSULTATION_TIME_ZONE, CONSULTATION_WINDOW_DAYS } from '../constants';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const DAY_MS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

// en-CA formats dates as YYYY-MM-DD, the value format of <input type="date">.
const montrealDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: CONSULTATION_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** First and last bookable dates for the date picker, in Montreal time (the backend decides). */
export const consultationDateRange = (now = Date.now()) => ({
  min: montrealDate.format(now),
  max: montrealDate.format(now + CONSULTATION_WINDOW_DAYS * DAY_MS),
});

const TWO_DIGITS = 2;
const MONTH_OFFSET = 1;
const SATURDAY = 6;
const SUNDAY = 0;
const DAY_STEP = 1;

const pad = (value: number) => String(value).padStart(TWO_DIGITS, '0');

/** A calendar day (as the date picker hands it, in local time) as YYYY-MM-DD. */
export const toIsoDate = (day: Date): string =>
  `${day.getFullYear()}-${pad(day.getMonth() + MONTH_OFFSET)}-${pad(day.getDate())}`;

/** A YYYY-MM-DD date as a local-time Date at midnight, for the date picker. */
export const fromIsoDate = (date: string): Date => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - MONTH_OFFSET, day);
};

/**
 * Weekdays of the booking window, used when the server's list of bookable dates can't be loaded.
 * The times of a picked day still come from the server.
 */
export const weekdaysInWindow = (now = Date.now()): string[] => {
  const { min, max } = consultationDateRange(now);
  const dates: string[] = [];

  for (let day = fromIsoDate(min); toIsoDate(day) <= max; day.setDate(day.getDate() + DAY_STEP)) {
    const weekday = day.getDay();
    if (weekday !== SATURDAY && weekday !== SUNDAY) {
      dates.push(toIsoDate(day));
    }
  }
  return dates;
};
