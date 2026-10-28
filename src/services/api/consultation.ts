import axios from 'axios';

import axiosInstance from './axiosInstance';
import type { ErrorType } from '../../types';

const HTTP_CONFLICT = 409;

export type ConsultationSlot = { time: string; available: boolean };

type SlotsResponse = { date: string; slots: ConsultationSlot[] };
type DatesResponse = { dates: string[] };

const SLOTS_ENDPOINT = '/.netlify/functions/consultation-slots';

export type ConsultationBooking = {
  fullName: string;
  email: string;
  consultationDate: string;
  consultationTime: string;
  website?: string; // Honeypot field
};

type BookingResult = { success: true } | { success: false; error: ErrorType };

// A static server without functions answers with the HTML page, so the body is checked.
const requireArray = <T>(value: T[] | undefined, what: string): T[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Malformed consultation ${what} response`);
  }
  return value;
};

/**
 * Every consultation time (Montreal-local HH:MM) of a YYYY-MM-DD date, each marked available
 * unless it's booked or too soon.
 */
export const fetchConsultationSlots = async (date: string): Promise<ConsultationSlot[]> => {
  const response = await axiosInstance.get<SlotsResponse>(SLOTS_ENDPOINT, { params: { date } });

  return requireArray(response.data?.slots, 'slots');
};

/** The YYYY-MM-DD dates (Montreal time) that still have an open consultation time. */
export const fetchBookableDates = async (): Promise<string[]> => {
  const response = await axiosInstance.get<DatesResponse>(SLOTS_ENDPOINT);

  return requireArray(response.data?.dates, 'dates');
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
