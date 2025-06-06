'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  eventFormSchema,
  EventFormData,
  EventFormProps,
  eventToFormData,
  getFormDefaults,
} from '@/types/forms';
import {
  EventBasicInfoFields,
  EventDetailsFields,
  EventStatusSection,
  EventReferralSection,
  EventFormActions,
  EventTicketingSection,
  EventQASection,
} from './event-form/index';
import { TicketData } from './event-form/EventTicketingSection';

export function EventForm({ 
  onSubmit, 
  initialData, 
  submitButtonText = 'Create Event',
  mode = 'create' 
}: EventFormProps) {
  const [eventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitees, setInvitees] = useState<string[]>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      ...getFormDefaults(),
      ...eventToFormData(initialData || {}),
    },
  });

  const handleFormSubmit = async (values: EventFormData) => {
    setIsSubmitting(true);
    try {
      // Include invitees and tickets data when submitting
      const formDataWithExtras = {
        ...values,
        invitees: values.status === 'private' ? invitees : [],
        tickets: tickets.length > 0 ? tickets : undefined,
        hasTickets: tickets.length > 0,
        requiresTickets: tickets.length > 0,
      };
      
      console.log('🔍 Frontend DEBUG: Form values:', values);
      console.log('🔍 Frontend DEBUG: Invitees state:', invitees);
      console.log('🔍 Frontend DEBUG: Tickets state:', tickets);
      console.log('🔍 Frontend DEBUG: Final form data:', formDataWithExtras);
      
      await onSubmit(formDataWithExtras);
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} event:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-12">
        <EventBasicInfoFields control={form.control} />
        <EventDetailsFields control={form.control} />
        <EventTicketingSection 
          control={form.control}
          onTicketsChange={setTickets}
        />
        <EventStatusSection 
          control={form.control} 
          onInviteesChange={setInvitees}
        />
        <EventReferralSection />
        <EventQASection control={form.control} />
        <EventFormActions 
          isSubmitting={isSubmitting}
          submitButtonText={submitButtonText}
          eventId={eventId}
        />
      </form>
    </Form>
  );
}
