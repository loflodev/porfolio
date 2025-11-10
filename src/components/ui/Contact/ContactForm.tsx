import { IonIcon } from '@ionic/react';
import { paperPlane } from 'ionicons/icons';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { CONTACT_FORM_DEFAULT } from '../../../constants';
import useMainContext from '../../../hooks/useMainContext';
import type { ContactFormInputType } from '../../../types';
import { validateEmail, validateInput } from '../../../utils/validation/validators';
import Modal from '../Modal';

const ContactForm = () => {
  const { showModal, toggleModal, modalData, handleModalData } = useMainContext();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [contactFormInput, setContactFormInput] =
    useState<ContactFormInputType>(CONTACT_FORM_DEFAULT);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setContactFormInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const inputValidation = () => {
    const {
      isValid: emailIsValid,
      input: emailInput,
      message: emailMessage,
    } = validateEmail(contactFormInput.email);

    const {
      isValid: fullNameIsValid,
      input: fullNameInput,
      message: fullNameMessage,
    } = validateInput(contactFormInput.fullName);

    const {
      isValid: yourMessageIsValid,
      input: yourMessageInput,
      message: yourMessageMessage,
    } = validateInput(contactFormInput.yourMessage);

    setContactFormInput((prev) => ({
      ...prev,
      fullName: fullNameIsValid ? fullNameInput : '',
      email: emailIsValid ? emailInput : '',
      yourMessage: yourMessageInput ? yourMessageInput : '',
      errorMessage: {
        ...prev.errorMessage,
        fullName: !fullNameIsValid ? fullNameMessage : '',
        email: !emailIsValid ? emailMessage : '',
        yourMessage: !yourMessageIsValid ? yourMessageMessage : '',
      },
    }));

    return fullNameIsValid && emailIsValid && yourMessageIsValid;
  };

  const handleCanSubmit = () => {
    setCanSubmit(
      Boolean(contactFormInput.email && contactFormInput.fullName && contactFormInput.yourMessage)
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allInputValid = inputValidation();

    if (canSubmit && allInputValid) {
      handleModalData({
        title: 'Message Sent Successfully!',
        description:
          "Thank you for reaching out. We've received your message and will get back to you as soon as possible.",
        icon: 'h',
      });
    }

    setContactFormInput(CONTACT_FORM_DEFAULT);
  };
  return (
    <section className="contact-form">
      <h3 className="h3 form-title">Contact Form</h3>

      <form action="#" className="form" data-form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <div>
            <input
              type="text"
              name="fullName"
              value={contactFormInput.fullName}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder="Full name"
              data-form-input
            />
            {contactFormInput.errorMessage.fullName && (
              <p className="pl-4">{contactFormInput.errorMessage.fullName}</p>
            )}
          </div>

          <div>
            <input
              name="email"
              value={contactFormInput.email}
              onChange={handleChange}
              className="form-input max-input-heigth"
              placeholder="Email address"
              data-form-input
            />
            {contactFormInput.errorMessage.email && (
              <p className="pl-4">{contactFormInput.errorMessage.email}</p>
            )}
          </div>
        </div>

        <textarea
          name="yourMessage"
          value={contactFormInput.yourMessage}
          className="form-input"
          onChange={(e) => {
            handleChange(e);
            handleCanSubmit();
          }}
          placeholder="Your Message"
          data-form-input
        ></textarea>
        {contactFormInput.errorMessage.yourMessage && (
          <p className="pl-4">{contactFormInput.errorMessage.yourMessage}</p>
        )}

        <button className="form-btn" type="submit" disabled={!canSubmit} data-form-btn>
          <IonIcon icon={paperPlane} />
          <span>Send Message</span>
        </button>
      </form>

      <Modal showModal={showModal} handleModal={toggleModal} data={modalData} />
    </section>
  );
};

export default ContactForm;
