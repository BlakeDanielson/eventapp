import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/events/[id]/private - Get private event details for verified invitees
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    // Get invite token from headers or query params
    const inviteToken = request.headers.get('X-Invite-Token') || 
                       request.nextUrl.searchParams.get('inviteToken');
    
    if (!inviteToken) {
      return NextResponse.json(
        { error: 'Invite token required for private events' },
        { status: 401 }
      );
    }

    // Verify the invite token is valid for this event
    const invitee = await prisma.invitee.findFirst({
      where: {
        inviteToken: inviteToken,
        eventId: eventId
      }
    });

    if (!invitee) {
      return NextResponse.json(
        { error: 'Invalid invite token for this event' },
        { status: 403 }
      );
    }

    // Fetch the private event data
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        status: 'private' // Ensure it's actually a private event
      },
      include: {
        _count: {
          select: {
            registrations: true,
            referrals: true,
          },
        },
      },
    });

    // Get organizer profile
    let organizerProfile = null;
    if (event) {
      organizerProfile = await prisma.organizerProfile.findUnique({
        where: { userId: event.userId },
      });
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Private event not found' },
        { status: 404 }
      );
    }

    // Return event data (exclude sensitive info like userId)
    const privateEvent = {
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      bio: event.bio,
      agenda: event.agenda,
      qa: event.qa,
      imageUrl: event.imageUrl,
      status: event.status,
      hasTickets: event.hasTickets,
      requiresTickets: event.requiresTickets,
      createdAt: event.createdAt,
      _count: event._count,
      organizerProfile,
    };

    return NextResponse.json(privateEvent);
  } catch (error) {
    console.error('Private event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch private event' },
      { status: 500 }
    );
  }
} 