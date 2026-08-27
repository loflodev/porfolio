import { useState, type ChangeEvent, type FormEvent } from 'react';

import { CONTACT_FORM_DEFAULT } from '../../constants';
import useMainContext from '../../hooks/useMainContext';
import { saveContactForm } from '../../services/api/contactForm';
import type { ContactFormInputType } from '../../types';
import { validateEmail, validateInput } from '../../utils/validation';

const SUCCESS_MODAL_DATA = {
  title: 'Message Sent Successfully!',
  description:
    "Thank you for reaching out. We've received your message and will get back to you as soon as possible.",
  icon: 'h',
};

const valueOrEmpty = (condition: boolean, value: string): string => (condition ? value : '');

type ValidatedFields = {
  fullName: string;
  email: string;
  yourMessage: string;
  errorMessage: { fullName: string; email: string; yourMessage: string };
  isValid: boolean;
};

const computeValidatedFields = (current: ContactFormInputType): ValidatedFields => {
  const {
    isValid: emailIsValid,
    input: emailInput,
    message: emailMessage,
  } = validateEmail(current.email);

  const {
    isValid: fullNameIsValid,
    input: fullNameInput,
    message: fullNameMessage,
  } = validateInput(current.fullName);

  const {
    isValid: yourMessageIsValid,
    input: yourMessageInput,
    message: yourMessageMessage,
  } = validateInput(current.yourMessage);

  return {
    fullName: valueOrEmpty(fullNameIsValid, fullNameInput),
    email: valueOrEmpty(emailIsValid, emailInput),
    yourMessage: valueOrEmpty(Boolean(yourMessageInput), yourMessageInput),
    errorMessage: {
      fullName: valueOrEmpty(!fullNameIsValid, fullNameMessage),
      email: valueOrEmpty(!emailIsValid, emailMessage),
      yourMessage: valueOrEmpty(!yourMessageIsValid, yourMessageMessage),
    },
    isValid: fullNameIsValid && emailIsValid && yourMessageIsValid,
  };
};

const buildContactPayload = (input: ContactFormInputType) => ({
  name: input.fullName,
  email: input.email,
  message: input.yourMessage,
  website: input.website, // Honeypot field
});

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
    const validated = computeValidatedFields(contactFormInput);

    setContactFormInput((prev) => ({
      ...prev,
      fullName: validated.fullName,
      email: validated.email,
      yourMessage: validated.yourMessage,
      errorMessage: {
        ...prev.errorMessage,
        ...validated.errorMessage,
      },
    }));

    return validated.isValid;
  };

  const handleIsDisabled = () => {
    setIsDisabled(
      Boolean(contactFormInput.email && contactFormInput.fullName && contactFormInput.yourMessage)
    );
  };

  const handleSubmitSuccess = () => {
    setIsLoading(false);
    handleModalData(SUCCESS_MODAL_DATA);
    setContactFormInput(CONTACT_FORM_DEFAULT);
  };

  const handleSubmitFailure = (error: string) => {
    setIsLoading(false);
    setContactFormInput((prev) => ({
      ...prev,
      errorMessage: {
        ...prev.errorMessage,
        yourMessage: error,
      },
    }));
  };

  const applySubmitResponse = (response: Awaited<ReturnType<typeof saveContactForm>>) => {
    if (response?.success) {
      handleSubmitSuccess();
    } else {
      handleSubmitFailure(response.error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allInputValid = inputValidation();

    if (isDisabled && allInputValid) {
      setIsLoading(true);
      const response = await saveContactForm(buildContactPayload(contactFormInput));
      applySubmitResponse(response);
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
