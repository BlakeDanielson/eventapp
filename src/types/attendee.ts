// Shared type definitions for attendee-related data that match Prisma types
import { Purchase } from '@prisma/client';

// Use the exact Prisma types with selected includes
export interface Attendee {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  referral?: {
    name: string;
  } | null;
  purchase?: Purchase | null;
}

export interface Invitee {
  id: string;
  email: string;
  hasAccessed: boolean;
  inviteToken: string;
  accessedAt?: Date | null; // Prisma returns Date objects or null, not strings
  referredCount: number;
  inviteLink: string;
} 