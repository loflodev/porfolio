import { es } from 'date-fns/locale/es';
import { fr } from 'date-fns/locale/fr';
import { useEffect, useRef, type ReactNode } from 'react';
import { DayPicker, type Locale } from 'react-day-picker';
import 'react-day-picker/style.css';

import { fromIsoDate, toIsoDate } from '../../../utils/consultationDates';

// Only the site's languages: `react-day-picker/locale` re-exports every date-fns locale. English
// is DayPicker's default (undefined).
const CALENDAR_LOCALES: Record<string, Locale> = { es, fr };
const MONDAY = 1;
const DAY_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

type ConsultationCalendarProps = {
  /** Selected YYYY-MM-DD date, or '' when none. */
  value: string;
  onSelect: (date: string) => void;
  /** First and last month shown, as YYYY-MM-DD dates within them. */
  min: string;
  max: string;
  bookableDates: ReadonlySet<string>;
  language: string;
  footer?: ReactNode;
};

// Loaded on demand (react-day-picker and its locales) once a visitor picks Consultation.
const ConsultationCalendar = ({
  value,
  onSelect,
  min,
  max,
  bookableDates,
  language,
  footer,
}: ConsultationCalendarProps) => {
  const selected = value ? fromIsoDate(value) : undefined;
  const rootRef = useRef<HTMLDivElement>(null);

  // Opened from the date field: move focus to the day the arrow keys start from (the selected
  // day, else today or the first open one), so keyboard users land in the grid.
  useEffect(() => {
    rootRef.current?.querySelector<HTMLButtonElement>('.rdp-day_button[tabindex="0"]')?.focus();
  }, []);
  // The default label spells the day as "29th", which no longer contains the visible "29".
  const dayLabel = new Intl.DateTimeFormat(language, DAY_LABEL_FORMAT);

  return (
    <div ref={rootRef}>
      <DayPicker
        mode="single"
        required
        className="consultation-calendar"
        selected={selected}
        onSelect={(day) => onSelect(toIsoDate(day))}
        defaultMonth={selected ?? fromIsoDate(min)}
        startMonth={fromIsoDate(min)}
        endMonth={fromIsoDate(max)}
        disabled={(day) => !bookableDates.has(toIsoDate(day))}
        weekStartsOn={MONDAY}
        locale={CALENDAR_LOCALES[language]}
        labels={{ labelDayButton: (day) => dayLabel.format(day) }}
        footer={footer}
      />
    </div>
  );
};

export default ConsultationCalendar;
