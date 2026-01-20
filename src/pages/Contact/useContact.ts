import { useState, type ChangeEvent, type FormEvent } from 'react';

import { CONTACT_FORM_DEFAULT } from '../../constants';
import useMainContext from '../../hooks/useMainContext';
import { saveContactForm } from '../../services/api/contactForm';
import type { ContactFormInputType } from '../../types';
import { validateEmail, validateInput } from '../../utils/validation';

const useContact = () => {
  const { showModal, toggleModal, modalData, handleModalData } = useMainContext();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const handleIsDisabled = () => {
    setIsDisabled(
      Boolean(contactFormInput.email && contactFormInput.fullName && contactFormInput.yourMessage)
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allInputValid = inputValidation();

    if (isDisabled && allInputValid) {
      setIsLoading(true);
      const response = await saveContactForm({
        name: contactFormInput.fullName,
        email: contactFormInput.email,
        message: contactFormInput.yourMessage,
      });

      if (response?.success) {
        setIsLoading(false);
        handleModalData({
          title: 'Message Sent Successfully!',
          description:
            "Thank you for reaching out. We've received your message and will get back to you as soon as possible.",
          icon: 'h',
        });

        setContactFormInput(CONTACT_FORM_DEFAULT);
      } else {
        setIsLoading(false);
        setContactFormInput((prev) => ({
          ...prev,
          errorMessage: {
            ...prev.errorMessage,
            yourMessage: response.error,
          },
        }));
      }
    }

    setIsDisabled(false);
  };
  return {
    contactFormInput,
    showModal,
    toggleModal,
    modalData,
    handleModalData,
    handleChange,
    handleIsDisabled,
    isDisabled,
    handleSubmit,
    isLoading,
    setIsLoading,
  };
};

export default useContact;
