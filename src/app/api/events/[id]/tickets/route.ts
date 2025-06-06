import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating tickets
const ticketSchema = z.object({
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  currency: z.string().default('USD'),
  maxQuantity: z.number().min(1).optional(),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
  isActive: z.boolean().default(true),
  allowMultiple: z.boolean().default(true),
});

// GET /api/events/[id]/tickets - Get all tickets for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    // Get tickets for the event
    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/tickets - Create a new ticket for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = ticketSchema.parse(body);

    // Check if the user owns this event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or you do not have permission to manage it' },
        { status: 404 }
      );
    }

    // Convert date strings to Date objects if provided
    const ticketData = {
      ...validatedData,
      eventId,
      saleStartDate: validatedData.saleStartDate ? new Date(validatedData.saleStartDate) : null,
      saleEndDate: validatedData.saleEndDate ? new Date(validatedData.saleEndDate) : null,
    };

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: ticketData,
    });

    // Update event to indicate it has tickets
    await prisma.event.update({
      where: { id: eventId },
      data: { hasTickets: true },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
} 