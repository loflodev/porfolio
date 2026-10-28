import { useState, type ChangeEvent, type FormEvent } from 'react';

import useConsultationSlots from './useConsultationSlots';
import { CONSULTATION_SUBJECT, CONTACT_FORM_DEFAULT } from '../../constants';
import useMainContext from '../../hooks/useMainContext';
import useTranslation from '../../hooks/useTransalation';
import { bookConsultation } from '../../services/api/consultation';
import { saveContactForm } from '../../services/api/contactForm';
import type { ContactFormInputType, ErrorType } from '../../types';
import { validateEmail, validateInput } from '../../utils/validation';

const REQUIRED: ErrorType = 'errors.required';

const valueOrEmpty = (condition: boolean, value: string): string => (condition ? value : '');

type ErrorMessages = ContactFormInputType['errorMessage'];

type ValidatedFields = {
  fullName: string;
  email: string;
  yourMessage: string;
  errorMessage: ErrorMessages;
  isValid: boolean;
};

const isConsultation = (input: ContactFormInputType) => input.subject === CONSULTATION_SUBJECT;

// A consultation asks for a date and time instead of a message, so only the fields on screen
// are validated.
const validateDetails = (current: ContactFormInputType) => {
  if (isConsultation(current)) {
    const errors = {
      yourMessage: '',
      consultationDate: valueOrEmpty(!current.consultationDate, REQUIRED),
      consultationTime: valueOrEmpty(!current.consultationTime, REQUIRED),
    };
    return {
      yourMessage: current.yourMessage,
      errors,
      isValid: !errors.consultationDate && !errors.consultationTime,
    };
  }

  const { isValid, input, message } = validateInput(current.yourMessage);
  return {
    yourMessage: valueOrEmpty(Boolean(input), input),
    errors: {
      yourMessage: valueOrEmpty(!isValid, message),
      consultationDate: '',
      consultationTime: '',
    },
    isValid,
  };
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

  const details = validateDetails(current);

  return {
    fullName: valueOrEmpty(fullNameIsValid, fullNameInput),
    email: valueOrEmpty(emailIsValid, emailInput),
    yourMessage: details.yourMessage,
    errorMessage: {
      fullName: valueOrEmpty(!fullNameIsValid, fullNameMessage),
      email: valueOrEmpty(!emailIsValid, emailMessage),
      ...details.errors,
    },
    isValid: fullNameIsValid && emailIsValid && details.isValid,
  };
};

const buildContactPayload = (input: ContactFormInputType) => ({
  fullName: input.fullName,
  email: input.email,
  subject: input.subject,
  yourMessage: input.yourMessage,
  website: input.website, // Honeypot field
});

const buildConsultationPayload = (input: ContactFormInputType) => ({
  fullName: input.fullName,
  email: input.email,
  consultationDate: input.consultationDate,
  consultationTime: input.consultationTime,
  website: input.website, // Honeypot field
});

// Picking another date invalidates the chosen time, which belonged to the previous day.
const applyFieldChange = (
  prev: ContactFormInputType,
  name: string,
  value: string
): ContactFormInputType =>
  name === 'consultationDate'
    ? { ...prev, consultationDate: value, consultationTime: '' }
    : { ...prev, [name]: value };

const useContact = () => {
  const { t } = useTranslation();
  const { showModal, toggleModal, modalData, handleModalData } = useMainContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contactFormInput, setContactFormInput] =
    useState<ContactFormInputType>(CONTACT_FORM_DEFAULT);
  const consultationSlots = useConsultationSlots(
    isConsultation(contactFormInput) ? contactFormInput.consultationDate : ''
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setContactFormInput((prev) => applyFieldChange(prev, name, value));
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

  const showSuccess = (submitted: ContactFormInputType) => {
    handleModalData(
      isConsultation(submitted)
        ? {
            title: t('consultation.successTitle'),
            description: t('consultation.successDescription', {
              date: submitted.consultationDate,
              time: submitted.consultationTime,
            }),
            icon: '',
          }
        : {
            title: t('contactSuccessTitle'),
            description: t('contactSuccessDescription'),
            icon: '',
          }
    );
  };

  const handleSubmitSuccess = (submitted: ContactFormInputType) => {
    setIsLoading(false);
    showSuccess(submitted);
    setContactFormInput(CONTACT_FORM_DEFAULT);
  };

  // Errors show under the last field on screen: the time for a consultation, else the message.
  const handleSubmitFailure = (submitted: ContactFormInputType, error: ErrorType) => {
    setIsLoading(false);

    if (error === 'errors.slotTaken') {
      consultationSlots.reload();
    }

    const field = isConsultation(submitted) ? 'consultationTime' : 'yourMessage';
    setContactFormInput((prev) => ({
      ...prev,
      consultationTime: error === 'errors.slotTaken' ? '' : prev.consultationTime,
      errorMessage: {
        ...prev.errorMessage,
        [field]: error,
      },
    }));
  };

  const submit = (input: ContactFormInputType) =>
    isConsultation(input)
      ? bookConsultation(buildConsultationPayload(input))
      : saveContactForm(buildContactPayload(input));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allInputValid = inputValidation();

    if (allInputValid && !isLoading) {
      setIsLoading(true);
      const submitted = contactFormInput;
      const response = await submit(submitted);

      if (response.success) {
        handleSubmitSuccess(submitted);
      } else {
        handleSubmitFailure(submitted, response.error);
      }
    }
  };
  return {
    contactFormInput,
    consultationSlots,
    showModal,
    toggleModal,
    modalData,
    handleModalData,
    handleChange,
    handleSubmit,
    isLoading,
    setIsLoading,
  };
};

export default useContact;
