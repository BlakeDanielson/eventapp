import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/events/[id]/public - Get public event details (no auth required)
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;

    const event = await prisma.event.findFirst({
      where: {
        id: params.id,
        // Show both public and published events publicly (backward compatibility)
        status: { in: ['public', 'published'] },
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

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or not published' },
        { status: 404 }
      );
    }

    // Return public event data (exclude sensitive info like userId)
    const publicEvent = {
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
    };

    return NextResponse.json(publicEvent);
  } catch (error) {
    console.error('Public event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
} 