import type { ChangeEvent, FormEvent } from 'react';
import { IoCalendarOutline, IoChevronDown, IoPaperPlane } from 'react-icons/io5';
import PulseLoader from 'react-spinners/PulseLoader';

import {
  CONSULTATION_SUBJECT,
  CONTACT_SUBJECTS,
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
} from '../../../constants';
import useTranslation from '../../../hooks/useTransalation';
import type { SlotsStatus } from '../../../pages/Contact/useConsultationSlots';
import type { ContactFormInputType } from '../../../types';
import { consultationDateRange } from '../../../utils/consultationDates';

type ConsultationSlots = { slots: string[]; status: SlotsStatus };

const NO_SLOTS = 0;

type ContactFormProps = {
  data: ContactFormInputType;
  consultationSlots: ConsultationSlots;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  loading: boolean;
};

type FieldName = keyof ContactFormInputType['errorMessage'];

const fieldId = (name: FieldName) => `contact-${name}`;
const errorId = (name: FieldName) => `contact-${name}-error`;

const FieldError = ({
  name,
  message,
  className,
}: {
  name: FieldName;
  message?: string;
  className?: string;
}) => {
  const { t } = useTranslation();

  return message ? (
    <p id={errorId(name)} className={className} role="alert">
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
  return slots.length ? 'consultation.selectTime' : 'consultation.noTimes';
};

const ConsultationFields = ({
  data,
  consultationSlots,
  handleChange,
}: Pick<ContactFormProps, 'data' | 'consultationSlots' | 'handleChange'>) => {
  const { t } = useTranslation();
  const errors = data.errorMessage;
  const { min, max } = consultationDateRange();
  const hasTimes =
    consultationSlots.status === 'ready' && consultationSlots.slots.length > NO_SLOTS;

  return (
    <div className="input-wrapper consultation-fields">
      <div>
        <label htmlFor={fieldId('consultationDate')} className="form-label">
          {t('consultation.date')}
        </label>
        <div className="form-control-icon">
          <input
            id={fieldId('consultationDate')}
            type="date"
            name="consultationDate"
            value={data.consultationDate}
            onChange={handleChange}
            className="form-input max-input-heigth"
            min={min}
            max={max}
            aria-required="true"
            {...errorProps('consultationDate', errors.consultationDate)}
          />
          <IoCalendarOutline aria-hidden="true" />
        </div>
        <FieldError name="consultationDate" message={errors.consultationDate} className="pl-4" />
      </div>

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
            disabled={!hasTimes}
            aria-required="true"
            aria-describedby={
              errors.consultationTime ? errorId('consultationTime') : 'contact-time-zone-hint'
            }
            aria-invalid={errors.consultationTime ? true : undefined}
          >
            <option value="" disabled>
              {t(timePlaceholderKey(Boolean(data.consultationDate), consultationSlots))}
            </option>
            {hasTimes &&
              consultationSlots.slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
          </select>
          <IoChevronDown aria-hidden="true" />
        </div>
        <p id="contact-time-zone-hint" className="form-hint">
          {t('consultation.timeZoneHint')}
        </p>
        <FieldError name="consultationTime" message={errors.consultationTime} className="pl-4" />
      </div>
    </div>
  );
};

const ContactForm = ({
  data,
  consultationSlots,
  handleSubmit,
  handleChange,
  loading,
}: ContactFormProps) => {
  const { t } = useTranslation();
  const errors = data.errorMessage;
  const isConsultation = data.subject === CONSULTATION_SUBJECT;

  return (
    <section className="contact-form">
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
            <FieldError name="fullName" message={errors.fullName} className="pl-4 text-white-2" />
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
            <FieldError name="email" message={errors.email} className="pl-4" />
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
            handleChange={handleChange}
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
            <FieldError
              name="yourMessage"
              message={errors.yourMessage}
              className="pl-4 text-orange-yellow-crayola"
            />
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
