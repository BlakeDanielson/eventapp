'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, MapPin, Users, UserPlus, ExternalLink, Edit3, Copy, Trash2, Mail, Clock } from 'lucide-react';
import { EventWithDetails } from '@/types/event';
import { getEventStatusColor, formatEventDate } from '@/lib/event-operations';
import { CardContainer, CardBody, CardItem } from '@/components/ui/aceternity-card';
import { motion } from 'framer-motion';

interface AceternityEventCardProps {
  event: EventWithDetails;
  onDelete: (eventId: string, eventTitle: string) => void;
  onClone: (eventId: string) => void;
}

function AceternityEventCardComponent({ event, onDelete, onClone }: AceternityEventCardProps) {
  const getEventStatus = (event: EventWithDetails) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    // Check database status first
    if (event.status === 'draft') {
      return { label: 'Draft', variant: 'secondary' as const, color: 'yellow' };
    }
    if (event.status === 'private') {
      return { label: 'Private', variant: 'outline' as const, color: 'purple' };
    }
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', variant: 'destructive' as const, color: 'red' };
    }
    
    // Then check date-based status for public events (including legacy 'published')
    if (event.status === 'public' || event.status === 'published') {
      if (eventDay.getTime() === today.getTime()) {
        return { label: 'Today', variant: 'default' as const, color: 'green' };
      } else if (eventDate < now) {
        return { label: 'Past', variant: 'outline' as const, color: 'gray' };
      } else {
        return { label: 'Upcoming', variant: 'default' as const, color: 'blue' };
      }
    }
    
    // Default case
    return { label: 'Unknown', variant: 'secondary' as const, color: 'gray' };
  };

  const status = getEventStatus(event);

  const getStatusGlow = (color: string) => {
    const glows = {
      yellow: 'shadow-yellow-500/20',
      purple: 'shadow-purple-500/20',
      red: 'shadow-red-500/20',
      green: 'shadow-green-500/20',
      blue: 'shadow-blue-500/20',
      gray: 'shadow-gray-500/20'
    };
    return glows[color as keyof typeof glows] || 'shadow-gray-500/20';
  };

  const getStatusBorder = (color: string) => {
    const borders = {
      yellow: 'border-l-yellow-500',
      purple: 'border-l-purple-500',
      red: 'border-l-red-500',
      green: 'border-l-green-500',
      blue: 'border-l-blue-500',
      gray: 'border-l-gray-500'
    };
    return borders[color as keyof typeof borders] || 'border-l-gray-500';
  };

  return (
    <CardContainer className="inter-var py-2 h-full">
      <CardBody 
        className={`bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black/40 dark:border-white/[0.1] border-black/[0.1] w-full h-full rounded-xl p-0 border backdrop-blur-sm border-l-4 ${getStatusBorder(status.color)} ${getStatusGlow(status.color)}`}
      >
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardItem
                translateZ="50"
                className="text-lg font-bold text-neutral-600 dark:text-white leading-tight truncate mb-2"
                title={event.title}
              >
                {event.title}
              </CardItem>
              <CardItem
                translateZ="40"
                className="flex items-center gap-2"
              >
                <Badge 
                  variant={status.variant}
                  className={`text-xs bg-white/10 border-white/20 text-white`}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
                {status.label === 'Today' && (
                  <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    🔥 Happening Now
                  </Badge>
                )}
              </CardItem>
            </div>
            <CardItem translateZ="60">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black/90 border-white/20 text-white">
                  <DropdownMenuItem asChild>
                    <Link href={`/event/${event.id}`} className="flex items-center gap-2 hover:bg-white/10">
                      <ExternalLink className="h-4 w-4" />
                      View Event Page
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/edit-event/${event.id}`} className="flex items-center gap-2 hover:bg-white/10">
                      <Edit3 className="h-4 w-4" />
                      Edit Event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onClone(event.id)}
                    className="flex items-center gap-2 hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                    Clone Event
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/event/${event.id}/attendees`} className="flex items-center gap-2 hover:bg-white/10">
                      <Users className="h-4 w-4" />
                      Manage Attendees ({event._count.registrations + (event._count.invitees || 0)})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(event.id, event.title)}
                    className="text-red-400 flex items-center gap-2 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardItem>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 pb-2">
          <CardItem translateZ="30" className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-neutral-400">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>{formatEventDate(event.date.toString())} at {event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span className="truncate" title={event.location}>{event.location}</span>
            </div>
          </CardItem>
          
          <CardItem 
            translateZ="20" 
            className="text-sm text-neutral-400 mt-3 line-clamp-2" 
            title={event.bio}
          >
            {event.bio}
          </CardItem>
        </div>
        
        {/* Footer */}
        <CardItem translateZ="10" className="p-4 pt-2 border-t border-white/10 bg-white/5 rounded-b-xl">
          <div className="flex items-center justify-between w-full text-sm">
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Users className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-blue-400">{event._count.registrations}</span>
                <span className="text-neutral-400">registered</span>
              </motion.div>
              {(event._count.invitees || 0) >= 0 && (
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Mail className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">{event._count.invitees || 0}</span>
                  <span className="text-neutral-400">invited</span>
                </motion.div>
              )}
              {event._count.referrals > 0 && (
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <UserPlus className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold text-purple-400">{event._count.referrals}</span>
                  <span className="text-neutral-400">referrals</span>
                </motion.div>
              )}
            </div>
            <Link href={`/event/${event.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const AceternityEventCard = memo(AceternityEventCardComponent);

// Custom comparison function for better memoization
AceternityEventCard.displayName = 'AceternityEventCard'; 