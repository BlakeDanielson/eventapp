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
      return { label: 'Draft', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    }
    if (event.status === 'private') {
      return { label: 'Private', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' };
    }
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
    }
    
    // Then check date-based status for public events (including legacy 'published')
    if (event.status === 'public' || event.status === 'published') {
      if (eventDay.getTime() === today.getTime()) {
        return { label: 'Today', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' };
      } else if (eventDate < now) {
        return { label: 'Past', color: 'text-white/40 bg-white/[0.05] border-white/[0.08]' };
      } else {
        return { label: 'Upcoming', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
      }
    }
    
    // Default case
    return { label: 'Unknown', color: 'text-white/40 bg-white/[0.05] border-white/[0.08]' };
  };

  const status = getEventStatus(event);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="bg-black/40 border-white/[0.08] hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight text-white mb-3 line-clamp-2" title={event.title}>
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md border",
                  status.color
                )}>
                  {status.label}
                </div>
                {status.label === 'Today' && (
                  <div className="px-2 py-1 text-xs font-medium rounded-md bg-orange-400/10 text-orange-400 border border-orange-400/20">
                    🔥 Live
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/[0.05]">
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
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-white/70">
              <div className="p-1.5 rounded-md bg-white/[0.05] border border-white/[0.08]">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>{formatEventDate(event.date.toString())} at {event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="p-1.5 rounded-md bg-white/[0.05] border border-white/[0.08]">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <span className="truncate" title={event.location}>{event.location}</span>
            </div>
          </div>
          
          {event.bio && (
            <p className="text-sm text-white/60 mt-4 line-clamp-2 leading-relaxed" title={event.bio}>
              {event.bio}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-4 border-t border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="font-medium text-white">{event._count.registrations}</span>
                <span className="text-white/50">registered</span>
              </div>
              {(event._count.invitees || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="font-medium text-white">{event._count.invitees || 0}</span>
                  <span className="text-white/50">invited</span>
                </div>
              )}
              {event._count.referrals > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="font-medium text-white">{event._count.referrals}</span>
                  <span className="text-white/50">referrals</span>
                </div>
              )}
            </div>
            <Link href={`/event/${event.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-2 text-white/70 hover:text-white hover:bg-white/[0.05] group/btn"
              >
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </Button>
            </Link>
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