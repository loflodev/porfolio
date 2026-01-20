import { IonIcon } from '@ionic/react';
import { paperPlane } from 'ionicons/icons';
import type { ChangeEvent, FormEvent } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';

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
        <div className="input-wrapper">
          <div>
            <input
              type="text"
              name="fullName"
              value={data.fullName}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder={t('fullName')}
              data-form-input
            />
            {data.errorMessage.fullName && (
              <p className="pl-4 text-white-2">{data.errorMessage.fullName}</p>
            )}
          </div>

          <div>
            <input
              name="email"
              value={data.email}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder={t('email')}
              data-form-input
            />
            {data.errorMessage.email && <p className="pl-4">{data.errorMessage.email}</p>}
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
          data-form-input
        ></textarea>
        {data.errorMessage.yourMessage && <p className="pl-4">{data.errorMessage.yourMessage}</p>}

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
