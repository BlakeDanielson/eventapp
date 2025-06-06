import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for purchasing tickets
const purchaseSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  buyerName: z.string().min(2, 'Name must be at least 2 characters'),
  buyerEmail: z.string().email('Please enter a valid email address'),
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

    // Get the ticket and check availability
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: validatedData.ticketId,
        eventId,
        isActive: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or not available for purchase' },
        { status: 404 }
      );
    }

    // Check ticket availability
    if (ticket.maxQuantity && ticket.soldQuantity + validatedData.quantity > ticket.maxQuantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    // Check sale dates
    const now = new Date();
    if (ticket.saleStartDate && now < ticket.saleStartDate) {
      return NextResponse.json(
        { error: 'Ticket sales have not started yet' },
        { status: 400 }
      );
    }
    if (ticket.saleEndDate && now > ticket.saleEndDate) {
      return NextResponse.json(
        { error: 'Ticket sales have ended' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = ticket.price * validatedData.quantity;

    // Create mock payment data
    const mockPaymentData = {
      mockCardNumber: validatedData.cardNumber || '**** **** **** 1234',
      mockExpiryDate: validatedData.expiryDate || '12/25',
      mockTransactionId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processedAt: new Date().toISOString(),
      status: 'mock_success',
    };

    // Create the purchase record
    const purchase = await prisma.purchase.create({
      data: {
        eventId,
        ticketId: validatedData.ticketId,
        buyerName: validatedData.buyerName,
        buyerEmail: validatedData.buyerEmail,
        quantity: validatedData.quantity,
        totalAmount,
        status: 'completed',
        paymentMethod: validatedData.paymentMethod,
        transactionId: mockPaymentData.mockTransactionId,
        paymentData: mockPaymentData,
      },
    });

    // Update ticket sold quantity
    await prisma.ticket.update({
      where: { id: validatedData.ticketId },
      data: {
        soldQuantity: {
          increment: validatedData.quantity,
        },
      },
    });

    // Return purchase confirmation with mock data
    return NextResponse.json(
      {
        success: true,
        purchase: {
          id: purchase.id,
          ticketName: ticket.name,
          quantity: purchase.quantity,
          totalAmount: purchase.totalAmount,
          currency: ticket.currency,
          buyerName: purchase.buyerName,
          buyerEmail: purchase.buyerEmail,
          transactionId: purchase.transactionId,
          status: purchase.status,
          createdAt: purchase.createdAt,
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