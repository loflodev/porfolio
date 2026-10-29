import {
  lazy,
  Suspense,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { IoCalendarOutline, IoChevronDown, IoPaperPlane } from 'react-icons/io5';
import PulseLoader from 'react-spinners/PulseLoader';

import {
  CONSULTATION_SUBJECT,
  CONTACT_FORM_ID,
  CONTACT_SUBJECTS,
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
} from '../../../constants';
import useEscapeKey from '../../../hooks/useEscapeKey';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useTranslation from '../../../hooks/useTransalation';
import type { BookableDatesStatus } from '../../../pages/Contact/useBookableDates';
import type { SlotsStatus } from '../../../pages/Contact/useConsultationSlots';
import type { ConsultationSlot } from '../../../services/api/consultation';
import type { ContactFormInputType } from '../../../types';
import { consultationDateRange, fromIsoDate } from '../../../utils/consultationDates';

const ConsultationCalendar = lazy(() => import('./ConsultationCalendar'));

type ConsultationSlots = { slots: ConsultationSlot[]; status: SlotsStatus };
type BookableDates = { dates: ReadonlySet<string>; status: BookableDatesStatus };

type ContactFormProps = {
  data: ContactFormInputType;
  consultationSlots: ConsultationSlots;
  bookableDates: BookableDates;
  handleDateSelect: (date: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  loading: boolean;
};

type FieldName = keyof ContactFormInputType['errorMessage'];

const fieldId = (name: FieldName) => `contact-${name}`;
const errorId = (name: FieldName) => `contact-${name}-error`;

// Errors use the focus accent: the dark page makes the default text color unreadable.
const FieldError = ({ name, message }: { name: FieldName; message?: string }) => {
  const { t } = useTranslation();

  return message ? (
    <p id={errorId(name)} className="pl-4 text-orange-yellow-crayola" role="alert">
      {t(message)}
    </p>
  ) : null;
};

// Wires a field to its visible error so screen readers announce it with the field.
const errorProps = (name: FieldName, message: string) =>
  message ? { 'aria-invalid': true, 'aria-describedby': errorId(name) } : {};

// What the time picker says before it has times to offer, or when there are none.
const timePlaceholderKey = (hasDate: boolean, { slots, status }: ConsultationSlots): string => {
  if (!hasDate) return 'consultation.pickDateFirst';
  if (status === 'loading') return 'consultation.loadingTimes';
  if (status === 'error') return 'consultation.timesUnavailable';
  return slots.some((slot) => slot.available) ? 'consultation.selectTime' : 'consultation.noTimes';
};

// The calendar's live-region footer: progress while the open days load, or why they're a guess.
const calendarStatusKey = (status: BookableDates['status']): string | null => {
  if (status === 'loading') return 'consultation.loadingDays';
  if (status === 'error') return 'consultation.daysUnavailable';
  return null;
};

const LANGUAGE_PART = 0;

const DATE_POPOVER_ID = 'contact-consultationDate-calendar';
const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

// Tallest the popover gets (a six-week month plus the footer), to pick a side before it renders.
const POPOVER_HEIGHT = 380;

type PopoverPlacement = 'below' | 'above';

// Below the field unless that would push past the bottom of the page (adding empty space) or
// of the screen while there's room above.
const popoverPlacement = (field: HTMLElement): PopoverPlacement => {
  const rect = field.getBoundingClientRect();
  const fitsAboveOnScreen = rect.top >= POPOVER_HEIGHT;
  const fitsBelowOnScreen = window.innerHeight - rect.bottom >= POPOVER_HEIGHT;
  const pageBottom = document.documentElement.scrollHeight;
  const fitsBelowInPage = rect.bottom + window.scrollY + POPOVER_HEIGHT <= pageBottom;
  const fitsAboveInPage = rect.top + window.scrollY >= POPOVER_HEIGHT;

  if (fitsAboveOnScreen && !fitsBelowOnScreen) return 'above';
  return !fitsBelowInPage && fitsAboveInPage ? 'above' : 'below';
};

// A field-styled button that opens the calendar in a popover; picking a day, Escape or a click
// outside closes it and hands focus back to the button.
const ConsultationDateField = ({
  value,
  error,
  bookableDates,
  handleDateSelect,
}: {
  value: string;
  error: string;
  bookableDates: BookableDates;
  handleDateSelect: (date: string) => void;
}) => {
  const { t, getCurrentLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement>('below');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { min, max } = consultationDateRange();
  const statusKey = calendarStatusKey(bookableDates.status);
  const language = getCurrentLanguage().split('-')[LANGUAGE_PART];

  const closeAndRefocus = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  useEscapeKey(closeAndRefocus, isOpen);
  useOutsideClick(wrapperRef, close);

  const toggle = () => {
    if (!isOpen && triggerRef.current) {
      setPlacement(popoverPlacement(triggerRef.current));
    }
    setIsOpen((open) => !open);
  };

  const selectDate = (date: string) => {
    handleDateSelect(date);
    closeAndRefocus();
  };

  return (
    <div ref={wrapperRef} className="consultation-date">
      <label htmlFor={fieldId('consultationDate')} className="form-label">
        {t('consultation.date')}
      </label>
      <div className="date-anchor">
        <div className="form-control-icon">
          <button
            ref={triggerRef}
            id={fieldId('consultationDate')}
            type="button"
            className={`form-input max-input-heigth date-trigger ${value ? '' : 'is-empty'}`}
            onClick={toggle}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={DATE_POPOVER_ID}
            {...errorProps('consultationDate', error)}
          >
            {value
              ? new Intl.DateTimeFormat(language, SHORT_DATE_FORMAT).format(fromIsoDate(value))
              : t('consultation.selectDate')}
          </button>
          <IoCalendarOutline aria-hidden="true" />
        </div>
        {isOpen && (
          <div
            id={DATE_POPOVER_ID}
            role="dialog"
            aria-label={t('consultation.date')}
            className={`consultation-popover is-${placement}`}
          >
            <Suspense fallback={<p className="form-hint">{t('consultation.loadingDays')}</p>}>
              <ConsultationCalendar
                value={value}
                onSelect={selectDate}
                min={min}
                max={max}
                bookableDates={bookableDates.dates}
                language={language}
                footer={statusKey ? <p className="form-hint">{t(statusKey)}</p> : undefined}
              />
            </Suspense>
          </div>
        )}
      </div>
      <FieldError name="consultationDate" message={error} />
    </div>
  );
};

const ConsultationFields = ({
  data,
  consultationSlots,
  bookableDates,
  handleChange,
  handleDateSelect,
}: Pick<
  ContactFormProps,
  'data' | 'consultationSlots' | 'bookableDates' | 'handleChange' | 'handleDateSelect'
>) => {
  const { t } = useTranslation();
  const errors = data.errorMessage;
  const isReady = consultationSlots.status === 'ready';
  const hasOpenTime = isReady && consultationSlots.slots.some((slot) => slot.available);

  return (
    <div className="input-wrapper consultation-fields">
      <ConsultationDateField
        value={data.consultationDate}
        error={errors.consultationDate}
        bookableDates={bookableDates}
        handleDateSelect={handleDateSelect}
      />

      <div>
        <label htmlFor={fieldId('consultationTime')} className="form-label">
          {t('consultation.time')}
        </label>
        <div className="form-control-icon">
          <select
            id={fieldId('consultationTime')}
            name="consultationTime"
            value={data.consultationTime}
            onChange={handleChange}
            className="form-input max-input-heigth"
            disabled={!hasOpenTime}
            aria-required="true"
            aria-describedby={
              errors.consultationTime ? errorId('consultationTime') : 'contact-time-zone-hint'
            }
            aria-invalid={errors.consultationTime ? true : undefined}
          >
            <option value="" disabled>
              {t(timePlaceholderKey(Boolean(data.consultationDate), consultationSlots))}
            </option>
            {isReady &&
              consultationSlots.slots.map(({ time, available }) => (
                <option key={time} value={time} disabled={!available}>
                  {available ? time : `${time} — ${t('consultation.booked')}`}
                </option>
              ))}
          </select>
          <IoChevronDown aria-hidden="true" />
        </div>
        <p id="contact-time-zone-hint" className="form-hint">
          {t('consultation.timeZoneHint')}
        </p>
        <FieldError name="consultationTime" message={errors.consultationTime} />
      </div>
    </div>
  );
};

const ContactForm = ({
  data,
  consultationSlots,
  bookableDates,
  handleSubmit,
  handleChange,
  handleDateSelect,
  loading,
}: ContactFormProps) => {
  const { t } = useTranslation();
  const errors = data.errorMessage;
  const isConsultation = data.subject === CONSULTATION_SUBJECT;

  return (
    <section id={CONTACT_FORM_ID} className="contact-form">
      <h2 className="h3 form-title">{t('contactForm')}</h2>

      <form
        action="#"
        className="form"
        data-form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading}
      >
        {/* Honeypot field - hidden from users, bots will fill it */}
        <input
          type="text"
          name="website"
          value={data.website}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        />

        <div className="input-wrapper">
          <div>
            <label htmlFor={fieldId('fullName')} className="sr-only">
              {t('fullName')}
            </label>
            <input
              id={fieldId('fullName')}
              type="text"
              name="fullName"
              value={data.fullName}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder={t('fullName')}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="name"
              aria-required="true"
              {...errorProps('fullName', errors.fullName)}
              data-form-input
            />
            <FieldError name="fullName" message={errors.fullName} />
          </div>

          <div>
            <label htmlFor={fieldId('email')} className="sr-only">
              {t('email')}
            </label>
            <input
              id={fieldId('email')}
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder={t('email')}
              maxLength={MAX_EMAIL_LENGTH}
              autoComplete="email"
              aria-required="true"
              {...errorProps('email', errors.email)}
              data-form-input
            />
            <FieldError name="email" message={errors.email} />
          </div>
        </div>

        <div className="form-subject">
          <label htmlFor="contact-subject" className="sr-only">
            {t('contactSubject.label')}
          </label>
          <div className="form-control-icon">
            <select
              id="contact-subject"
              name="subject"
              value={data.subject}
              onChange={handleChange}
              className="form-input max-input-heigth"
            >
              {CONTACT_SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {t(`contactSubject.${subject}`)}
                </option>
              ))}
            </select>
            <IoChevronDown aria-hidden="true" />
          </div>
        </div>

        {isConsultation ? (
          <ConsultationFields
            data={data}
            consultationSlots={consultationSlots}
            bookableDates={bookableDates}
            handleChange={handleChange}
            handleDateSelect={handleDateSelect}
          />
        ) : (
          <>
            <label htmlFor={fieldId('yourMessage')} className="sr-only">
              {t('yourMessage')}
            </label>
            <textarea
              id={fieldId('yourMessage')}
              name="yourMessage"
              value={data.yourMessage}
              className="form-input"
              onChange={handleChange}
              placeholder={t('yourMessage')}
              maxLength={MAX_MESSAGE_LENGTH}
              aria-required="true"
              {...errorProps('yourMessage', errors.yourMessage)}
              data-form-input
            ></textarea>
            <FieldError name="yourMessage" message={errors.yourMessage} />
          </>
        )}

        <button className="form-btn" type="submit" disabled={loading} data-form-btn>
          {loading ? (
            <PulseLoader
              color={'var(--color-orange-yellow-crayola)'}
              size={8}
              margin={4}
              aria-hidden="true"
            />
          ) : (
            <IoPaperPlane aria-hidden="true" />
          )}

          <span>
            {loading ? t('sending') : t(isConsultation ? 'consultation.submit' : 'sendMessage')}
          </span>
        </button>
      </form>
    </section>
  );
};

export default ContactForm;
