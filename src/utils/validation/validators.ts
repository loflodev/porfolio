import { INPUT_MININUM_CHARATER } from '../../constants';
import type { ErrorType, ValidationType } from '../../types';

const EMPTY_VALUE_MESSAGE = 'Cannot be empty';

const buildValidationResult = (
  isValid: boolean,
  value: string,
  invalidMessage: ErrorType
): ValidationType => ({
  isValid,
  input: isValid ? value : '',
  message: isValid ? '' : invalidMessage,
});

export const validateEmail = (value: string): ValidationType => {
  if (!value) {
    return buildValidationResult(false, '', EMPTY_VALUE_MESSAGE);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

  return buildValidationResult(emailRegex.test(value.trim()), value, 'Invalid email');
};

export const validateInput = (value: string): ValidationType => {
  if (!value) {
    return buildValidationResult(false, '', EMPTY_VALUE_MESSAGE);
  }

  return buildValidationResult(
    value.trim().length >= INPUT_MININUM_CHARATER,
    value,
    'Input require at least 3 character'
  );
};
