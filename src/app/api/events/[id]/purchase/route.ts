import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for purchasing tickets
const ticketItemSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

const purchaseSchema = z.object({
  tickets: z.array(ticketItemSchema).min(1, 'At least one ticket must be selected'),
  buyerEmail: z.string().email('Please enter a valid email address'),
  buyerName: z.string().min(2, 'Name must be at least 2 characters'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  paymentMethod: z.enum(['mock-credit-card', 'mock-paypal', 'mock-apple-pay']).default('mock-credit-card'),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

// POST /api/events/[id]/purchase - Purchase tickets for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = purchaseSchema.parse(body);

    // Validate all tickets exist and are available
    const ticketIds = validatedData.tickets.map(t => t.ticketId);
    const tickets = await prisma.ticket.findMany({
      where: {
        id: { in: ticketIds },
        eventId,
        isActive: true,
      },
    });

    if (tickets.length !== ticketIds.length) {
      return NextResponse.json(
        { error: 'One or more tickets not found or not available for purchase' },
        { status: 404 }
      );
    }

    // Check availability for each ticket
    for (const ticketItem of validatedData.tickets) {
      const ticket = tickets.find(t => t.id === ticketItem.ticketId);
      if (!ticket) continue;

      // Check ticket availability
      if (ticket.maxQuantity && ticket.soldQuantity + ticketItem.quantity > ticket.maxQuantity) {
        return NextResponse.json(
          { error: `Not enough tickets available for ${ticket.name}` },
          { status: 400 }
        );
      }

      // Check sale dates
      const now = new Date();
      if (ticket.saleStartDate && now < ticket.saleStartDate) {
        return NextResponse.json(
          { error: `Ticket sales for ${ticket.name} have not started yet` },
          { status: 400 }
        );
      }
      if (ticket.saleEndDate && now > ticket.saleEndDate) {
        return NextResponse.json(
          { error: `Ticket sales for ${ticket.name} have ended` },
          { status: 400 }
        );
      }
    }

    // Create mock payment data
    const mockPaymentData = {
      mockCardNumber: validatedData.cardNumber || '**** **** **** 1234',
      mockExpiryDate: validatedData.expiryDate || '12/25',
      mockTransactionId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processedAt: new Date().toISOString(),
      status: 'mock_success',
    };

    // Create purchase records for each ticket type
    const purchases = await Promise.all(
      validatedData.tickets.map(async (ticketItem) => {
        const ticket = tickets.find(t => t.id === ticketItem.ticketId)!;
        const amount = ticket.price * ticketItem.quantity;

        const purchase = await prisma.purchase.create({
          data: {
            eventId,
            ticketId: ticketItem.ticketId,
            buyerName: validatedData.buyerName,
            buyerEmail: validatedData.buyerEmail,
            quantity: ticketItem.quantity,
            totalAmount: amount,
            status: 'completed',
            paymentMethod: validatedData.paymentMethod,
            transactionId: mockPaymentData.mockTransactionId,
            paymentData: mockPaymentData,
          },
        });

        // Update ticket sold quantity
        await prisma.ticket.update({
          where: { id: ticketItem.ticketId },
          data: {
            soldQuantity: {
              increment: ticketItem.quantity,
            },
          },
        });

        return {
          id: purchase.id,
          ticketName: ticket.name,
          quantity: purchase.quantity,
          totalAmount: purchase.totalAmount,
          currency: ticket.currency,
        };
      })
    );

    // Return purchase confirmation with mock data
    return NextResponse.json(
      {
        success: true,
        purchases,
        summary: {
          totalTickets: validatedData.tickets.reduce((sum, t) => sum + t.quantity, 0),
          totalAmount: validatedData.totalAmount,
          buyerName: validatedData.buyerName,
          buyerEmail: validatedData.buyerEmail,
          transactionId: mockPaymentData.mockTransactionId,
          status: 'completed',
        },
        message: 'Mock payment processed successfully! This is a demo transaction.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing purchase:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
} 