import axios from 'axios';

import axiosInstance from './axiosInstance';
import type { ErrorType } from '../../types';

const HTTP_OK = 200;
const HTTP_REDIRECT_LIMIT = 300;

type FormData = {
  fullName: string;
  email: string;
  yourMessage: string;
  website?: string; // Honeypot field
};

type SubmitResult = { success: true } | { success: false; error: ErrorType };

// Axios messages are technical English ("timeout of 10000ms exceeded"), so map to a translated key.
const resolveErrorMessage = (error: unknown): ErrorType =>
  axios.isAxiosError(error) ? 'errors.network' : 'errors.unexpected';

const encodeFormData = (data: FormData): string =>
  new URLSearchParams({ 'form-name': 'contact', ...data }).toString();

export const saveContactForm = async (data: FormData): Promise<SubmitResult> => {
  try {
    const response = await axiosInstance.post('/', encodeFormData(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000, // 10 second timeout
    });

    return response.status >= HTTP_OK && response.status < HTTP_REDIRECT_LIMIT
      ? { success: true }
      : { success: false, error: 'errors.submitFailed' };
  } catch (error) {
    return { success: false, error: resolveErrorMessage(error) };
  }
};
