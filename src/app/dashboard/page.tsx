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
  ArrowUpRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventOperations } from '@/hooks/useEventOperations';
import { getUserFriendlyMessage } from '@/lib/error-handling';
import { EventCard } from '@/components/event-card';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animated Gradient Component
interface AnimatedGradientProps {
  colors: string[];
  blur?: "light" | "medium" | "heavy";
}

function AnimatedGradient({ colors, blur = "medium" }: AnimatedGradientProps) {
  const blurClass = blur === "light" ? "blur-2xl" : blur === "medium" ? "blur-3xl" : "blur-[100px]";
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={cn(`absolute inset-0`, blurClass)}>
        {colors.map((color: string, index: number) => (
          <div
            key={index}
            className="absolute animate-background-gradient opacity-30 dark:opacity-[0.15]"
            style={{
              top: `${Math.random() * 50}%`,
              left: `${Math.random() * 50}%`,
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colors: string[];
}

function StatCard({ title, value, icon, colors }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-background/50 backdrop-blur-sm">
      <AnimatedGradient colors={colors} />
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Button with gradient effect
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

function GradientButton({ children, className, ...props }: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden group",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 group-hover:opacity-80 blur transition-opacity duration-500" />
      <div className="relative flex items-center justify-center gap-2">
        {children}
      </div>
    </Button>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - this shouldn't happen with middleware, but good fallback
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your dashboard.</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {user?.firstName || 'Organizer'}! Manage your events and track registrations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/organizer-profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {events.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <StatCard 
              title="Total Events" 
              value={eventStats.totalEvents} 
              icon={<Calendar className="h-5 w-5 text-blue-500" />}
              colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
            />
            <StatCard 
              title="Total Registrations" 
              value={eventStats.totalRegistrations} 
              icon={<Users className="h-5 w-5 text-emerald-500" />}
              colors={["#10B981", "#34D399", "#6EE7B7"]}
            />
            <StatCard 
              title="Total Referrals" 
              value={eventStats.totalReferrals} 
              icon={<Share2 className="h-5 w-5 text-purple-500" />}
              colors={["#8B5CF6", "#A78BFA", "#C4B5FD"]}
            />
            <StatCard 
              title="Upcoming Events" 
              value={eventStats.upcomingEvents} 
              icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
              colors={["#F59E0B", "#FBBF24", "#FCD34D"]}
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
          >
            <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/30">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                {successMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Header with Create Event button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-foreground">My Events</h2>
            <p className="text-muted-foreground mt-1">
              {filteredEvents.length !== events.length 
                ? `Showing ${filteredEvents.length} of ${events.length} events`
                : events.length > 0 
                  ? `Manage your ${events.length} event${events.length !== 1 ? 's' : ''}`
                  : 'Create your first event to get started'
              }
            </p>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-background/50 backdrop-blur-sm border-border/50">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
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
              <GradientButton size="lg" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-70" />
              </GradientButton>
            </Link>
          </motion.div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error ? getUserFriendlyMessage(error) : 'An error occurred'}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchEvents}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-dashed border-border/70 bg-background/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <Calendar className="h-12 w-12 text-primary/70" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Get started by creating your first event. You can invite attendees, track registrations, and manage everything from here.
                </p>
                <Link href="/create-event">
                  <GradientButton size="lg" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Event
                  </GradientButton>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
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
    </div>
  );
}

// Main component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
