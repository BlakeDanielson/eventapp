import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for the request
const verifyAccessSchema = z.object({
  email: z.string().email('Invalid email address'),
  inviteToken: z.string().optional(), // Optional invite token from URL
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: eventId } = params;
    const body = await request.json();
    
    // Validate request body
    const { email, inviteToken } = verifyAccessSchema.parse(body);

    // First, check if the event exists and get its status
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        title: true, 
        status: true,
        userId: true // For checking if it's the organizer
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // If event is not private, allow access
    if (event.status !== 'private') {
      return NextResponse.json({
        hasAccess: true,
        reason: 'public_event',
        inviteToken: inviteToken || null
      });
    }

    // For private events, check if user is the organizer
    // Note: We'll need to get the current user's ID from Clerk auth
    // For now, we'll skip this check and implement it when we add auth

    // Check if email is in the invitee list
    const invitee = await prisma.invitee.findFirst({
      where: {
        eventId: eventId,
        email: email.toLowerCase()
      }
    });

    if (invitee) {
      // Update access tracking
      await prisma.invitee.update({
        where: { id: invitee.id },
        data: {
          hasAccessed: true,
          accessedAt: invitee.accessedAt || new Date() // Only set if not already set
        }
      });

      return NextResponse.json({
        hasAccess: true,
        reason: 'invited',
        inviteToken: invitee.inviteToken,
        inviteeId: invitee.id
      });
    }

    // If they have a valid invite token, they can access even if not directly invited
    if (inviteToken) {
      const tokenInvitee = await prisma.invitee.findUnique({
        where: { inviteToken: inviteToken }
      });

      if (tokenInvitee && tokenInvitee.eventId === eventId) {
        return NextResponse.json({
          hasAccess: true,
          reason: 'shared_link',
          inviteToken: inviteToken,
          sharedBy: tokenInvitee.email
        });
      }
    }

    // No access
    return NextResponse.json({
      hasAccess: false,
      reason: 'not_invited',
      message: 'You are not invited to this private event'
    });

  } catch (error) {
    console.error('Error verifying access:', error);
    
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