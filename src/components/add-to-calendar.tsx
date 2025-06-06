'use client';

import { Button } from '@/components/ui/button';

interface AddToCalendarProps {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export function AddToCalendar({
  title,
  date,
  time,
  location,
  description,
}: AddToCalendarProps) {
  const handleClick = () => {
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const googleCalendarUrl = new URL(
      'https://www.google.com/calendar/render'
    );
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', title);
    googleCalendarUrl.searchParams.append(
      'dates',
      `${startTime.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endTime
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, '')}`
    );
    googleCalendarUrl.searchParams.append('details', description);
    googleCalendarUrl.searchParams.append('location', location);

    window.open(googleCalendarUrl.toString(), '_blank');
  };

  return <Button onClick={handleClick}>Add to Google Calendar</Button>;
}
