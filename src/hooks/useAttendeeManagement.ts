import { useState, useCallback } from 'react';
import { EventWithDetails } from '@/types/event';
import {
  sendBulkEmail,
  exportAttendeesToCSV,
  downloadCSV,
  calculateEventStats,
} from '@/lib/event-operations';

interface UseAttendeeManagementReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Operations
  sendBulkEmailToAttendees: (
    eventId: string,
    emailData: { emails: string[]; subject: string; message: string }
  ) => Promise<boolean>;
  exportAttendees: (event: EventWithDetails, filename?: string) => void;
  getEventStats: (event: EventWithDetails) => {
    totalRegistrations: number;
    confirmedAttendees: number;
    pendingRegistrations: number;
    referralRegistrations: number;
    directRegistrations: number;
  };
  
  // Utilities
  clearError: () => void;
}

export function useAttendeeManagement(): UseAttendeeManagementReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    setError(error instanceof Error ? error.message : `Failed to ${operation}`);
  }, []);

  const sendBulkEmailToAttendees = useCallback(async (
    eventId: string,
    emailData: { emails: string[]; subject: string; message: string }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await sendBulkEmail(eventId, emailData);
      return true;
    } catch (error) {
      handleError(error, 'send bulk email');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const exportAttendees = useCallback((event: EventWithDetails, filename?: string) => {
    try {
      const csvContent = exportAttendeesToCSV(event);
      const defaultFilename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendees.csv`;
      downloadCSV(csvContent, filename || defaultFilename);
    } catch (error) {
      handleError(error, 'export attendees');
    }
  }, [handleError]);

  const getEventStats = useCallback((event: EventWithDetails) => {
    return calculateEventStats(event);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Operations
    sendBulkEmailToAttendees,
    exportAttendees,
    getEventStats,
    
    // Utilities
    clearError,
  };
} 