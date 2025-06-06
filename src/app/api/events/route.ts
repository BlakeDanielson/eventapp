import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { sendInvitationEmail } from '@/lib/email';
import {
  CreateEventResponse,
  createEventSchema,
  createApiResponse,
  createErrorResponse,
} from '@/types/api';

const prisma = new PrismaClient();

export async function POST(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized - please sign in', 401);
    }

    const body = await request.json();
    
    // Extract invitees and ticket settings from the request body
    const { invitees, hasTickets, requiresTickets, ...eventData } = body;
    
    // Debug logging to see what we received
    console.log('🔍 DEBUG: Request body:', body);
    console.log('🔍 DEBUG: Invitees received:', invitees);
    console.log('🔍 DEBUG: Event status:', eventData.status);
    
    // Validate event data
    const validationResult = createEventSchema.safeParse(eventData);
    if (!validationResult.success) {
      return createErrorResponse(
        `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    const { title, date, time, location, bio, agenda, qa, imageUrl, status } = validationResult.data;

    // Create event in a transaction to handle invitees
    const result = await prisma.$transaction(async (tx) => {
      // Create the event
      const event = await tx.event.create({
        data: {
          title,
          date: new Date(date),
          time,
          location,
          bio,
          agenda,
          qa,
          imageUrl,
          userId,
          status: status || 'public', // Default to public instead of published
          hasTickets: hasTickets || false,
          requiresTickets: requiresTickets || false,
        },
      });

      // If it's a private event and has invitees, create them
      if (status === 'private' && invitees && Array.isArray(invitees) && invitees.length > 0) {
        console.log('🔍 DEBUG: Creating private event with invitees:', invitees);
        const createdInvitees = [];
        
        // For SQLite, we need to handle duplicates manually since skipDuplicates isn't supported
        for (const email of invitees) {
          try {
            const invitee = await tx.invitee.create({
              data: {
                email: email.toLowerCase(),
                eventId: event.id,
                inviteToken: nanoid(16), // Generate unique token for each invitee
              }
            });
            createdInvitees.push(invitee);
            console.log('✅ Created invitee:', invitee.email, 'with token:', invitee.inviteToken);
          } catch (error: unknown) {
            // Skip if duplicate (P2002 is Prisma's unique constraint violation error)
            if ((error as any)?.code !== 'P2002') {
              throw error;
            }
            console.log('⚠️ Duplicate invitee skipped:', email);
          }
        }

        // Send invitation emails to newly created invitees
        if (createdInvitees.length > 0) {
          console.log('📧 DEBUG: Preparing to send emails to', createdInvitees.length, 'invitees');
          const baseUrl = process.env.NODE_ENV === 'production' 
            ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-domain.com'
            : 'http://localhost:3000';

          console.log('🌐 Base URL for invite links:', baseUrl);
          console.log('🔑 RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);

          // Send emails in parallel (but don't block the response)
          Promise.allSettled(
            createdInvitees.map(async (invitee) => {
              try {
                console.log('📤 Attempting to send email to:', invitee.email);
                const result = await sendInvitationEmail({
                  inviteeEmail: invitee.email,
                  eventTitle: event.title,
                  eventDate: event.date,
                  eventTime: event.time,
                  eventLocation: event.location,
                  eventBio: event.bio,
                  inviteLink: `${baseUrl}/event/${event.id}?invite=${invitee.inviteToken}`,
                  // TODO: Get organizer name from user profile when available
                });
                console.log('✅ Email sent successfully to:', invitee.email, 'Result:', result);
              } catch (emailError) {
                console.error('❌ Failed to send invitation to', invitee.email, ':', emailError);
              }
            })
          ).then((results) => {
            const failed = results.filter(result => result.status === 'rejected');
            if (failed.length > 0) {
              console.log(`❌ ${failed.length} invitation emails failed to send`);
            } else {
              console.log(`✅ All ${createdInvitees.length} invitation emails sent successfully`);
            }
          });
        } else {
          console.log('⚠️ No new invitees to send emails to');
        }
      } else {
        console.log('ℹ️ Not a private event with invitees. Status:', status, 'Invitees:', invitees);
      }

      return event;
    });

    const response: CreateEventResponse = {
      id: result.id,
      title: result.title,
      date: result.date,
      time: result.time,
      location: result.location,
      bio: result.bio,
      agenda: result.agenda,
      qa: result.qa || undefined,
      imageUrl: result.imageUrl || undefined,
      userId: result.userId,
      status: result.status as 'draft' | 'public' | 'private' | 'cancelled',
      hasTickets: result.hasTickets,
      requiresTickets: result.requiresTickets,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return createApiResponse(response, 201);
  } catch (error) {
    console.error('Event creation error:', error);
    return createErrorResponse('Failed to create event', 500);
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized - please sign in', 401);
    }

    // Get user's events with registration counts
    const events = await prisma.event.findMany({
      where: {
        userId,
      },
      include: {
        registrations: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
        referrals: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            referrals: true,
            invitees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match API response type
    const response = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      bio: event.bio,
      agenda: event.agenda,
      qa: event.qa || undefined,
      imageUrl: event.imageUrl || undefined,
      userId: event.userId,
      status: event.status as 'draft' | 'published', // Use actual status from database
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      _count: event._count,
    }));

    return createApiResponse(response);
  } catch (error) {
    console.error('Events fetch error:', error);
    return createErrorResponse('Failed to fetch events', 500);
  }
}
