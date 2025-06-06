'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { 
  Calendar, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Filter, 
  CheckCircle, 
  User,
  TrendingUp,
  Users,
  Share2,
  ArrowUpRight,
  BarChart3,
  Eye,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventOperations } from '@/hooks/useEventOperations';
import { getUserFriendlyMessage } from '@/lib/error-handling';
import { EventCard } from '@/components/event-card';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DashboardComparison } from '@/components/dashboard-comparison';

// Resend-inspired minimal stat card
interface ResendStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function ResendStatCard({ title, value, icon, trend }: ResendStatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 hover:border-white/[0.12] transition-all duration-300"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] transition-colors duration-300">
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              <TrendingUp className={cn("h-3 w-3", !trend.isPositive && "rotate-180")} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/60">{title}</p>
          <p className="text-2xl font-semibold text-white">{value.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Resend-inspired button
interface ResendButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

function ResendButton({ children, variant = "primary", size = "md", className, onClick, disabled, type = "button" }: ResendButtonProps) {
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

// Component that uses useSearchParams and needs to be wrapped in Suspense
function DashboardContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const {
    events,
    loading,
    error,
    fetchEvents,
    deleteExistingEvent,
    cloneExistingEvent,
    filterEvents,
  } = useEventOperations();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success parameters from event creation
  useEffect(() => {
    const createdEventId = searchParams.get('created');
    const createdEventTitle = searchParams.get('title');
    
    if (createdEventId && createdEventTitle) {
      setSuccessMessage(`Successfully created "${decodeURIComponent(createdEventTitle)}"!`);
      setShowSuccessMessage(true);
      
      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only fetch events if user is authenticated
    if (isLoaded && isSignedIn) {
      fetchEvents();
    }
  }, [fetchEvents, isLoaded, isSignedIn]);

  const handleDeleteEvent = useCallback(async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This will also delete all registrations and cannot be undone.`)) {
      return;
    }

    const success = await deleteExistingEvent(eventId);
    if (!success) {
      alert('Failed to delete event. Please try again.');
    }
  }, [deleteExistingEvent]);

  const handleCloneEvent = useCallback(async (eventId: string) => {
    const clonedEvent = await cloneExistingEvent(eventId);
    if (clonedEvent) {
      // Redirect to edit the cloned event
      window.location.href = `/edit-event/${clonedEvent.id}`;
    } else {
      alert('Failed to clone event. Please try again.');
    }
  }, [cloneExistingEvent]);

  // Filter events based on status using our custom hook with memoization
  const filteredEvents = useMemo(() => {
    return statusFilter === 'all' ? events : filterEvents(statusFilter as 'public' | 'draft' | 'cancelled');
  }, [events, statusFilter, filterEvents]);

  // Memoize expensive calculations for quick stats
  const eventStats = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = events.reduce((sum, event) => sum + event._count.registrations, 0);
    const totalReferrals = events.reduce((sum, event) => sum + event._count.referrals, 0);
    
    // Calculate upcoming events (public events with future dates)
    const now = new Date();
    const upcomingEvents = events.filter(event => {
      if (event.status !== 'public') return false;
      const eventDate = new Date(event.date);
      return eventDate > now;
    }).length;

    return {
      totalEvents,
      totalRegistrations, 
      totalReferrals,
      upcomingEvents,
    };
  }, [events]);

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
          <p className="text-white/60 mb-8 text-sm leading-relaxed">Please sign in to access your dashboard.</p>
          <Link href="/sign-in">
            <ResendButton variant="primary" size="lg">
              Sign In
            </ResendButton>
          </Link>
        </div>
      </div>
    );
  }

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="border-b border-white/[0.08] bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-32 h-6 bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Loading skeleton */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="w-48 h-8 bg-white/10 rounded animate-pulse"></div>
              <div className="w-64 h-4 bg-white/10 rounded animate-pulse"></div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white/[0.03] border border-white/[0.08] rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
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
                <h1 className="text-lg font-semibold text-white">Dashboard</h1>
                <p className="text-sm text-white/50 mt-0.5">
                  Welcome back, {user?.firstName || 'Organizer'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/organizer-profile">
                <ResendButton variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  Profile
                </ResendButton>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards - Resend style */}
        {events.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <ResendStatCard 
              title="Total Events" 
              value={eventStats.totalEvents} 
              icon={<Calendar className="h-5 w-5 text-white/70" />}
              trend={{ value: 12, isPositive: true }}
            />
            <ResendStatCard 
              title="Registrations" 
              value={eventStats.totalRegistrations} 
              icon={<Users className="h-5 w-5 text-white/70" />}
              trend={{ value: 8, isPositive: true }}
            />
            <ResendStatCard 
              title="Referrals" 
              value={eventStats.totalReferrals} 
              icon={<Share2 className="h-5 w-5 text-white/70" />}
              trend={{ value: 24, isPositive: true }}
            />
            <ResendStatCard 
              title="Upcoming" 
              value={eventStats.upcomingEvents} 
              icon={<TrendingUp className="h-5 w-5 text-white/70" />}
            />
          </motion.div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-400 font-medium">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header with Create Event button - Resend style */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-semibold text-white mb-2">Events</h2>
            <p className="text-white/50">
              {filteredEvents.length !== events.length 
                ? `Showing ${filteredEvents.length} of ${events.length} events`
                : events.length > 0 
                  ? `${events.length} event${events.length !== 1 ? 's' : ''} total`
                  : 'Create your first event to get started'
              }
            </p>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Status Filter - Resend style */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-black/40 border-white/[0.08] text-white hover:border-white/[0.12] focus:border-white/20 focus:ring-white/10">
                <Filter className="h-4 w-4 mr-2 text-white/50" />
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/[0.08]">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
            
            <Link href="/create-event">
              <ResendButton variant="primary" size="lg">
                <Plus className="h-4 w-4" />
                Create Event
              </ResendButton>
            </Link>
          </motion.div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400">{error ? getUserFriendlyMessage(error) : 'An error occurred'}</span>
              </div>
              <ResendButton 
                variant="secondary" 
                size="sm" 
                onClick={fetchEvents}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </ResendButton>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center py-24 px-6">
              <div className="inline-flex p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] mb-6">
                <Calendar className="h-12 w-12 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No events yet</h3>
              <p className="text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
                Get started by creating your first event. You can invite attendees, track registrations, and manage everything from here.
              </p>
              <Link href="/create-event">
                <ResendButton variant="primary" size="lg">
                  <Plus className="h-4 w-4" />
                  Create Your First Event
                </ResendButton>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <EventCard
                  event={event}
                  onDelete={handleDeleteEvent}
                  onClone={handleCloneEvent}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
      <DashboardComparison />
    </div>
  );
}

// Main component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/20 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-white/60 mt-4 text-sm">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
