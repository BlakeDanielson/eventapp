import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating tickets
const updateTicketSchema = z.object({
  name: z.string().min(1, 'Ticket name is required').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater').optional(),
  currency: z.string().optional(),
  maxQuantity: z.number().min(1).optional(),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
  isActive: z.boolean().optional(),
  allowMultiple: z.boolean().optional(),
});

// GET /api/events/[id]/tickets/[ticketId] - Get a specific ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { id: eventId, ticketId } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/tickets/[ticketId] - Update a specific ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId, ticketId } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = updateTicketSchema.parse(body);

    // Check if the user owns this event and ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId,
        event: {
          userId,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or you do not have permission to manage it' },
        { status: 404 }
      );
    }

    // Convert date strings to Date objects if provided
    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.saleStartDate !== undefined) {
      updateData.saleStartDate = validatedData.saleStartDate ? new Date(validatedData.saleStartDate) : null;
    }
    if (validatedData.saleEndDate !== undefined) {
      updateData.saleEndDate = validatedData.saleEndDate ? new Date(validatedData.saleEndDate) : null;
    }

    // Update the ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/tickets/[ticketId] - Delete a specific ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId, ticketId } = await params;

    // Check if the user owns this event and ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId,
        event: {
          userId,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or you do not have permission to manage it' },
        { status: 404 }
      );
    }

    // Check if there are any purchases for this ticket
    const purchaseCount = await prisma.purchase.count({
      where: { ticketId },
    });

    if (purchaseCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete ticket with existing purchases. Consider deactivating it instead.' },
        { status: 400 }
      );
    }

    // Delete the ticket
    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    // Check if this was the last ticket for the event
    const remainingTickets = await prisma.ticket.count({
      where: { eventId },
    });

    // If no more tickets, update event hasTickets flag
    if (remainingTickets === 0) {
      await prisma.event.update({
        where: { id: eventId },
        data: { hasTickets: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
} 