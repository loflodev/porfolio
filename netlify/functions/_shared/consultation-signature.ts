/* eslint-disable node/no-process-env */
import { createHmac, timingSafeEqual } from 'node:crypto';

// Same idea as purchase-signature.ts: consultation bookings reach Netlify Forms' public "contact"
// endpoint server-to-server from book-consultation.ts, signed with the webhook secret (known only
// server-side), so submission-created.ts can reject a forged booking posted straight to the form.
// The "consultation:" prefix keeps a purchase token from ever validating a booking.
const signedValue = (date: string, time: string, email: string) =>
  `consultation:${date}T${time}|${email}`;

export const signConsultation = (date: string, time: string, email: string): string =>
  createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET || '')
    .update(signedValue(date, time, email))
    .digest('hex');

export const verifyConsultationSignature = (
  date: string,
  time: string,
  email: string,
  token: string
): boolean => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !token) {
    return false;
  }

  const expected = Buffer.from(signConsultation(date, time, email), 'hex');
  const actual = Buffer.from(token, 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
