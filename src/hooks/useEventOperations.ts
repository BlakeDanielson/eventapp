import { useState, useCallback } from 'react';
import { EventWithDetails } from '@/types/event';
import { EventFormData } from '@/types/forms';
import { 
  AppError, 
  parseError, 
  logError
} from '@/lib/error-handling';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  cloneEvent,
  getEvent,
  listEvents,
  filterEventsByStatus,
  searchEvents,
  sortEvents,
} from '@/lib/event-operations';

interface UseEventOperationsReturn {
  // State
  events: EventWithDetails[];
  loading: boolean;
  error: AppError | null;
  
  // Operations
  fetchEvents: () => Promise<void>;
  fetchEvent: (eventId: string) => Promise<EventWithDetails | null>;
  createNewEvent: (eventData: EventFormData) => Promise<EventWithDetails | null>;
  updateExistingEvent: (eventId: string, eventData: EventFormData) => Promise<EventWithDetails | null>;
  deleteExistingEvent: (eventId: string) => Promise<boolean>;
  cloneExistingEvent: (eventId: string) => Promise<EventWithDetails | null>;
  
  // Filtering & Searching
  filterEvents: (status: 'all' | 'public' | 'draft' | 'cancelled') => EventWithDetails[];
  searchEventsInList: (searchTerm: string) => EventWithDetails[];
  sortEventsInList: (
    sortBy: 'date' | 'title' | 'status' | 'created',
    sortOrder?: 'asc' | 'desc'
  ) => EventWithDetails[];
  
  // Utilities
  clearError: () => void;
  refreshEvents: () => Promise<void>;
}

export function useEventOperations(): UseEventOperationsReturn {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, operation: string) => {
    const appError = parseError(error);
    logError(appError, `useEventOperations.${operation}`);
    setError(appError);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listEvents();
      setEvents(response as unknown as EventWithDetails[]);
    } catch (error) {
      handleError(error, 'fetch events');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchEvent = useCallback(async (eventId: string): Promise<EventWithDetails | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getEvent(eventId);
      return response as EventWithDetails;
    } catch (error) {
      handleError(error, 'fetch event');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createNewEvent = useCallback(async (eventData: EventFormData): Promise<EventWithDetails | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createEvent(eventData);
      
      // Add the new event to our local state
      setEvents(prev => [response as EventWithDetails, ...prev]);
      
      return response as EventWithDetails;
    } catch (error) {
      handleError(error, 'create event');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateExistingEvent = useCallback(async (
    eventId: string, 
    eventData: EventFormData
  ): Promise<EventWithDetails | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateEvent(eventId, eventData);
      
      // Update the event in our local state
      setEvents(prev => prev.map(event => 
        event.id === eventId ? response as EventWithDetails : event
      ));
      
      return response as EventWithDetails;
    } catch (error) {
      handleError(error, 'update event');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const deleteExistingEvent = useCallback(async (eventId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteEvent(eventId);
      
      // Remove the event from our local state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      return true;
    } catch (error) {
      handleError(error, 'delete event');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const cloneExistingEvent = useCallback(async (eventId: string): Promise<EventWithDetails | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await cloneEvent(eventId);
      
      // Add the cloned event to our local state
      setEvents(prev => [response as EventWithDetails, ...prev]);
      
      return response as EventWithDetails;
    } catch (error) {
      handleError(error, 'clone event');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Filtering & Searching operations (pure functions, no API calls)
  const filterEvents = useCallback((status: 'all' | 'public' | 'draft' | 'cancelled') => {
    return filterEventsByStatus(events, status);
  }, [events]);

  const searchEventsInList = useCallback((searchTerm: string) => {
    return searchEvents(events, searchTerm);
  }, [events]);

  const sortEventsInList = useCallback((
    sortBy: 'date' | 'title' | 'status' | 'created',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    return sortEvents(events, sortBy, sortOrder);
  }, [events]);

  const refreshEvents = useCallback(() => {
    return fetchEvents();
  }, [fetchEvents]);

  return {
    // State
    events,
    loading,
    error,
    
    // Operations
    fetchEvents,
    fetchEvent,
    createNewEvent,
    updateExistingEvent,
    deleteExistingEvent,
    cloneExistingEvent,
    
    // Filtering & Searching
    filterEvents,
    searchEventsInList,
    sortEventsInList,
    
    // Utilities
    clearError,
    refreshEvents,
  };
} 