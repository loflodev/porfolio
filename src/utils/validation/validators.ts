import { INPUT_MININUM_CHARATER } from '../../constants';
import type { ValidationType } from '../../types';

export const validateEmail = (value: string): ValidationType => {
  if (value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
    const validEmail = emailRegex.test(value.trim());

    return {
      isValid: validEmail ? true : false,
      input: validEmail ? value : '',
      message: !validEmail ? 'Invalid email' : '',
    };
  }

  return {
    isValid: false,
    input: '',
    message: 'Cannot be empty',
  };
};

export const validateInput = (value: string): ValidationType => {
  if (value) {
    const validInput = value.trim().length >= INPUT_MININUM_CHARATER;

    return {
      isValid: validInput ? true : false,
      input: validInput ? value : '',
      message: !validInput ? 'Input require at least 3 character' : '',
    };
  }

  return {
    isValid: false,
    input: '',
    message: 'Cannot be empty',
  };
};
