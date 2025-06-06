'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, UserCheck, Users } from 'lucide-react';

interface PrivateEventAccessGateProps {
  eventId: string;
  eventTitle: string;
  inviteToken?: string; // From URL parameters
  onAccessGranted: (accessInfo: AccessInfo) => void;
}

interface AccessInfo {
  hasAccess: boolean;
  reason: 'invited' | 'shared_link' | 'public_event' | 'owner';
  inviteToken?: string;
  inviteeId?: string;
  sharedBy?: string;
  inviteeEmail?: string;
}

export function PrivateEventAccessGate({ 
  eventId, 
  eventTitle, 
  inviteToken,
  onAccessGranted 
}: PrivateEventAccessGateProps) {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAccess = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/verify-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          inviteToken: inviteToken
        }),
      });

      const data = await response.json();

      if (response.ok && data.hasAccess) {
        onAccessGranted({
          ...data,
          inviteeEmail: email.trim().toLowerCase()
        });
      } else if (response.status === 404) {
        setError('Event not found. Please check the link and try again.');
      } else {
        setError(data.message || 'You are not invited to this private event. Please contact the organizer for access.');
      }
    } catch (error) {
      console.error('Error verifying access:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyAccess();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Private Event Access</CardTitle>
          <CardDescription className="text-center">
            <span className="font-medium">{eventTitle}</span> is a private event.
            {inviteToken ? (
              <span className="block mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
                <UserCheck className="h-4 w-4" />
                You have an invite link! Enter your email to continue.
              </span>
            ) : (
              <span className="block mt-2">Enter your email address to verify your invitation.</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isVerifying}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={verifyAccess} 
            disabled={isVerifying || !email.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Access...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Verify Invitation
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Don&apos;t have an invitation?</p>
            <p>Contact the event organizer for access.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 