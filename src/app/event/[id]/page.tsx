'use client';

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Event } from '@/types/event';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { EventPageClient } from './event-page-client';
import { PrivateEventAccessGate } from '@/components/private-event-access-gate';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AccessInfo {
  hasAccess: boolean;
  reason: 'invited' | 'shared_link' | 'public_event' | 'owner';
  inviteToken?: string;
  inviteeId?: string;
  sharedBy?: string;
  inviteeEmail?: string;
}

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const searchParams = useSearchParams();
  const { user, isLoaded: userLoaded } = useUser();
  const [eventId, setEventId] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [showAccessGate, setShowAccessGate] = useState(false);

  // Get invite token from URL parameters
  const inviteToken = searchParams.get('invite');

  // Resolve params promise
  useEffect(() => {
    params.then(({ id }) => setEventId(id));
  }, [params]);

  // Fetch event data
  useEffect(() => {
    if (!eventId || !userLoaded) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to get basic event info to check status
        const response = await fetch(`/api/events/${eventId}/public`);
        
        if (response.ok) {
          // Event is public, load normally
          const eventData = await response.json();
          setEvent(eventData);
          setAccessInfo({
            hasAccess: true,
            reason: 'public_event',
            inviteToken: inviteToken || undefined
          });
        } else if (response.status === 404) {
          // If public endpoint returns 404, check if user is the owner first
          if (user) {
            // Try to fetch as owner
            const ownerResponse = await fetch(`/api/events/${eventId}`, {
              credentials: 'include'
            });
            
            if (ownerResponse.ok) {
              // User is the owner, load the event
              const eventData = await ownerResponse.json();
              setEvent(eventData);
              setAccessInfo({
                hasAccess: true,
                reason: 'owner',
                inviteToken: inviteToken || undefined,
                inviteeEmail: user.emailAddresses[0]?.emailAddress
              });
              return;
            }
          }
          
          // Not the owner, show access gate for private event
          setShowAccessGate(true);
        } else {
          throw new Error(`Failed to fetch event: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Unable to load event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, inviteToken, user, userLoaded]);

  const handleAccessGranted = async (accessData: AccessInfo) => {
    try {
      setLoading(true);
      
      // For private events, use the private endpoint with invite token
      const response = await fetch(`/api/events/${eventId}/private`, {
        headers: {
          'X-Invite-Token': accessData.inviteToken || '',
        }
      });

      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        setAccessInfo(accessData);
        setShowAccessGate(false);
      } else {
        setError('Failed to load event after verification');
      }
    } catch (error) {
      console.error('Error loading event after access granted:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header with Back Button */}
        <header className="bg-black/40 border-b border-white/[0.08] backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/[0.05]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-white/50">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header with Back Button */}
        <header className="bg-black/40 border-b border-white/[0.08] backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/[0.05]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (showAccessGate) {
    return (
      <PrivateEventAccessGate
        eventId={eventId!}
        eventTitle="Private Event"
        inviteToken={inviteToken || undefined}
        onAccessGranted={handleAccessGranted}
      />
    );
  }

  if (!event || !accessInfo) {
    return notFound();
  }

  // Format the date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const registrationCount = (event as { _count?: { registrations?: number } })?._count?.registrations || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Back Button */}
      <header className="bg-black/40 border-b border-white/[0.08] backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/[0.05]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Show access info for debugging/transparency */}
        {accessInfo.reason === 'shared_link' && accessInfo.sharedBy && (
          <Alert className="mb-6 border-blue-500/20 bg-blue-500/10">
            <AlertDescription className="text-blue-400">
              You&apos;re viewing this private event via an invite shared by {accessInfo.sharedBy}
            </AlertDescription>
          </Alert>
        )}
        
        <EventPageClient 
          event={event} 
          eventId={eventId!} 
          registrationCount={registrationCount} 
          formattedDate={formattedDate}
          accessInfo={accessInfo}
        />
      </div>
    </div>
  );
}
