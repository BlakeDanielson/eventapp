export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  id?: string;
}

export class CalendarUtils {
  /**
   * Formats a date for ICS file format (YYYYMMDDTHHMMSSZ)
   */
  static formatICSDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date for ICS formatting:', date);
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Formats a date for Google Calendar (YYYYMMDDTHHMMSSZ)
   */
  static formatGoogleDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date for Google formatting:', date);
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Formats a date for Yahoo Calendar (YYYYMMDDTHHMMSS)
   */
  static formatYahooDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date for Yahoo formatting:', date);
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0];
  }

  /**
   * Cleans text for ICS format by escaping special characters
   */
  static cleanForICS(text: string): string {
    return text
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\\/g, '\\\\');
  }

  /**
   * Generates ICS file content for an event
   */
  static generateICS(event: CalendarEvent): string {
    const startFormatted = this.formatICSDate(event.start);
    const endFormatted = this.formatICSDate(event.end);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventApp//EventApp//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id || Date.now()}@eventapp.com
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:${this.cleanForICS(event.title)}
DESCRIPTION:${this.cleanForICS(event.description)}
LOCATION:${this.cleanForICS(event.location)}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Event reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
    
    return icsContent;
  }

  /**
   * Downloads an ICS file for the given event
   */
  static downloadICS(event: CalendarEvent): void {
    const icsContent = this.generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * Generates Google Calendar URL
   */
  static getGoogleCalendarUrl(event: CalendarEvent): string {
    const startFormatted = this.formatGoogleDate(event.start);
    const endFormatted = this.formatGoogleDate(event.end);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startFormatted}/${endFormatted}`,
      details: event.description,
      location: event.location,
      trp: 'false',
      sprop: 'website:EventApp'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Generates Outlook Web URL
   */
  static getOutlookWebUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.start.toISOString(),
      enddt: event.end.toISOString(),
      body: event.description,
      location: event.location,
      path: '/calendar/action/compose'
    });
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  /**
   * Generates Yahoo Calendar URL
   */
  static getYahooCalendarUrl(event: CalendarEvent): string {
    const startFormatted = this.formatYahooDate(event.start);
    const endFormatted = this.formatYahooDate(event.end);
    
    const params = new URLSearchParams({
      v: '60',
      title: event.title,
      st: startFormatted,
      et: endFormatted,
      desc: event.description,
      in_loc: event.location
    });
    
    return `https://calendar.yahoo.com/?${params.toString()}`;
  }

  /**
   * Parses event time string and creates start/end dates
   */
  static parseEventDateTime(date: Date, timeString: string, durationHours: number = 2): { start: Date; end: Date } {
    // Validate input date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      console.error('Invalid event date:', date);
      // Return current date as fallback
      const fallbackDate = new Date();
      return {
        start: fallbackDate,
        end: new Date(fallbackDate.getTime() + durationHours * 60 * 60 * 1000)
      };
    }
    
    // Validate and parse time string
    if (!timeString || typeof timeString !== 'string') {
      console.error('Invalid time string:', timeString);
      // Use current time as fallback
      const now = new Date();
      const fallbackStart = new Date(eventDate);
      fallbackStart.setHours(now.getHours(), now.getMinutes(), 0, 0);
      const fallbackEnd = new Date(fallbackStart.getTime() + durationHours * 60 * 60 * 1000);
      return { start: fallbackStart, end: fallbackEnd };
    }
    
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) {
      console.error('Invalid time format:', timeString);
      // Use noon as fallback
      const fallbackStart = new Date(eventDate);
      fallbackStart.setHours(12, 0, 0, 0);
      const fallbackEnd = new Date(fallbackStart.getTime() + durationHours * 60 * 60 * 1000);
      return { start: fallbackStart, end: fallbackEnd };
    }
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error('Invalid time values:', { hours, minutes, timeString });
      // Use noon as fallback
      const fallbackStart = new Date(eventDate);
      fallbackStart.setHours(12, 0, 0, 0);
      const fallbackEnd = new Date(fallbackStart.getTime() + durationHours * 60 * 60 * 1000);
      return { start: fallbackStart, end: fallbackEnd };
    }
    
    // Set the time on the event date
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    // Validate the resulting date
    if (isNaN(startDateTime.getTime())) {
      console.error('Invalid start date created:', startDateTime);
      const fallbackStart = new Date(eventDate);
      fallbackStart.setHours(12, 0, 0, 0);
      const fallbackEnd = new Date(fallbackStart.getTime() + durationHours * 60 * 60 * 1000);
      return { start: fallbackStart, end: fallbackEnd };
    }
    
    // Add duration to get end time
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);
    
    return {
      start: startDateTime,
      end: endDateTime
    };
  }
}

/**
 * Hook for calendar operations in React components
 */
export function useCalendarActions(event: CalendarEvent) {
  const downloadICS = () => CalendarUtils.downloadICS(event);
  
  const openGoogleCalendar = () => {
    window.open(CalendarUtils.getGoogleCalendarUrl(event), '_blank');
  };
  
  const openOutlookWeb = () => {
    window.open(CalendarUtils.getOutlookWebUrl(event), '_blank');
  };
  
  const openYahooCalendar = () => {
    window.open(CalendarUtils.getYahooCalendarUrl(event), '_blank');
  };
  
  return {
    downloadICS,
    openGoogleCalendar,
    openOutlookWeb,
    openYahooCalendar,
    googleUrl: CalendarUtils.getGoogleCalendarUrl(event),
    outlookUrl: CalendarUtils.getOutlookWebUrl(event),
    yahooUrl: CalendarUtils.getYahooCalendarUrl(event)
  };
} 