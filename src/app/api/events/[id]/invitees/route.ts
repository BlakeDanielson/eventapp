import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { sendInvitationEmail } from '@/lib/email';

const prisma = new PrismaClient();

// Validation schema for adding invitees
const addInviteesSchema = z.object({
  emails: z.array(z.string().email('Invalid email address')),
});

// POST /api/events/[id]/invitees - Add invitees to a private event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    
    // Validate request body
    const { emails } = addInviteesSchema.parse(body);

    // Check if event exists and is private
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        title: true,
        date: true,
        time: true,
        location: true,
        bio: true,
        status: true, 
        userId: true 
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'private') {
      return NextResponse.json(
        { error: 'Only private events can have invitees' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to ensure user owns the event
    // For now, we'll skip this check

    const invitees = [];
    const errors = [];

    // Process each email
    for (const email of emails) {
      try {
        // Check if already invited
        const existingInvitee = await prisma.invitee.findFirst({
          where: {
            eventId: eventId,
            email: email.toLowerCase()
          }
        });

        if (existingInvitee) {
          errors.push(`${email} is already invited`);
          continue;
        }

        // Create new invitee with unique token
        const invitee = await prisma.invitee.create({
          data: {
            email: email.toLowerCase(),
            eventId: eventId,
            inviteToken: nanoid(16), // Generate unique 16-character token
          }
        });

        invitees.push(invitee);
      } catch (error) {
        console.error(`Error adding invitee ${email}:`, error);
        errors.push(`Failed to invite ${email}`);
      }
    }

    // Send invitation emails to newly added invitees
    if (invitees.length > 0) {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com'
        : 'http://localhost:3000';

      // Send emails in parallel (but don't block the response)
      Promise.allSettled(
        invitees.map(async (invitee) => {
          try {
            await sendInvitationEmail({
              inviteeEmail: invitee.email,
              eventTitle: event.title,
              eventDate: event.date,
              eventTime: event.time,
              eventLocation: event.location,
              eventBio: event.bio,
              inviteLink: `${baseUrl}/event/${event.id}?invite=${invitee.inviteToken}`,
              // TODO: Get organizer name from user profile when available
            });
            console.log(`Invitation sent to: ${invitee.email}`);
          } catch (emailError) {
            console.error(`Failed to send invitation to ${invitee.email}:`, emailError);
          }
        })
      ).then((results) => {
        const failed = results.filter(result => result.status === 'rejected');
        if (failed.length > 0) {
          console.log(`${failed.length} invitation emails failed to send`);
        } else {
          console.log(`All ${invitees.length} invitation emails sent successfully`);
        }
      });
    }

    return NextResponse.json({
      success: true,
      invitees: invitees.map(inv => ({
        id: inv.id,
        email: inv.email,
        inviteToken: inv.inviteToken,
        hasAccessed: inv.hasAccessed,
        createdAt: inv.createdAt
      })),
      errors
    });

  } catch (error) {
    console.error('Error adding invitees:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/invitees - List invitees for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, userId: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // TODO: Add authentication check to ensure user owns the event

    // Get all invitees with registration counts
    const invitees = await prisma.invitee.findMany({
      where: { eventId: eventId },
      include: {
        _count: {
          select: {
            referredRegistrations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const inviteesWithStats = invitees.map(invitee => ({
      id: invitee.id,
      email: invitee.email,
      inviteToken: invitee.inviteToken,
      hasAccessed: invitee.hasAccessed,
      accessedAt: invitee.accessedAt,
      referredCount: invitee._count.referredRegistrations,
      createdAt: invitee.createdAt,
      // Generate invite link
      inviteLink: `${request.nextUrl.origin}/event/${eventId}?invite=${invitee.inviteToken}`
    }));

    return NextResponse.json({
      invitees: inviteesWithStats
    });

  } catch (error) {
    console.error('Error fetching invitees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/invitees - Remove invitees
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const inviteeIds = searchParams.get('ids')?.split(',') || [];

    if (inviteeIds.length === 0) {
      return NextResponse.json(
        { error: 'No invitee IDs provided' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, userId: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // TODO: Add authentication check to ensure user owns the event

    // Remove invitees
    const deletedInvitees = await prisma.invitee.deleteMany({
      where: {
        id: { in: inviteeIds },
        eventId: eventId // Ensure they belong to this event
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedInvitees.count
    });

  } catch (error) {
    console.error('Error removing invitees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id]/invitees - Resend invitation emails
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    
    // Validation schema for resending invitations
    const resendSchema = z.object({
      inviteeIds: z.array(z.string()).optional(), // If provided, only resend to these invitees
      emails: z.array(z.string().email()).optional(), // If provided, only resend to these email addresses
    });

    const { inviteeIds, emails } = resendSchema.parse(body);

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        title: true,
        date: true,
        time: true,
        location: true,
        bio: true,
        status: true, 
        userId: true 
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'private') {
      return NextResponse.json(
        { error: 'Only private events can have invitees' },
        { status: 400 }
      );
    }

    // Build where clause for invitees to resend to
    const whereClause: { eventId: string; id?: { in: string[] }; email?: { in: string[] } } = { eventId: eventId };
    
    if (inviteeIds && inviteeIds.length > 0) {
      whereClause.id = { in: inviteeIds };
    } else if (emails && emails.length > 0) {
      whereClause.email = { in: emails.map(email => email.toLowerCase()) };
    }
    
    // Get invitees to resend to (if no specific filter, resend to all)
    const invitees = await prisma.invitee.findMany({
      where: whereClause,
    });

    if (invitees.length === 0) {
      return NextResponse.json(
        { error: 'No invitees found to resend invitations to' },
        { status: 404 }
      );
    }

    // Send invitation emails
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com'
      : 'http://localhost:3000';

    const emailResults = await Promise.allSettled(
      invitees.map(async (invitee) => {
        try {
          await sendInvitationEmail({
            inviteeEmail: invitee.email,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventLocation: event.location,
            eventBio: event.bio,
            inviteLink: `${baseUrl}/event/${event.id}?invite=${invitee.inviteToken}`,
            // TODO: Get organizer name from user profile when available
          });
          return { email: invitee.email, success: true };
        } catch (emailError) {
          console.error(`Failed to resend invitation to ${invitee.email}:`, emailError);
          return { email: invitee.email, success: false, error: emailError };
        }
      })
    );

    const successful = emailResults.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = emailResults.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.success)
    ).length;

    return NextResponse.json({
      success: true,
      message: `Invitation emails resent. ${successful} succeeded, ${failed} failed.`,
      results: {
        total: invitees.length,
        successful,
        failed
      }
    });

  } catch (error) {
    console.error('Error resending invitations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 