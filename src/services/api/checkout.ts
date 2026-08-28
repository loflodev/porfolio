import axios, { AxiosError } from 'axios';

import axiosInstance from './axiosInstance';
import type { PlanSlug } from '../../constants';

type CheckoutSessionResponse = {
  success: boolean;
  url?: string;
  error?: string;
};

type CheckoutResult = { success: true; url: string } | { success: false; error: string };

const CHECKOUT_START_ERROR = 'Unable to start checkout';

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<CheckoutSessionResponse>;

    return axiosError.response?.data.error || axiosError.message || CHECKOUT_START_ERROR;
  }

  return CHECKOUT_START_ERROR;
};

export const createCheckoutSession = async (plan: PlanSlug): Promise<CheckoutResult> => {
  try {
    const response = await axiosInstance.post<CheckoutSessionResponse>(
      '/.netlify/functions/create-checkout-session',
      { plan },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.success && response.data.url
      ? { success: true, url: response.data.url }
      : { success: false, error: response.data.error ?? CHECKOUT_START_ERROR };
  } catch (error) {
    return { success: false, error: resolveErrorMessage(error) };
  }
};
