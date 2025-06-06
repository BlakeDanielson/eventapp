'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EventForm } from '@/components/event-form';
import { Event } from '@/types/event';
import { eventToFormData } from '@/types/forms';
import { Loader2, ArrowLeft, Edit3, Calendar, AlertCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Resend-inspired button component
interface ResendButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  asChild?: boolean;
}

function ResendButton({ children, variant = "primary", size = "md", className, onClick, disabled, type = "button", asChild }: ResendButtonProps) {
  const baseClasses = "relative overflow-hidden font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black";
  
  const variants = {
    primary: "bg-white text-black hover:bg-white/90 border border-transparent",
    secondary: "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.05]",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/[0.05] border border-transparent"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl"
  };

  if (asChild) {
    return (
      <span className={cn(baseClasses, variants[variant], sizes[size], className)}>
        {children}
      </span>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

export default function EditEventPage() {
  const params = useParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - please sign in');
        }
        throw new Error('Failed to load event');
      }
      
      const eventData = await response.json();
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch event if user is authenticated
    if (params.id && isLoaded && isSignedIn) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isLoaded, isSignedIn]);

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    try {
      setError(null);
      setUpdateSuccess(false);
      
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvent(updatedEvent);
      setUpdateSuccess(true);
      
      // Show success feedback
      console.log('Event updated successfully:', updatedEvent);
      
      // Hide success message and optionally redirect after a delay
      setTimeout(() => {
        setUpdateSuccess(false);
        // Uncomment to redirect: window.location.href = '/dashboard';
      }, 3000);
      
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error instanceof Error ? error.message : 'Failed to update event');
    }
  };

  // Authentication Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/20 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-white/60 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - this shouldn't happen with middleware, but good fallback
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-semibold text-white mb-3">Authentication Required</h1>
          <p className="text-white/60 mb-8 text-sm leading-relaxed">Please sign in to edit events.</p>
          <Link href="/sign-in">
            <ResendButton variant="primary" size="lg">
              Sign In
            </ResendButton>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="border-b border-white/[0.08] bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-white/10 rounded animate-pulse"></div>
                  <div className="w-32 h-6 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] mb-6">
              <Loader2 className="h-12 w-12 animate-spin text-white/40" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Loading event details...</h2>
            <p className="text-white/50">Please wait while we fetch your event information.</p>
          </motion.div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="border-b border-white/[0.08] bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-lg font-semibold text-white">Edit Event</h1>
                  <p className="text-sm text-white/50 mt-0.5">
                    Welcome back, {user?.firstName || 'Organizer'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <ResendButton variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </ResendButton>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex p-4 rounded-2xl border border-red-500/20 bg-red-500/10 mb-6">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/50 mb-8">{error}</p>
            
            <div className="flex items-center justify-center gap-4">
              <ResendButton onClick={fetchEvent} variant="primary">
                Try Again
              </ResendButton>
              <Link href="/dashboard">
                <ResendButton variant="secondary">
                  Back to Dashboard
                </ResendButton>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="border-b border-white/[0.08] bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-lg font-semibold text-white">Edit Event</h1>
                  <p className="text-sm text-white/50 mt-0.5">
                    Welcome back, {user?.firstName || 'Organizer'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <ResendButton variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </ResendButton>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] mb-6">
              <Calendar className="h-12 w-12 text-white/40" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Event Not Found</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
              The event you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
            </p>
            <Link href="/dashboard">
              <ResendButton variant="primary" size="lg">
                Back to Dashboard
              </ResendButton>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Resend-inspired header */}
      <header className="border-b border-white/[0.08] bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-lg font-semibold text-white">Edit Event</h1>
                <p className="text-sm text-white/50 mt-0.5">
                  Welcome back, {user?.firstName || 'Organizer'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <ResendButton variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </ResendButton>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] mb-6">
            <Edit3 className="h-8 w-8 text-white/70" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-2">Edit &quot;{event.title}&quot;</h2>
          <p className="text-white/50 max-w-md mx-auto leading-relaxed">
            Update your event details and save your changes to keep everything current.
          </p>
        </motion.div>

        {/* Event Form Container */}
        {/* Success Alert */}
        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-green-500/20 bg-green-500/10">
              <AlertDescription className="text-green-400">
                ✅ Event updated successfully! Your changes have been saved.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-sm"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none" />
          
          <div className="relative z-10 p-8">
            <EventForm 
              onSubmit={handleFormSubmit} 
              mode="edit"
              submitButtonText="Update Event"
              initialData={eventToFormData(event as unknown as Record<string, unknown>)}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
} 