import axios from 'axios';

import axiosInstance from './axiosInstance';

const HTTP_OK = 200;
const HTTP_REDIRECT_LIMIT = 300;

type FormData = {
  fullName: string;
  email: string;
  yourMessage: string;
  website?: string; // Honeypot field
};

type SubmitResult = { success: true } | { success: false; error: string };

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.message || 'Something went wrong. Please try again';
  }

  return 'An unexpected error occured. Please try again';
};

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
      : { success: false, error: 'Failed to submit form' };
  } catch (error) {
    return { success: false, error: resolveErrorMessage(error) };
  }
};
