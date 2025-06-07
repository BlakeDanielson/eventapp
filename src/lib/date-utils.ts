// Utility functions for handling date conversions from API responses

/**
 * Safely converts a date string or Date object to a Date object
 * Handles null/undefined values gracefully
 */
export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  try {
    return new Date(value);
  } catch {
    return null;
  }
}

/**
 * Safely formats a date for display, handling string and Date inputs
 */
export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date || isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
}

/**
 * Transform attendee/registration data to ensure dates are Date objects
 */
export function transformAttendeeData(attendee: Record<string, unknown>) {
  return {
    ...attendee,
    createdAt: toDate(attendee.createdAt as string) || new Date(),
  };
}

/**
 * Transform invitee data to ensure dates are Date objects
 */
export function transformInviteeData(invitee: Record<string, unknown>) {
  return {
    ...invitee,
    createdAt: toDate(invitee.createdAt as string) || new Date(),
    accessedAt: toDate(invitee.accessedAt as string),
  };
} 