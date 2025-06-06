'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { Event } from '@/types/event';
import { CalendarUtils } from '@/lib/calendar-utils';
import { useMemo } from 'react';

interface CalendarActionsProps {
  event: Event;
  className?: string;
}

export function CalendarActions({ event, className }: CalendarActionsProps) {
  // Convert Event to CalendarEvent format
  const calendarEvent = useMemo(() => {
    const { start, end } = CalendarUtils.parseEventDateTime(event.date, event.time);
    
    return {
      id: event.id,
      title: event.title,
      description: event.bio,
      location: event.location,
      start,
      end
    };
  }, [event]);

  // Generate calendar URLs
  const urls = useMemo(() => ({
    google: CalendarUtils.getGoogleCalendarUrl(calendarEvent),
    outlook: CalendarUtils.getOutlookWebUrl(calendarEvent),
    yahoo: CalendarUtils.getYahooCalendarUrl(calendarEvent)
  }), [calendarEvent]);

  const handleDownloadICS = () => {
    CalendarUtils.downloadICS(calendarEvent);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white ${className}`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-black/95 border-white/[0.08] backdrop-blur-xl"
      >
        <DropdownMenuItem 
          onClick={() => window.open(urls.google, '_blank')}
          className="text-white hover:bg-white/[0.05] cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-2 text-blue-400" />
          Google Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => window.open(urls.outlook, '_blank')}
          className="text-white hover:bg-white/[0.05] cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-2 text-orange-400" />
          Outlook Web
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => window.open(urls.yahoo, '_blank')}
          className="text-white hover:bg-white/[0.05] cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-2 text-purple-400" />
          Yahoo Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDownloadICS}
          className="text-white hover:bg-white/[0.05] cursor-pointer"
        >
          <Download className="h-4 w-4 mr-2 text-emerald-400" />
          Download .ics file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 