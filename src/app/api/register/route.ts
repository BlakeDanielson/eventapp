import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendRegistrationConfirmation } from '@/lib/email';

const prisma = new PrismaClient();

// Validation schema for registration data
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  eventId: z.string().min(1, 'Event ID is required'),
  customQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  referralId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { name, email, eventId, customQuestions, referralId } = validationResult.data;

    // Check if event exists and get full event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is already registered for this event
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        email,
        eventId,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 409 }
      );
    }

    // Validate referral if provided
    let validReferralId = null;
    if (referralId) {
      const referral = await prisma.referral.findFirst({
        where: {
          id: referralId,
          eventId,
        },
      });
      if (referral) {
        validReferralId = referralId;
      }
    }

    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        name,
        email,
        eventId,
        customQuestions: customQuestions || [],
        referralId: validReferralId,
        status: 'registered',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            location: true,
            bio: true,
          },
        },
      },
    });

    // Send confirmation email
    try {
      await sendRegistrationConfirmation({
        attendeeName: name,
        attendeeEmail: email,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        eventBio: event.bio,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      registration,
      message: 'Registration successful! Check your email for confirmation.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
