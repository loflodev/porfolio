/* eslint-disable node/no-process-env */
import type { Handler, HandlerEvent } from '@netlify/functions';
import { Resend } from 'resend';

import { captureAndFlush, initSentry } from './_shared/sentry';

initSentry();

const resend = new Resend(process.env.RESEND_API_KEY);

const HTTP_OK = 200;

type SubmissionData = {
  fullName?: string;
  email?: string;
  yourMessage?: string;
};

type SubmissionCreatedPayload = {
  payload: {
    data: SubmissionData;
  };
};

type Contact = {
  name: string;
  email: string;
  message: string;
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

const sendNotificationEmail = async (contact: Contact): Promise<void> => {
  await resend.emails.send({
    from: 'LofloDev <noreply@loflodev.com>', // Update with your verified domain
    to: process.env.ADMIN_EMAIL || 'djljmix@gmail.com',
    subject: ` New Message from ${contact.name}`,
    html: buildEmailHtml(contact),
    text: buildEmailText(contact),
  });
};

const parsePayload = (body: string | null): SubmissionCreatedPayload => JSON.parse(body || '{}');

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    const { data } = parsePayload(event.body).payload;

    const contact: Contact = {
      name: data.fullName?.trim() || '',
      email: data.email?.trim().toLowerCase() || '',
      message: data.yourMessage?.trim() || '',
    };

    await sendNotificationEmail(contact);

    return { statusCode: HTTP_OK, body: '' };
  } catch (error) {
    await captureAndFlush(error);
    return { statusCode: HTTP_OK, body: '' };
  }
};
