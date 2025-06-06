'use client';

import { EventForm } from '@/components/event-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Calendar, Users, Ticket, Zap } from 'lucide-react';
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-zinc-800 border-t-white mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-zinc-700 border-t-zinc-400 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-zinc-400 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Please sign in to start creating amazing events that will captivate your audience.
          </p>
          <Link href="/sign-in">
            <Button className="bg-white hover:bg-zinc-100 text-black px-8 py-3 rounded-lg font-medium transition-all duration-200">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-zinc-800" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-black" />
                </div>
                <h1 className="text-xl font-semibold text-white">
                  Create Event
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500 hidden sm:block">
                {user?.firstName || 'Organizer'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2 mb-8 border border-zinc-800">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-zinc-300">Event Creation</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Create your event
          </h1>
          
          <p className="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Everything you need to launch, manage, and grow your event.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Smart Scheduling</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <Users className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Guest Management</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <Ticket className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Ticketing System</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Form Container */}
          <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
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
