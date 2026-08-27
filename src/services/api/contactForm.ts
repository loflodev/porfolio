import axios, { AxiosError } from 'axios';

import axiosInstance from './axiosInstance';

type FormData = {
  name: string;
  email: string;
  message: string;
  website?: string; // Honeypot field
};

type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

type SubmitResult = { success: true; data?: unknown } | { success: false; error: string };

const toSubmitResult = (data: ApiResponse): SubmitResult =>
  data.success
    ? { success: true, data: data.data }
    : { success: false, error: data.error || 'Failed to submit form' };

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;

    return (
      axiosError.response?.data.error ||
      axiosError.message ||
      'Something went wrong. Please try again'
    );
  }

  return 'An unexpected error occured. Please try again';
};

export const saveContactForm = async (data: FormData): Promise<SubmitResult> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(
      '/.netlify/functions/submit-form',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return toSubmitResult(response.data);
  } catch (error) {
    return { success: false, error: resolveErrorMessage(error) };
  }
};
