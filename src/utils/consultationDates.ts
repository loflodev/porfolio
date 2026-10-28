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
