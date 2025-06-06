import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/events/[id] - Get specific event
export async function GET(
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

    const event = await prisma.event.findFirst({
      where: {
        id: params.id,
        userId, // Ensure user owns this event
      },
      include: {
        registrations: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
            customQuestions: true,
            referralId: true,
            referral: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        referrals: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        },
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
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...event, organizerProfile });
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
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
    const { title, date, time, location, bio, agenda, qa, imageUrl, status } = body;

    // Verify the user owns this event
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        date: new Date(date),
        time,
        location,
        bio,
        agenda,
        qa,
        imageUrl,
        status,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
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

    // Verify the user owns this event
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete associated data first (due to foreign key constraints)
    await prisma.registration.deleteMany({
      where: { eventId: params.id },
    });

    await prisma.referral.deleteMany({
      where: { eventId: params.id },
    });

    // Then delete the event
    await prisma.event.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id] - Clone event
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
    const { title, date, time } = body;

    // Verify the user owns the original event
    const originalEvent = await prisma.event.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!originalEvent) {
      return NextResponse.json(
        { error: 'Original event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create a new event based on the original
    const clonedEvent = await prisma.event.create({
      data: {
        title: title || `${originalEvent.title} (Copy)`,
        date: new Date(date),
        time: time || originalEvent.time,
        location: originalEvent.location,
        bio: originalEvent.bio,
        agenda: originalEvent.agenda,
        qa: originalEvent.qa,
        imageUrl: originalEvent.imageUrl,
        userId,
        status: 'draft', // New cloned events start as draft
      },
    });

    return NextResponse.json(clonedEvent);
  } catch (error) {
    console.error('Event clone error:', error);
    return NextResponse.json(
      { error: 'Failed to clone event' },
      { status: 500 }
    );
  }
} 