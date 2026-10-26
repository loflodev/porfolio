import type { ChangeEvent, FormEvent } from 'react';
import { IoPaperPlane } from 'react-icons/io5';
import PulseLoader from 'react-spinners/PulseLoader';

import { MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '../../../constants';
import useTranslation from '../../../hooks/useTransalation';
import type { ContactFormInputType } from '../../../types';

type ContactFormProps = {
  data: ContactFormInputType;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
}) =>
  message ? (
    <p id={errorId(name)} className={className} role="alert">
      {message}
    </p>
  ) : null;

// Wires a field to its visible error so screen readers announce it with the field.
const errorProps = (name: FieldName, message: string) =>
  message ? { 'aria-invalid': true, 'aria-describedby': errorId(name) } : {};

const ContactForm = ({ data, handleSubmit, handleChange, loading }: ContactFormProps) => {
  const { t } = useTranslation();
  const errors = data.errorMessage;

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

          <span>{loading ? t('sending') : t('sendMessage')}</span>
        </button>
      </form>
    </section>
  );
};

export default ContactForm;
