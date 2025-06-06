import { z } from 'zod';
import { EventStatus } from './event';


// ============================================================================
// COMMON API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  status: number;
}

// ============================================================================
// EVENT API TYPES
// ============================================================================

// POST /api/events - Create Event
export interface CreateEventRequest {
  title: string;
  date: string; // ISO date string
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  qaEnabled?: boolean;
  status: EventStatus;
  imageUrl?: string;
  hasTickets?: boolean;
  requiresTickets?: boolean;
}

export interface CreateEventResponse {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  qaEnabled: boolean;
  imageUrl?: string;
  userId: string;
  status: EventStatus;
  hasTickets?: boolean;
  requiresTickets?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/events - List User Events
export type ListEventsResponse = Array<{
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  imageUrl?: string;
  userId: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    registrations: number;
    referrals: number;
  };
}>

// GET /api/events/[id] - Get Event Details
export interface GetEventResponse {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  imageUrl?: string;
  userId: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  registrations: {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: Date;
    customQuestions?: Record<string, unknown>;
    referralId?: string;
    referral?: {
      id: string;
      name: string;
    };
  }[];
  referrals: {
    id: string;
    name: string;
    _count: {
      registrations: number;
    };
  }[];
  _count: {
    registrations: number;
    referrals: number;
  };
}

// PUT /api/events/[id] - Update Event
export interface UpdateEventRequest {
  title?: string;
  date?: string; // ISO date string
  time?: string;
  location?: string;
  bio?: string;
  agenda?: string;
  qa?: string;
  status?: EventStatus;
  imageUrl?: string;
}

export interface UpdateEventResponse {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  imageUrl?: string;
  userId: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DELETE /api/events/[id] - Delete Event
export interface DeleteEventResponse {
  message: string;
}

// POST /api/events/[id] - Clone Event
export interface CloneEventRequest {
  title?: string;
  date?: string; // ISO date string
  time?: string;
}

export interface CloneEventResponse {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  imageUrl?: string;
  userId: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REGISTRATION API TYPES
// ============================================================================

// POST /api/register - Register for Event
export interface RegisterRequest {
  eventId: string;
  name: string;
  email: string;
  customQuestions?: Record<string, unknown>;
  referralId?: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  eventId: string;
  customQuestions?: Record<string, unknown>;
  status: string;
  referralId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REFERRAL API TYPES
// ============================================================================

// POST /api/referrals - Create Referral
export interface CreateReferralRequest {
  eventId: string;
  name: string;
}

export interface CreateReferralResponse {
  id: string;
  name: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/referrals?eventId=... - List Referrals
export type ListReferralsResponse = Array<{
  id: string;
  name: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    registrations: number;
  };
}>

// ============================================================================
// BULK EMAIL API TYPES
// ============================================================================

// POST /api/events/[id]/bulk-email - Send Bulk Email
export interface BulkEmailRequest {
  emails: string[];
  subject: string;
  message: string;
}

export interface BulkEmailResponse {
  message: string;
  sentCount: number;
  failedCount: number;
  failed?: string[];
}

// ============================================================================
// EMAIL CONFIRMATION API TYPES
// ============================================================================

// POST /api/send-confirmation - Send Confirmation Email
export interface SendConfirmationRequest {
  registrationId: string;
  eventId: string;
}

export interface SendConfirmationResponse {
  message: string;
  sent: boolean;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Validation schema for event creation/update
export const createEventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  agenda: z.string().min(10, 'Agenda must be at least 10 characters'),
  qa: z.string().optional(),
  qaEnabled: z.boolean().default(true),
  status: z.enum(['draft', 'public', 'private', 'cancelled']),
  imageUrl: z.string().url().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Validation schema for registration
export const registerSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  customQuestions: z.record(z.unknown()).optional(),
  referralId: z.string().optional(),
});

// Validation schema for referral creation
export const createReferralSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  name: z.string().min(2, 'Referral name must be at least 2 characters'),
});

// Validation schema for bulk email
export const bulkEmailSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'At least one email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Helper type for API route handlers
export type ApiHandler = (
  request: Request,
  context?: unknown
) => Promise<Response>;

// Helper type for typed API responses
export type TypedResponse<T> = Response & {
  json(): Promise<T>;
};

// Helper function to create typed API responses
export function createApiResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Helper function to create error responses
export function createErrorResponse(
  error: string,
  status: number = 400
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 