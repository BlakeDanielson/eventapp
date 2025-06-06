'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
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
  Search,
  Zap,
  Eye
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventOperations } from '@/hooks/useEventOperations';
import { getUserFriendlyMessage } from '@/lib/error-handling';
import { AceternityEventCard } from '@/components/aceternity-event-card';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardComparison } from '@/components/dashboard-comparison';
import { AnimatedBackground } from "@/components/ui/animated-background";
import { FloatingStatsCard } from "@/components/ui/floating-stats-card";
import { DashboardContent } from "./dashboard-content";

// Aceternity UI Components
import { CardContainer, CardBody, CardItem } from '@/components/ui/aceternity-card';
import { Spotlight } from '@/components/ui/spotlight';
import { GridBackground } from '@/components/ui/grid-background';

// Aceternity Stat Card Component
interface AceternityStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

function AceternityStatCard({ title, value, icon, description }: AceternityStatCardProps) {
  return (
    <CardContainer className="inter-var py-4">
      <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white mb-2"
        >
          {title}
        </CardItem>
        <CardItem
          as="div"
          translateZ="60"
          className="flex items-center gap-4 mb-4"
        >
          <div className="text-neutral-500 dark:text-neutral-300">
            {icon}
          </div>
          <span className="text-3xl font-bold text-neutral-900 dark:text-white">
            {value}
          </span>
        </CardItem>
        {description && (
          <CardItem
            translateZ="40"
            className="text-neutral-500 text-sm dark:text-neutral-300"
          >
            {description}
          </CardItem>
        )}
      </CardBody>
    </CardContainer>
  );
}

// Floating Action Button with 3D effect
interface FloatingButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

function FloatingButton({ children, href, onClick, className }: FloatingButtonProps) {
  const content = (
    <CardContainer className="inter-var py-2">
      <CardBody className="bg-gradient-to-br from-black to-neutral-800 relative group/card w-auto h-auto rounded-xl p-4 border border-white/[0.1] hover:shadow-2xl hover:shadow-purple-500/[0.1] transition-all duration-300">
        <CardItem
          translateZ="50"
          className="text-white font-medium flex items-center gap-2"
        >
          {children}
        </CardItem>
      </CardBody>
    </CardContainer>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}

// Component that uses useSearchParams and needs to be wrapped in Suspense
function AceternityDashboardContent() {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - this shouldn't happen with middleware, but good fallback
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="text-center z-10">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-neutral-400 mb-6">Please sign in to access your dashboard.</p>
          <Link href="/sign-in">
            <Button className="bg-white text-black hover:bg-neutral-200">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Enhanced Loading State with Aceternity styling
  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <GridBackground className="h-screen">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
          
          <header className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-white/[0.1] z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8 pt-24 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-8 bg-white/10 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-64 animate-pulse"></div>
              </div>
              <div className="h-10 bg-white/10 rounded w-32 animate-pulse"></div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-white/10 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </GridBackground>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <GridBackground className="h-full min-h-screen">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        
        <header className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-white/[0.1] z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-neutral-400 mt-1">
                  Welcome back, {user?.firstName || 'Organizer'}! Manage your events and track registrations
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/organizer-profile">
                  <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 pt-24 relative z-10">
          {/* Stats Cards */}
          {events.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <AceternityStatCard 
                title="Total Events" 
                value={eventStats.totalEvents} 
                icon={<Calendar className="h-6 w-6 text-blue-400" />}
                description="All your events"
              />
              <AceternityStatCard 
                title="Total Registrations" 
                value={eventStats.totalRegistrations} 
                icon={<Users className="h-6 w-6 text-emerald-400" />}
                description="People registered"
              />
              <AceternityStatCard 
                title="Total Referrals" 
                value={eventStats.totalReferrals} 
                icon={<Share2 className="h-6 w-6 text-purple-400" />}
                description="Referrals earned"
              />
              <AceternityStatCard 
                title="Upcoming Events" 
                value={eventStats.upcomingEvents} 
                icon={<TrendingUp className="h-6 w-6 text-orange-400" />}
                description="Future events"
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
              <Alert className="mb-6 border-green-400/20 bg-green-900/20 text-green-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
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
              <h2 className="text-3xl font-bold text-white">My Events</h2>
              <p className="text-neutral-400 mt-1">
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
                <SelectTrigger className="w-40 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <Filter className="h-4 w-4 mr-2 text-neutral-400" />
                  <SelectValue placeholder="Filter events" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
              
              <FloatingButton href="/create-event">
                <Plus className="h-4 w-4" />
                Create Event
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-70" />
              </FloatingButton>
            </motion.div>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6 border-red-400/20 bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="flex items-center justify-between text-red-300">
                <span>{error ? getUserFriendlyMessage(error) : 'An error occurred'}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchEvents}
                  className="ml-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
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
              <CardContainer className="inter-var">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-16 border">
                  <CardItem translateZ="50" className="flex flex-col items-center justify-center">
                    <div className="bg-white/10 rounded-full p-4 mb-4">
                      <Calendar className="h-12 w-12 text-white/70" />
                    </div>
                    <CardItem translateZ="60" className="text-xl font-semibold text-white mb-2">
                      No events yet
                    </CardItem>
                    <CardItem translateZ="40" className="text-neutral-400 mb-6 text-center max-w-md">
                      Get started by creating your first event. You can invite attendees, track registrations, and manage everything from here.
                    </CardItem>
                    <FloatingButton href="/create-event">
                      <Plus className="h-4 w-4" />
                      Create Your First Event
                    </FloatingButton>
                  </CardItem>
                </CardBody>
              </CardContainer>
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
                  <AceternityEventCard
                    event={event}
                    onDelete={handleDeleteEvent}
                    onClone={handleCloneEvent}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </GridBackground>
      <DashboardComparison />
    </div>
  );
}

// Main component with Suspense boundary
export default function AceternityDashboard() {
  return (
    <AnimatedBackground className="min-h-screen">
      <div className="relative z-10 min-h-screen">
        {/* Floating Navigation Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 shadow-2xl">
            <div className="flex items-center gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-white font-bold text-xl neon-flicker"
              >
                <Zap className="w-6 h-6 inline mr-2 text-cyan-400" />
                EventMaster
              </motion.div>
              
              <nav className="flex items-center gap-6">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer"
                >
                  Dashboard
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer"
                >
                  Analytics
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer"
                >
                  Settings
                </motion.div>
              </nav>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="pt-32 pb-20 px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center space-y-6 mb-16"
            >
              <motion.h1
                className="text-6xl font-bold text-white neon-flicker"
                style={{
                  background: "linear-gradient(45deg, #00f5ff, #ff00ff, #00ff00)",
                  backgroundSize: "200% 200%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "holographic 3s ease-in-out infinite"
                }}
              >
                Welcome to the Future
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                Experience event management in a whole new dimension
              </motion.p>
            </motion.div>

            {/* Stats Cards - Floating Grid */}
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800/20 rounded-2xl animate-pulse" />
              ))}
            </div>}>
              <DashboardStatsCards />
            </Suspense>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center gap-6 mb-16"
            >
              <Link href="/create-event">
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl border border-white/20 backdrop-blur-lg flex items-center gap-3 shadow-2xl">
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Create Event</span>
                  </div>
                </motion.div>
              </Link>

              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: -5,
                  boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl border border-white/20 backdrop-blur-lg flex items-center gap-3 shadow-2xl">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">View Analytics</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Events Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-8"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-white">
                    Your Events
                  </h2>
                  <p className="text-gray-400">Manage your cosmic experiences</p>
                </div>

                {/* Floating Controls */}
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl blur-lg opacity-50" />
                    <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="bg-transparent text-white placeholder-gray-400 border-none outline-none w-40"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-black/40 backdrop-blur-lg border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors duration-300"
                  >
                    <Filter className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </div>

              {/* Events Grid */}
                             <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="h-80 bg-gray-800/20 rounded-3xl animate-pulse" />
                 ))}
               </div>}>
                 <DashboardContent />
               </Suspense>
            </motion.div>
          </div>
        </main>

        {/* Floating Comparison Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link href="/dashboard">
            <motion.div
              whileHover={{ 
                scale: 1.1, 
                rotateZ: 5,
                boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)"
              }}
              whileTap={{ scale: 0.9 }}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full border border-white/20 backdrop-blur-lg shadow-2xl">
                <Eye className="w-6 h-6" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}

// Stats Cards Component
function DashboardStatsCards() {
  const stats = [
    {
      title: "Total Events",
      value: "14",
      description: "All your events",
      icon: <Calendar className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
      delay: 0.2
    },
    {
      title: "Total Registrations", 
      value: "1",
      description: "People registered",
      icon: <Users className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
      delay: 0.3
    },
    {
      title: "Total Referrals",
      value: "0", 
      description: "Referrals earned",
      icon: <Share2 className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      delay: 0.4
    },
    {
      title: "Upcoming Events",
      value: "2",
      description: "Future events", 
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-orange-500 to-red-500", 
      delay: 0.5
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <FloatingStatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          gradient={stat.gradient}
          delay={stat.delay}
        />
      ))}
    </div>
  );
} 