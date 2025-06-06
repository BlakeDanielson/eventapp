import { EventWithDetails } from '@/types/event';
import { EventFormData } from '@/types/forms';
import { 
  CreateEventResponse, 
  UpdateEventResponse,
  DeleteEventResponse,
  GetEventResponse,
  ListEventsResponse,
  BulkEmailRequest,
  BulkEmailResponse 
} from '@/types/api';
import { handleFetchError } from '@/lib/error-handling';

// ===== EVENT CRUD OPERATIONS =====

/**
 * Create a new event
 */
export async function createEvent(eventData: EventFormData): Promise<CreateEventResponse> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    await handleFetchError(response);
  }

  return response.json();
}

/**
 * Fetch a single event by ID
 */
export async function getEvent(eventId: string): Promise<GetEventResponse> {
  const response = await fetch(`/api/events/${eventId}`);

  if (!response.ok) {
    await handleFetchError(response);
  }

  return response.json();
}

/**
 * Update an existing event
 */
export async function updateEvent(
  eventId: string, 
  eventData: EventFormData
): Promise<UpdateEventResponse> {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    await handleFetchError(response);
  }

  return response.json();
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<DeleteEventResponse> {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await handleFetchError(response);
  }

  return response.json();
}

/**
 * Clone an event (create a copy with modified details)
 */
export async function cloneEvent(eventId: string): Promise<CreateEventResponse> {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    await handleFetchError(response);
  }

  return response.json();
}

// ===== EVENT LISTING & FILTERING =====

/**
 * Fetch all events for the current user
 */
export async function listEvents(): Promise<ListEventsResponse> {
  const response = await fetch('/api/events');

  if (!response.ok) {
    await handleFetchError(response);
  }

  return response.json();
}

/**
 * Filter events by status
 */
export function filterEventsByStatus(
  events: EventWithDetails[],
  status: 'all' | 'public' | 'private' | 'draft' | 'cancelled'
): EventWithDetails[] {
  if (status === 'all') return events;
  return events.filter(event => event.status === status);
}

/**
 * Search events by title
 */
export function searchEvents(events: EventWithDetails[], searchTerm: string): EventWithDetails[] {
  if (!searchTerm.trim()) return events;
  
  const term = searchTerm.toLowerCase();
  return events.filter(event => 
    event.title.toLowerCase().includes(term) ||
    event.bio?.toLowerCase().includes(term)
  );
}

/**
 * Sort events by different criteria
 */
export function sortEvents(
  events: EventWithDetails[],
  sortBy: 'date' | 'title' | 'status' | 'created',
  sortOrder: 'asc' | 'desc' = 'desc'
): EventWithDetails[] {
  const sorted = [...events].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

// ===== ATTENDEE OPERATIONS =====

/**
 * Send bulk email to attendees
 */
export async function sendBulkEmail(
  eventId: string, 
  emailData: Omit<BulkEmailRequest, 'eventId'>
): Promise<BulkEmailResponse> {
  const response = await fetch(`/api/events/${eventId}/bulk-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    throw new Error(`Failed to send bulk email: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Export attendees to CSV format
 */
export function exportAttendeesToCSV(event: EventWithDetails): string {
  if (!event.registrations || event.registrations.length === 0) {
    return 'No attendees to export';
  }

  // CSV headers
  const headers = ['Name', 'Email', 'Status', 'Registration Date', 'Referral'];
  
  // CSV rows
  const rows = event.registrations.map(registration => [
    registration.name,
    registration.email,
    registration.status,
    new Date(registration.createdAt).toLocaleDateString(),
    registration.referral?.name || 'Direct Registration'
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ===== DATA TRANSFORMATION UTILITIES =====

/**
 * Calculate event statistics
 */
export function calculateEventStats(event: EventWithDetails) {
  const registrations = event.registrations || [];
  
  return {
    totalRegistrations: registrations.length,
    confirmedAttendees: registrations.filter(r => r.status === 'confirmed').length,
    pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
    referralRegistrations: registrations.filter(r => r.referral).length,
    directRegistrations: registrations.filter(r => !r.referral).length,
  };
}

/**
 * Format event date for display
 */
export function formatEventDate(date: string, time?: string): string {
  const eventDate = new Date(date);
  const dateString = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (time) {
    return `${dateString} at ${time}`;
  }

  return dateString;
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(date: string): boolean {
  return new Date(date) > new Date();
}

/**
 * Get event status badge color
 */
export function getEventStatusColor(status: string): string {
  switch (status) {
    case 'public':
      return 'bg-green-100 text-green-800';
    case 'private':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    // Handle legacy 'published' status
    case 'published':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Resend invitation emails to specific invitees
 */
export async function resendInvitationEmails(
  eventId: string, 
  options: {
    inviteeIds?: string[];
    emails?: string[];
  } = {}
): Promise<{
  success: boolean;
  message: string;
  results: {
    total: number;
    successful: number;
    failed: number;
  };
}> {
  const response = await fetch(`/api/events/${eventId}/invitees`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Failed to resend invitations: ${response.statusText}`);
  }

  return response.json();
} 