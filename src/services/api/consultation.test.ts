import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import axiosInstance from './axiosInstance';
import { bookConsultation, fetchBookableDates, fetchConsultationSlots } from './consultation';

vi.mock('./axiosInstance', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const get = vi.mocked(axiosInstance.get);
const post = vi.mocked(axiosInstance.post);

const BOOKING = {
  fullName: 'Ada',
  email: 'ada@example.com',
  consultationDate: '2030-01-07',
  consultationTime: '09:30',
  website: '',
};

const httpError = (status: number) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

afterEach(() => {
  vi.resetAllMocks();
});

describe('consultation API', () => {
  it('fetches the times of a date', async () => {
    const slots = [{ time: '09:00', available: false }];
    get.mockResolvedValue({ data: { date: '2030-01-07', slots } });

    expect(await fetchConsultationSlots('2030-01-07')).toEqual(slots);
    expect(get).toHaveBeenCalledWith('/.netlify/functions/consultation-slots', {
      params: { date: '2030-01-07' },
    });
  });

  it('rejects a body without a slots array', async () => {
    get.mockResolvedValue({ data: '<!doctype html><html></html>' });

    await expect(fetchConsultationSlots('2030-01-07')).rejects.toThrow();
  });

  it('fetches the bookable dates and rejects a malformed body', async () => {
    get.mockResolvedValue({ data: { dates: ['2030-01-07'] } });

    expect(await fetchBookableDates()).toEqual(['2030-01-07']);
    expect(get).toHaveBeenCalledWith('/.netlify/functions/consultation-slots');

    get.mockResolvedValue({ data: '<!doctype html>' });
    await expect(fetchBookableDates()).rejects.toThrow();
  });

  it('books a consultation', async () => {
    post.mockResolvedValue({ data: { success: true } });

    expect(await bookConsultation(BOOKING)).toEqual({ success: true });
    expect(post).toHaveBeenCalledWith('/.netlify/functions/book-consultation', BOOKING);
  });

  it('maps a 409 to slotTaken and other failures to translated keys', async () => {
    post.mockRejectedValueOnce(httpError(409));
    expect(await bookConsultation(BOOKING)).toEqual({ success: false, error: 'errors.slotTaken' });

    post.mockRejectedValueOnce(httpError(502));
    expect(await bookConsultation(BOOKING)).toEqual({ success: false, error: 'errors.network' });

    post.mockRejectedValueOnce(new Error('boom'));
    expect(await bookConsultation(BOOKING)).toEqual({ success: false, error: 'errors.unexpected' });
  });
});
