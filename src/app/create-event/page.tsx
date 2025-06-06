'use client';

import { EventForm } from '@/components/event-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Calendar, Users, Ticket } from 'lucide-react';
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
      status: values.status || 'published',
      imageUrl: undefined,
      invitees: values.invitees,
      hasTickets: values.hasTickets || false,
      requiresTickets: values.requiresTickets || false,
    };
    
    console.log('🔍 Create-event page DEBUG: Request data:', requestData);

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

    if (values.tickets && values.tickets.length > 0) {
      console.log('🔍 Create-event page DEBUG: Creating tickets for event:', event.id);
      
      try {
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
            console.warn(`Warning: Could not create ticket "${ticket.name}": ${ticketError.error}`);
          } else {
            const createdTicket = await ticketResponse.json();
            console.log('🔍 Create-event page DEBUG: Ticket created:', createdTicket);
          }
        }
      } catch (ticketError) {
        console.error('Error creating tickets:', ticketError);
        console.warn('Some tickets could not be created, but event was created successfully');
      }
    }
    
    router.push(`/dashboard?created=${event.id}&title=${encodeURIComponent(event.title)}`);
  };

  // Authentication Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Please sign in to start creating amazing events that will captivate your audience.
          </p>
          <Link href="/sign-in">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100/80 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300/60" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Create New Event
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome back, {user?.firstName || 'Organizer'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-200/50">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Event Creation</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4 leading-tight">
            Bring Your Event to Life
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create a stunning event page that captivates your audience and drives attendance. 
            Fill out the details below and watch your vision come to reality.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Easy Scheduling</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Guest Management</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50">
              <Ticket className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Ticketing System</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Form Container */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="p-8 sm:p-12">
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
