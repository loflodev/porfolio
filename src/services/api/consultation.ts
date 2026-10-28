import axios from 'axios';

import axiosInstance from './axiosInstance';
import type { ErrorType } from '../../types';

const HTTP_CONFLICT = 409;

type SlotsResponse = { date: string; slots: string[] };

export type ConsultationBooking = {
  fullName: string;
  email: string;
  consultationDate: string;
  consultationTime: string;
  website?: string; // Honeypot field
};

type BookingResult = { success: true } | { success: false; error: ErrorType };

/** Open consultation times (Montreal-local HH:MM) for a YYYY-MM-DD date. */
export const fetchConsultationSlots = async (date: string): Promise<string[]> => {
  const response = await axiosInstance.get<SlotsResponse>(
    '/.netlify/functions/consultation-slots',
    { params: { date } }
  );

  return response.data.slots;
};

// 409 means someone booked the slot between loading the times and submitting.
const resolveErrorMessage = (error: unknown): ErrorType => {
  if (!axios.isAxiosError(error)) {
    return 'errors.unexpected';
  }

  return error.response?.status === HTTP_CONFLICT ? 'errors.slotTaken' : 'errors.network';
};

export const bookConsultation = async (data: ConsultationBooking): Promise<BookingResult> => {
  try {
    await axiosInstance.post('/.netlify/functions/book-consultation', data);
    return { success: true };
  } catch (error) {
    return { success: false, error: resolveErrorMessage(error) };
  }
};
