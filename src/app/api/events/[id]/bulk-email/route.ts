import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emails, subject, message } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'No email recipients provided' },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Verify the user owns this event
    const event = await prisma.event.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const emailPromises = batch.map(async (email: string) => {
          return await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@blakemakesthings.com',
            to: [email],
            subject: subject,
            html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Update from ${event.title}</h1>
                </div>
                
                <div style="padding: 30px 20px; background: #f8f9fa;">
                  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
                      ${message}
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    
                    <div style="text-align: center;">
                      <h3 style="color: #667eea; margin-bottom: 20px;">Event Details</h3>
                      <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                      <p style="margin: 5px 0;"><strong>Time:</strong> ${event.time}</p>
                      <p style="margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>
                      
                      <div style="margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/event/${event.id}" 
                           style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                          View Event Details
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                  <p>You received this email because you're registered for this event.</p>
                  <p>Event managed via EventApp</p>
                </div>
              </div>
            `,
          });
        });

        const batchResults = await Promise.allSettled(emailPromises);
        results.push(...batchResults);

        // Add a small delay between batches to respect rate limits
        if (i + batchSize < emails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error sending batch ${i / batchSize + 1}:`, error);
      }
    }

    // Count successful and failed sends
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return NextResponse.json({
      message: `Bulk email completed`,
      successful,
      failed,
      total: emails.length,
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk emails' },
      { status: 500 }
    );
  }
} 