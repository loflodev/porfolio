/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable node/no-process-env */
/* eslint-disable no-console */
import type { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

export const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers

  console.log('=== Environment Check ===');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ EXISTS' : '❌ MISSING');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ EXISTS' : '❌ MISSING');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'djljmix@gmail.com');
  console.log('========================');

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, name, message } = JSON.parse(event.body || '{}');

    // Validate
    if (!email?.trim() || !name?.trim() || !message?.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Validate field lengths (prevent spam/abuse)
    if (
      name.length > MAX_NAME_LENGTH ||
      email.length > MAX_EMAIL_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Field values exceed maximum length' }),
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid email format' }),
      };
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    console.log('📧 Attempting to send email from:', 'noreply@loflodev.com');
    console.log('📧 Sending to:', process.env.ADMIN_EMAIL || 'djljmix@gmail.com');

    // Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('contacts')
      .insert([
        {
          name: trimmedName,
          email: trimmedEmail.toLowerCase(),
          message: trimmedMessage,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      throw new Error('Failed to save contact information');
    }

    console.log('✅ Data saved to Supabase');

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'LofloDev <noreply@loflodev.com>', // Update with your verified domain
      to: process.env.ADMIN_EMAIL || 'djljmix@gmail.com',
      subject: ` New Message from ${trimmedName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: hsl(0, 0%, 7%); padding: 40px 25px 10px 25px; border-radius: 16px; border: 1px solid linear-gradient(to bottom right, hsl(240, 1%, 25%) 3%, hsl(0, 0%, 19%) 97%);">
    <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600; margin-bottom: 8px;">New Message</h2>
    <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #d4af37 0%, #f4d03f 100%); border-radius: 2px; margin-bottom: 32px;"></div>
    
   
      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Name</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0;">${escapeHtml(trimmedName)}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Email</p>
        <p style="margin: 0;"><a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #d4af37; text-decoration: none; font-size: 16px;">${email}</a></p>
      </div>
      
      <div>
        <p style="color: hsl(0, 0%, 84%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 500;">Message</p>
        <p style="color: #cccccc; font-size: 15px; margin: 0 0 30px 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
    
    <p style="color: #666666; font-size: 13px; margin: 0; text-align: center;">
      Submitted on ${new Date().toLocaleString()}
    </p>
  </div>
  <p style="color: #666666; font-size: 9px; margin: 0 padding: 5px; text-align: center;">
      © LofloDev 2025. All rights reserved
    </p>
</div>
      `,
      text: `
      NEW CONTACT FORM SUBMISSION
      Name: ${trimmedName}
      Email: ${trimmedEmail}
      Message: ${trimmedMessage}
      Submitted on ${new Date().toLocaleString()}
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      // eslint-disable-next-line no-magic-numbers
      console.error('Error details:', JSON.stringify(emailError, null, 2));
    } else {
      console.log('✅ Email sent successfully!');
      console.log('Email ID:', emailData?.id);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          id: dbData.id,
          emailSent: !emailError,
          emailId: emailData?.id,
        },
        message: 'Your message has been received successfully!',
      }),
    };
  } catch (error) {
    console.error('Function error:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid request format',
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
    };
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
