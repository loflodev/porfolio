/* eslint-disable node/no-process-env */
import type { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import { DEFAULT_STATE_NUMBER } from '../../src/constants/app.constants';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

const ALLOWED_ORIGINS = ['https://loflodev.com', 'https://www.loflodev.com'];
const isDev = process.env.CONTEXT === 'dev' || process.env.NETLIFY_DEV === 'true';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

// Rate limiting constants
const RATE_LIMIT_WINDOW_MINUTES = 5;
const MAX_SUBMISSIONS_PER_WINDOW = 2;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_METHOD_NOT_ALLOWED = 405;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_INTERNAL_SERVER_ERROR = 500;

type ContactPayload = {
  email: string;
  name: string;
  message: string;
  website?: string;
};

type Contact = {
  name: string;
  email: string;
  message: string;
};

type JsonResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const jsonResponse = (
  headers: Record<string, string>,
  statusCode: number,
  body: Record<string, unknown>
): JsonResponse => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

const isWhitelistedOrigin = (origin?: string): boolean =>
  Boolean(origin && ALLOWED_ORIGINS.includes(origin));

const resolveAllowedOrigin = (origin?: string): string => {
  if (isDev) {
    return origin || '*';
  }
  if (isWhitelistedOrigin(origin)) {
    return origin as string;
  }
  return ALLOWED_ORIGINS[DEFAULT_STATE_NUMBER];
};

const getHeaders = (origin?: string) => ({
  'Access-Control-Allow-Origin': resolveAllowedOrigin(origin),
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
});

const hasRequiredFields = (payload: ContactPayload): boolean =>
  Boolean(payload.email?.trim() && payload.name?.trim() && payload.message?.trim());

const isWithinLengthLimits = (payload: ContactPayload): boolean =>
  payload.name.length <= MAX_NAME_LENGTH &&
  payload.email.length <= MAX_EMAIL_LENGTH &&
  payload.message.length <= MAX_MESSAGE_LENGTH;

// Validate required fields, lengths, and format. Returns an error message, or null when valid.
const validateSubmission = (payload: ContactPayload): string | null => {
  if (!hasRequiredFields(payload)) {
    return 'Missing required fields';
  }
  if (!isWithinLengthLimits(payload)) {
    return 'Field values exceed maximum length';
  }
  if (!EMAIL_REGEX.test(payload.email)) {
    return 'Invalid email format';
  }
  return null;
};

const isRateLimited = async (email: string): Promise<boolean> => {
  const rateLimitTime = new Date();
  rateLimitTime.setMinutes(rateLimitTime.getMinutes() - RATE_LIMIT_WINDOW_MINUTES);

  const { count } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', rateLimitTime.toISOString());

  return Boolean(count && count >= MAX_SUBMISSIONS_PER_WINDOW);
};

const saveContact = async (contact: Contact): Promise<void> => {
  const { error } = await supabase.from('contacts').insert([
    {
      ...contact,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    throw new Error('Failed to save contact information');
  }
};

const escapeHtml = (value: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return value.replace(/[&<>"']/g, (char) => map[char]);
};

const buildEmailHtml = (contact: Contact): string => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: hsl(0, 0%, 7%); padding: 40px 25px 10px 25px; border-radius: 16px; border: 1px solid linear-gradient(to bottom right, hsl(240, 1%, 25%) 3%, hsl(0, 0%, 19%) 97%);">
    <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600; margin-bottom: 8px;">New Message</h2>
    <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #d4af37 0%, #f4d03f 100%); border-radius: 2px; margin-bottom: 32px;"></div>


      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Name</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0;">${escapeHtml(contact.name)}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Email</p>
        <p style="margin: 0;"><a href="mailto:${escapeHtml(contact.email)}" style="color: #d4af37; text-decoration: none; font-size: 16px;">${escapeHtml(contact.email)}</a></p>
      </div>

      <div>
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Message</p>
        <p style="color: #cccccc; font-size: 15px; margin: 0 0 30px 0; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(contact.message)}</p>
      </div>

    <p style="color: #666666; font-size: 13px; margin: 0; text-align: center;">
      Submitted on ${new Date().toLocaleString()}
    </p>
  </div>
  <p style="color: #666666; font-size: 9px; margin: 0 padding: 5px; text-align: center;">
      © LofloDev 2025. All rights reserved
    </p>
</div>
      `;

const buildEmailText = (contact: Contact): string => `
      NEW CONTACT FORM SUBMISSION
      Name: ${contact.name}
      Email: ${contact.email}
      Message: ${contact.message}
      Submitted on ${new Date().toLocaleString()}
      `;

// Sends the notification email. Returns whether it sent successfully (a failure here is non-fatal).
const sendNotificationEmail = async (contact: Contact): Promise<boolean> => {
  const { error } = await resend.emails.send({
    from: 'LofloDev <noreply@loflodev.com>', // Update with your verified domain
    to: process.env.ADMIN_EMAIL || 'djljmix@gmail.com',
    subject: ` New Message from ${contact.name}`,
    html: buildEmailHtml(contact),
    text: buildEmailText(contact),
  });

  return !error;
};

const handleContactSubmission = async (
  headers: Record<string, string>,
  payload: ContactPayload
): Promise<JsonResponse> => {
  // Honeypot check - if 'website' field is filled, it's a bot. Return fake success to not alert bots.
  if (payload.website) {
    return jsonResponse(headers, HTTP_OK, { success: true, message: 'Message received' });
  }

  const validationError = validateSubmission(payload);
  if (validationError) {
    return jsonResponse(headers, HTTP_BAD_REQUEST, { success: false, error: validationError });
  }

  const contact: Contact = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    message: payload.message.trim(),
  };

  if (await isRateLimited(contact.email)) {
    return jsonResponse(headers, HTTP_TOO_MANY_REQUESTS, {
      success: false,
      error: 'Too many submissions. Please try again later.',
    });
  }

  await saveContact(contact);
  const emailSent = await sendNotificationEmail(contact);

  return jsonResponse(headers, HTTP_OK, {
    success: true,
    emailSent,
    message: 'Your message has been received successfully!',
  });
};

const resolveEventOrigin = (event: HandlerEvent): string | undefined =>
  event.headers.origin || event.headers.Origin;

const parsePayload = (body: string | null): ContactPayload => JSON.parse(body || '{}');

const buildErrorResponse = (headers: Record<string, string>, error: unknown): JsonResponse => {
  if (error instanceof SyntaxError) {
    return jsonResponse(headers, HTTP_BAD_REQUEST, {
      success: false,
      error: 'Invalid request format',
    });
  }

  return jsonResponse(headers, HTTP_INTERNAL_SERVER_ERROR, {
    success: false,
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
  });
};

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = getHeaders(resolveEventOrigin(event));

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(headers, HTTP_METHOD_NOT_ALLOWED, { error: 'Method Not Allowed' });
  }

  try {
    const payload = parsePayload(event.body);
    return await handleContactSubmission(headers, payload);
  } catch (error) {
    return buildErrorResponse(headers, error);
  }
};
