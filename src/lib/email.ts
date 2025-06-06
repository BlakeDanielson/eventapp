import { Resend } from 'resend';

// Initialize Resend - will use environment variable when available
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export interface EventEmailData {
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  eventBio: string;
}

export interface InvitationEmailData {
  inviteeEmail: string;
  eventTitle: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  eventBio: string;
  inviteLink: string;
  organizerName?: string;
}

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Email would be sent to:', to);
      console.log('Subject:', subject);
      console.log('HTML:', html);
      return { success: true, message: 'Email simulated (no API key)' };
    }

    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

export function generateConfirmationEmail(eventData: EventEmailData): string {
  const { attendeeName, eventTitle, eventDate, eventTime, eventLocation, eventBio } = eventData;
  
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .event-details { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Registration Confirmed! 🎉</h1>
        </div>
        
        <div class="content">
          <p>Hi ${attendeeName},</p>
          
          <p>Thank you for registering for <strong>${eventTitle}</strong>! We're excited to have you join us.</p>
          
          <div class="event-details">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${eventTime}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            <p><strong>About:</strong> ${eventBio}</p>
          </div>
          
          <p>We'll send you a reminder closer to the event date. If you have any questions, please don't hesitate to reach out.</p>
          
          <p>Looking forward to seeing you there!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from EventApp.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendRegistrationConfirmation(eventData: EventEmailData) {
  const html = generateConfirmationEmail(eventData);
  
  return await sendEmail({
    to: eventData.attendeeEmail,
    subject: `Registration Confirmed: ${eventData.eventTitle}`,
    html,
  });
}

export function generateInvitationEmail(invitationData: InvitationEmailData): string {
  const { eventTitle, eventDate, eventTime, eventLocation, eventBio, inviteLink, organizerName } = invitationData;
  
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>You're Invited!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .event-details { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .invite-note { background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited! 🎉</h1>
        </div>
        
        <div class="content">
          <p>Hello!</p>
          
          <p>${organizerName ? `${organizerName} has invited you` : 'You have been invited'} to join <strong>${eventTitle}</strong>!</p>
          
          <div class="event-details">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${eventTime}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            <p><strong>About:</strong> ${eventBio}</p>
          </div>
          
          <div class="invite-note">
            <p><strong>This is a private event.</strong> Use the link below to access the event page and register:</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" class="button">View Event & Register</a>
          </div>
          
          <p>Click the button above to view the full event details and register for the event. This invitation link is unique to you and grants you access to this private event.</p>
          
          <p>We hope to see you there!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated invitation from EventApp.</p>
          <p style="font-size: 12px; color: #999;">If you believe you received this invitation in error, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendInvitationEmail(invitationData: InvitationEmailData) {
  const html = generateInvitationEmail(invitationData);
  
  return await sendEmail({
    to: invitationData.inviteeEmail,
    subject: `You're invited: ${invitationData.eventTitle}`,
    html,
  });
} 