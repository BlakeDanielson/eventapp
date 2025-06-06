'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, MapPin, Users, UserPlus, ExternalLink, Edit3, Copy, Trash2, Mail } from 'lucide-react';
import { EventWithDetails } from '@/types/event';
import { getEventStatusColor, formatEventDate } from '@/lib/event-operations';

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
      return { label: 'Draft', variant: 'secondary' as const };
    }
    if (event.status === 'private') {
      return { label: 'Private', variant: 'outline' as const };
    }
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', variant: 'destructive' as const };
    }
    
    // Then check date-based status for public events (including legacy 'published')
    if (event.status === 'public' || event.status === 'published') {
      if (eventDay.getTime() === today.getTime()) {
        return { label: 'Today', variant: 'default' as const };
      } else if (eventDate < now) {
        return { label: 'Past', variant: 'outline' as const };
      } else {
        return { label: 'Upcoming', variant: 'default' as const };
      }
    }
    
    // Default case
    return { label: 'Unknown', variant: 'secondary' as const };
  };

  const status = getEventStatus(event);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight truncate" title={event.title}>
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant={event.status === 'cancelled' ? 'destructive' : event.status === 'draft' ? 'secondary' : 'default'} 
                className={`text-xs ${getEventStatusColor(event.status)}`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
              {status.label === 'Today' && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                  🔥 Happening Now
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/event/${event.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Event Page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/edit-event/${event.id}`} className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Event
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onClone(event.id)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Clone Event
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/event/${event.id}/attendees`} className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Attendees ({event._count.registrations + (event._count.invitees || 0)})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(event.id, event.title)}
                className="text-red-600 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{formatEventDate(event.date.toString())} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="truncate" title={event.location}>{event.location}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-3 line-clamp-2" title={event.bio}>
          {event.bio}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 border-t bg-gray-50">
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-blue-600">{event._count.registrations}</span>
              <span className="text-gray-500">registered</span>
            </div>
            {(event._count.invitees || 0) >= 0 && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-600">{event._count.invitees || 0}</span>
                <span className="text-gray-500">invited</span>
              </div>
            )}
            {event._count.referrals > 0 && (
              <div className="flex items-center gap-1">
                <UserPlus className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-purple-600">{event._count.referrals}</span>
                <span className="text-gray-500">referrals</span>
              </div>
            )}
          </div>
          <Link href={`/event/${event.id}`}>
            <Button variant="ghost" size="sm" className="h-auto p-1 text-blue-600 hover:text-blue-800">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const EventCard = memo(EventCardComponent);

// Custom comparison function for better memoization
EventCard.displayName = 'EventCard'; 