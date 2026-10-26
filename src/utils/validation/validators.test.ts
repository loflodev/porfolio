import { describe, expect, it } from 'vitest';

import { validateEmail, validateInput } from './validators';

describe('validateEmail', () => {
  it('rejects an empty value', () => {
    expect(validateEmail('')).toEqual({ isValid: false, input: '', message: 'Cannot be empty' });
  });

  it.each(['plain', 'a@b', 'a@b.c', 'a b@c.com', '@c.com'])('rejects %s', (value) => {
    expect(validateEmail(value)).toEqual({ isValid: false, input: '', message: 'Invalid email' });
  });

  it.each(['louis@loflodev.com', 'a.b+c@sub.domain.ca', '  padded@mail.com  '])(
    'accepts %s',
    (value) => {
      expect(validateEmail(value)).toEqual({ isValid: true, input: value, message: '' });
    }
  );
});

describe('validateInput', () => {
  it('rejects an empty value', () => {
    expect(validateInput('').isValid).toBe(false);
    expect(validateInput('').message).toBe('Cannot be empty');
  });

  it('rejects values shorter than 3 characters after trimming', () => {
    expect(validateInput('  ab  ')).toEqual({
      isValid: false,
      input: '',
      message: 'Input require at least 3 character',
    });
  });

  it('accepts values of 3 or more characters', () => {
    expect(validateInput('Bob')).toEqual({ isValid: true, input: 'Bob', message: '' });
  });
});
