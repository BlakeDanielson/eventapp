import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { OrganizerProfile } from '@/types/event';
import { OrganizerProfileFormData } from '@/types/forms';

interface UseOrganizerProfileReturn {
  profile: OrganizerProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (data: OrganizerProfileFormData) => Promise<boolean>;
  deleteProfile: () => Promise<boolean>;
}

export function useOrganizerProfile(): UseOrganizerProfileReturn {
  const { isSignedIn } = useUser();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizer-profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching organizer profile:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const saveProfile = useCallback(async (data: OrganizerProfileFormData): Promise<boolean> => {
    if (!isSignedIn) {
      setError('Authentication required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizer-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      setProfile(result.profile);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
      console.error('Error saving organizer profile:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const deleteProfile = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) {
      setError('Authentication required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizer-profile', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile');
      }

      setProfile(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(errorMessage);
      console.error('Error deleting organizer profile:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    saveProfile,
    deleteProfile,
  };
} 