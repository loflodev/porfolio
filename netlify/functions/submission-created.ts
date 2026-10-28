/* eslint-disable node/no-process-env */
import type { Handler, HandlerEvent } from '@netlify/functions';
import { Resend } from 'resend';

import { verifyConsultationSignature } from './_shared/consultation-signature';
import { verifyPurchaseSignature } from './_shared/purchase-signature';
import { captureAndFlush, initSentry } from './_shared/sentry';
import {
  CONSULTATION_SUBJECT,
  CONSULTATION_TIME_ZONE,
  CONTACT_SUBJECTS,
  DEFAULT_CONTACT_SUBJECT,
  type ContactSubject,
} from '../../src/constants/app.constants';

initSentry();

const resend = new Resend(process.env.RESEND_API_KEY);

const HTTP_OK = 200;

type SubmissionData = {
  fullName?: string;
  email?: string;
  yourMessage?: string;
  subject?: string;
  consultationDate?: string;
  consultationTime?: string;
  planSlug?: string;
  stripeSessionId?: string;
  amountTotal?: string;
  currency?: string;
  customerEmail?: string;
  timestamp?: string;
  verificationToken?: string;
};

type SubmissionCreatedPayload = {
  payload: {
    form_name?: string;
    data: SubmissionData;
  };
};

type Contact = {
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
};

type Consultation = {
  name: string;
  email: string;
  date: string;
  time: string;
};

const SUBJECT_LABELS: Record<ContactSubject, string> = {
  general: 'General Inquiry',
  consultation: 'Consultation',
  joinTeam: 'Join the Team',
  reportIssue: 'Report an Issue',
};

// Anything that isn't a known subject (e.g. an old or hand-crafted submission) is a general inquiry.
const resolveSubject = (value?: string): ContactSubject =>
  CONTACT_SUBJECTS.find((subject) => subject === value?.trim()) ?? DEFAULT_CONTACT_SUBJECT;

type Purchase = {
  planSlug: string;
  stripeSessionId: string;
  amountTotal: string;
  currency: string;
  customerEmail: string;
  timestamp: string;
};

const PURCHASE_FORM_NAME = 'purchase';
const FROM_ADDRESS = 'LofloDev <noreply@loflodev.com>'; // Update with your verified domain
const adminRecipient = (): string => process.env.ADMIN_EMAIL || 'djljmix@gmail.com';

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

      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Subject</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0;">${SUBJECT_LABELS[contact.subject]}</p>
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
      Subject: ${SUBJECT_LABELS[contact.subject]}
      Message: ${contact.message}
      Submitted on ${new Date().toLocaleString()}
      `;

const sendNotificationEmail = async (contact: Contact): Promise<void> => {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminRecipient(),
    subject: `[${SUBJECT_LABELS[contact.subject]}] New Message from ${contact.name}`,
    html: buildEmailHtml(contact),
    text: buildEmailText(contact),
  });
};

const buildConsultationEmailHtml = (consultation: Consultation): string => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: hsl(0, 0%, 7%); padding: 40px 25px 10px 25px; border-radius: 16px; border: 1px solid linear-gradient(to bottom right, hsl(240, 1%, 25%) 3%, hsl(0, 0%, 19%) 97%);">
    <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600; margin-bottom: 8px;">New Consultation Booking</h2>
    <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #d4af37 0%, #f4d03f 100%); border-radius: 2px; margin-bottom: 32px;"></div>

      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Name</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0;">${escapeHtml(consultation.name)}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Email</p>
        <p style="margin: 0;"><a href="mailto:${escapeHtml(consultation.email)}" style="color: #d4af37; text-decoration: none; font-size: 16px;">${escapeHtml(consultation.email)}</a></p>
      </div>

      <div>
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">When (${CONSULTATION_TIME_ZONE})</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0 0 30px 0;">${escapeHtml(consultation.date)} at ${escapeHtml(consultation.time)}</p>
      </div>

    <p style="color: #666666; font-size: 13px; margin: 0; text-align: center;">
      Booked on ${new Date().toLocaleString()}
    </p>
  </div>
  <p style="color: #666666; font-size: 9px; margin: 0 padding: 5px; text-align: center;">
      © LofloDev 2025. All rights reserved
    </p>
</div>
      `;

const buildConsultationEmailText = (consultation: Consultation): string => `
      NEW CONSULTATION BOOKING
      Name: ${consultation.name}
      Email: ${consultation.email}
      When: ${consultation.date} at ${consultation.time} (${CONSULTATION_TIME_ZONE})
      Booked on ${new Date().toLocaleString()}
      `;

const sendConsultationEmail = async (consultation: Consultation): Promise<void> => {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminRecipient(),
    replyTo: consultation.email,
    subject: `Consultation booked - ${consultation.date} ${consultation.time} - ${consultation.name}`,
    html: buildConsultationEmailHtml(consultation),
    text: buildConsultationEmailText(consultation),
  });
};

// Bookings are only real when book-consultation.ts reserved the slot and signed the submission;
// anything posted straight to the public form with the consultation subject is dropped.
const handleConsultation = async (data: SubmissionData): Promise<void> => {
  const consultation: Consultation = {
    name: data.fullName?.trim() || '',
    email: data.email?.trim().toLowerCase() || '',
    date: data.consultationDate?.trim() || '',
    time: data.consultationTime?.trim() || '',
  };
  const token = data.verificationToken?.trim() || '';

  if (
    !verifyConsultationSignature(consultation.date, consultation.time, consultation.email, token)
  ) {
    await captureAndFlush(
      new Error(
        `Rejected unverified consultation submission for ${consultation.date} ${consultation.time}`
      )
    );
    return;
  }

  await sendConsultationEmail(consultation);
};

const buildPurchaseEmailHtml = (purchase: Purchase): string => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: hsl(0, 0%, 7%); padding: 40px 25px 10px 25px; border-radius: 16px; border: 1px solid linear-gradient(to bottom right, hsl(240, 1%, 25%) 3%, hsl(0, 0%, 19%) 97%);">
    <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600; margin-bottom: 8px;">New Purchase</h2>
    <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #d4af37 0%, #f4d03f 100%); border-radius: 2px; margin-bottom: 32px;"></div>

      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Plan</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0;">${escapeHtml(purchase.planSlug)}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Customer</p>
        <p style="margin: 0;"><a href="mailto:${escapeHtml(purchase.customerEmail)}" style="color: #d4af37; text-decoration: none; font-size: 16px;">${escapeHtml(purchase.customerEmail)}</a></p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Amount</p>
        <p style="color: #cccccc; font-size: 15px; margin: 0;">${escapeHtml(purchase.amountTotal)} ${escapeHtml(purchase.currency.toUpperCase())}</p>
      </div>

      <div>
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Stripe Session</p>
        <p style="color: #cccccc; font-size: 13px; margin: 0 0 30px 0; word-break: break-all;">${escapeHtml(purchase.stripeSessionId)}</p>
      </div>

    <p style="color: #666666; font-size: 13px; margin: 0; text-align: center;">
      Submitted on ${escapeHtml(purchase.timestamp)}
    </p>
  </div>
  <p style="color: #666666; font-size: 9px; margin: 0 padding: 5px; text-align: center;">
      © LofloDev 2025. All rights reserved
    </p>
</div>
      `;

const buildPurchaseEmailText = (purchase: Purchase): string => `
      NEW PURCHASE
      Plan: ${purchase.planSlug}
      Customer: ${purchase.customerEmail}
      Amount: ${purchase.amountTotal} ${purchase.currency.toUpperCase()}
      Stripe Session: ${purchase.stripeSessionId}
      Submitted on ${purchase.timestamp}
      `;

const sendPurchaseNotificationEmail = async (purchase: Purchase): Promise<void> => {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminRecipient(),
    subject: `New Purchase - ${purchase.planSlug}`,
    html: buildPurchaseEmailHtml(purchase),
    text: buildPurchaseEmailText(purchase),
  });
};

const parsePayload = (body: string | null): SubmissionCreatedPayload => JSON.parse(body || '{}');

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    const { form_name: formName, data } = parsePayload(event.body).payload;

    if (formName === PURCHASE_FORM_NAME) {
      const stripeSessionId = data.stripeSessionId?.trim() || '';

      // The purchase form is otherwise a public Netlify Forms endpoint (same as the contact
      // form) — only trust it as a real sale if the signature proves it came from
      // stripe-webhook.ts, which is the only place that knows STRIPE_WEBHOOK_SECRET.
      if (!verifyPurchaseSignature(stripeSessionId, data.verificationToken?.trim() || '')) {
        await captureAndFlush(
          new Error(`Rejected unverified purchase submission for session: ${stripeSessionId}`)
        );
        return { statusCode: HTTP_OK, body: '' };
      }

      const purchase: Purchase = {
        planSlug: data.planSlug?.trim() || '',
        stripeSessionId,
        amountTotal: data.amountTotal?.trim() || '',
        currency: data.currency?.trim() || '',
        customerEmail: data.customerEmail?.trim().toLowerCase() || '',
        timestamp: data.timestamp?.trim() || '',
      };

      await sendPurchaseNotificationEmail(purchase);

      return { statusCode: HTTP_OK, body: '' };
    }

    const subject = resolveSubject(data.subject);

    if (subject === CONSULTATION_SUBJECT) {
      await handleConsultation(data);
      return { statusCode: HTTP_OK, body: '' };
    }

    const contact: Contact = {
      name: data.fullName?.trim() || '',
      email: data.email?.trim().toLowerCase() || '',
      subject,
      message: data.yourMessage?.trim() || '',
    };

    await sendNotificationEmail(contact);

    return { statusCode: HTTP_OK, body: '' };
  } catch (error) {
    await captureAndFlush(error);
    return { statusCode: HTTP_OK, body: '' };
  }
};
