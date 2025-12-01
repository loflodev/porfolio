import axios, { AxiosError } from 'axios';

import axiosInstance from './axiosInstance';

type FormData = {
  name: string;
  email: string;
  message: string;
};

type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

type SubmitResult = { success: true; data?: unknown } | { success: false; error: string };

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
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to submit form',
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;

      return {
        success: false,
        error:
          axiosError.response?.data.error ||
          axiosError.message ||
          'Something went wrong. Please try again',
      };
    }

    return {
      success: false,
      error: 'An unexpected error occured. Please try again',
    };
  }
};
