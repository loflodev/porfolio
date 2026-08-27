import { IonIcon } from '@ionic/react';
import { paperPlane } from 'ionicons/icons';
import type { ChangeEvent, FormEvent } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';

import { MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '../../../constants';
import useTranslation from '../../../hooks/useTransalation';
import type { ContactFormInputType } from '../../../types';

type ContactFormProps = {
  data: ContactFormInputType;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleIsDisabled: () => void;
  isDisabled: boolean;
  loading: boolean;
};

const FieldError = ({ message, className }: { message?: string; className?: string }) =>
  message ? <p className={className}>{message}</p> : null;

const ContactForm = ({
  data,
  handleSubmit,
  handleChange,
  handleIsDisabled,
  isDisabled,
  loading,
}: ContactFormProps) => {
  const { t } = useTranslation();
  return (
    <section className="contact-form">
      <h3 className="h3 form-title">{t('contactForm')}</h3>

      <form action="#" className="form" data-form onSubmit={handleSubmit}>
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
            <input
              type="text"
              name="fullName"
              value={data.fullName}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder={t('fullName')}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="name"
              data-form-input
            />
            <FieldError message={data.errorMessage.fullName} className="pl-4 text-white-2" />
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder={t('email')}
              maxLength={MAX_EMAIL_LENGTH}
              autoComplete="email"
              data-form-input
            />
            <FieldError message={data.errorMessage.email} className="pl-4" />
          </div>
        </div>

        <textarea
          name="yourMessage"
          value={data.yourMessage}
          className="form-input"
          onChange={(e) => {
            handleChange(e);
            handleIsDisabled();
          }}
          placeholder={t('yourMessage')}
          maxLength={MAX_MESSAGE_LENGTH}
          data-form-input
        ></textarea>
        <FieldError
          message={data.errorMessage.yourMessage}
          className="pl-4 text-orange-yellow-crayola"
        />

        <button className="form-btn" type="submit" disabled={!isDisabled} data-form-btn>
          {loading ? (
            <PulseLoader color={'var(--color-orange-yellow-crayola)'} size={8} margin={4} />
          ) : (
            <IonIcon icon={paperPlane} />
          )}

          <span>{t('sendMessage')}</span>
        </button>
      </form>
    </section>
  );
};

export default ContactForm;
