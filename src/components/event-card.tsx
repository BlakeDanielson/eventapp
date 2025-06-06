'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, MapPin, Users, UserPlus, ExternalLink, Edit3, Copy, Trash2, Mail, ArrowUpRight } from 'lucide-react';
import { EventWithDetails } from '@/types/event';
import { getEventStatusColor, formatEventDate } from '@/lib/event-operations';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: EventWithDetails;
  onDelete: (eventId: string, eventTitle: string) => void;
  onClone: (eventId: string) => void;
}

function EventCardComponent({ event, onDelete, onClone }: EventCardProps) {
  const getEventStatus = (event: EventWithDetails) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    // Check database status first
    if (event.status === 'draft') {
      return { label: 'Draft', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', hoverColor: 'group-hover:text-yellow-600 group-hover:bg-yellow-400/20 group-hover:border-yellow-400/30' };
    }
    if (event.status === 'private') {
      return { label: 'Private', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', hoverColor: 'group-hover:text-purple-600 group-hover:bg-purple-400/20 group-hover:border-purple-400/30' };
    }
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', color: 'text-red-400 bg-red-400/10 border-red-400/20', hoverColor: 'group-hover:text-red-600 group-hover:bg-red-400/20 group-hover:border-red-400/30' };
    }
    
    // Then check date-based status for public events (including legacy 'published')
    if (event.status === 'public' || event.status === 'published') {
      if (eventDay.getTime() === today.getTime()) {
        return { label: 'Today', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', hoverColor: 'group-hover:text-orange-600 group-hover:bg-orange-400/20 group-hover:border-orange-400/30' };
      } else if (eventDate < now) {
        return { label: 'Past', color: 'text-white/40 bg-white/[0.05] border-white/[0.08]', hoverColor: 'group-hover:text-gray-600 group-hover:bg-gray-200/20 group-hover:border-gray-300/30' };
      } else {
        return { label: 'Upcoming', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', hoverColor: 'group-hover:text-emerald-600 group-hover:bg-emerald-400/20 group-hover:border-emerald-400/30' };
      }
    }
    
    // Default case
    return { label: 'Unknown', color: 'text-white/40 bg-white/[0.05] border-white/[0.08]', hoverColor: 'group-hover:text-gray-600 group-hover:bg-gray-200/20 group-hover:border-gray-300/30' };
  };

  const status = getEventStatus(event);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <Card className="relative overflow-hidden bg-black/40 border-white/[0.08] hover:border-white/20 hover:shadow-xl hover:shadow-white/[0.05] transition-all duration-300">
        {/* Subtle glow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Clickable overlay for entire card */}
        <Link href={`/event/${event.id}`} className="absolute inset-0 z-10" aria-label={`View ${event.title} details`}>
          <span className="sr-only">View event details</span>
        </Link>
        
        <CardHeader className="pb-4 relative z-10 pointer-events-none">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight text-white group-hover:text-white mb-3 line-clamp-2 transition-colors duration-300" title={event.title}>
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md border transition-all duration-300",
                  status.color
                )}>
                  {status.label}
                </div>
                {status.label === 'Today' && (
                  <div className="px-2 py-1 text-xs font-medium rounded-md bg-orange-400/10 text-orange-400 border border-orange-400/20 transition-all duration-300">
                    🔥 Live
                  </div>
                )}
              </div>
            </div>
            <div className="pointer-events-auto relative z-50" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/[0.05] transition-all duration-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-black border-white/[0.08]">
                <DropdownMenuItem asChild>
                  <Link href={`/event/${event.id}`} className="flex items-center gap-2 text-white hover:bg-white/[0.05]">
                    <ExternalLink className="h-4 w-4" />
                    View Event Page
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/edit-event/${event.id}`} className="flex items-center gap-2 text-white hover:bg-white/[0.05]">
                    <Edit3 className="h-4 w-4" />
                    Edit Event
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onClone(event.id)}
                  className="flex items-center gap-2 text-white hover:bg-white/[0.05]"
                >
                  <Copy className="h-4 w-4" />
                  Clone Event
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/event/${event.id}/attendees`} className="flex items-center gap-2 text-white hover:bg-white/[0.05]">
                    <Users className="h-4 w-4" />
                    Manage Attendees ({event._count.registrations + (event._count.invitees || 0)})
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(event.id, event.title)}
                  className="text-red-400 flex items-center gap-2 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4 relative z-10 pointer-events-none">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-white/70 group-hover:text-white/90 transition-colors duration-300">
              <div className="p-1.5 rounded-md bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-300">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>{formatEventDate(event.date.toString())} at {event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 group-hover:text-white/90 transition-colors duration-300">
              <div className="p-1.5 rounded-md bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-300">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <span className="truncate" title={event.location}>{event.location}</span>
            </div>
          </div>
          
          {event.bio && (
            <p className="text-sm text-white/60 group-hover:text-white/80 mt-4 line-clamp-2 leading-relaxed transition-colors duration-300" title={event.bio}>
              {event.bio}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-4 border-t border-white/[0.08] group-hover:border-white/[0.12] bg-white/[0.02] group-hover:bg-white/[0.04] relative z-10 pointer-events-none transition-all duration-300">
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-blue-300 transition-colors duration-300"></div>
                <span className="font-medium text-white group-hover:text-white transition-colors duration-300">{event._count.registrations}</span>
                <span className="text-white/50 group-hover:text-white/70 transition-colors duration-300">registered</span>
              </div>
              {event._count.referrals > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:bg-purple-300 transition-colors duration-300"></div>
                  <span className="font-medium text-white group-hover:text-white transition-colors duration-300">{event._count.referrals}</span>
                  <span className="text-white/50 group-hover:text-white/70 transition-colors duration-300">referrals</span>
                </div>
              )}
              {(event._count.invitees || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-emerald-300 transition-colors duration-300"></div>
                  <span className="font-medium text-white group-hover:text-white transition-colors duration-300">{event._count.invitees || 0}</span>
                  <span className="text-white/50 group-hover:text-white/70 transition-colors duration-300">invited</span>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const EventCard = memo(EventCardComponent);

// Custom comparison function for better memoization
EventCard.displayName = 'EventCard'; 