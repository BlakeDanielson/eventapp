'use client';

import { EventForm } from '@/components/event-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { EventFormData } from '@/types/forms';
import { CreateEventRequest, CreateEventResponse } from '@/types/api';
import { TicketData } from '@/components/event-form/EventTicketingSection';

interface ExtendedEventFormData extends EventFormData {
  invitees?: string[];
  tickets?: TicketData[];
  hasTickets?: boolean;
  requiresTickets?: boolean;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const handleFormSubmit = async (values: ExtendedEventFormData): Promise<void> => {
    console.log('🔍 Create-event page DEBUG: Received values:', values);
    console.log('🔍 Create-event page DEBUG: Invitees:', values.invitees);
    console.log('🔍 Create-event page DEBUG: Tickets:', values.tickets);
    
    const requestData: CreateEventRequest & { invitees?: string[] } = {
      title: values.title,
      date: values.date,
      time: values.time,
      location: values.location,
      bio: values.bio,
      agenda: values.agenda,
      qa: values.qa,
      status: values.status || 'published', // Default to published so it's publicly visible
      imageUrl: undefined, // Handle image upload separately if needed
      invitees: values.invitees, // Include invitees in the request
      hasTickets: values.hasTickets || false,
      requiresTickets: values.requiresTickets || false,
    };
    
    console.log('🔍 Create-event page DEBUG: Request data:', requestData);

    // First, create the event
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create event:', error);
      throw new Error(`Failed to create event: ${error.error || 'Unknown error'}`);
    }

    const event: CreateEventResponse = await response.json();
    console.log('🔍 Create-event page DEBUG: Event created:', event);

    // If tickets were configured, create them
    if (values.tickets && values.tickets.length > 0) {
      console.log('🔍 Create-event page DEBUG: Creating tickets for event:', event.id);
      
      try {
        // Create each ticket
        for (const ticket of values.tickets) {
          const ticketData = {
            name: ticket.name,
            description: ticket.description || '',
            price: ticket.price,
            currency: ticket.currency || 'USD',
            maxQuantity: ticket.maxQuantity,
            saleStartDate: ticket.saleStartDate,
            saleEndDate: ticket.saleEndDate,
            isActive: ticket.isActive ?? true,
            allowMultiple: ticket.allowMultiple ?? true,
          };
          
          console.log('🔍 Create-event page DEBUG: Creating ticket:', ticketData);
          
          const ticketResponse = await fetch(`/api/events/${event.id}/tickets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticketData),
          });

          if (!ticketResponse.ok) {
            const ticketError = await ticketResponse.json();
            console.error('Failed to create ticket:', ticketError);
            // Don't throw here, just log the error so the event is still created
            console.warn(`Warning: Could not create ticket "${ticket.name}": ${ticketError.error}`);
          } else {
            const createdTicket = await ticketResponse.json();
            console.log('🔍 Create-event page DEBUG: Ticket created:', createdTicket);
          }
        }
      } catch (ticketError) {
        console.error('Error creating tickets:', ticketError);
        // Don't fail the whole process, just warn
        console.warn('Some tickets could not be created, but event was created successfully');
      }
    }
    
    // Redirect to dashboard with success message
    router.push(`/dashboard?created=${event.id}&title=${encodeURIComponent(event.title)}`);
  };

  // Authentication Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - this shouldn't happen with middleware, but good fallback
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to create events.</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Create New Event</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || 'Organizer'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Event</h2>
            <p className="text-gray-600">
              Fill out the details below to create a beautiful event page that you can share with your attendees.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-8">
              <EventForm 
                onSubmit={handleFormSubmit} 
                mode="create"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
