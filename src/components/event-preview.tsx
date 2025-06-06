'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Event, EventWithDetails } from '@/types/event';

interface EventPreviewProps {
  event: Event | EventWithDetails;
}

export function EventPreview({ event }: EventPreviewProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>
          {formatDate(event.date)} at {event.time}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Location</h3>
          <p>{event.location}</p>
        </div>
        <div>
          <h3 className="font-semibold">About this event</h3>
          <p className="whitespace-pre-wrap">{event.bio}</p>
        </div>
        <div>
          <h3 className="font-semibold">Agenda</h3>
          <p className="whitespace-pre-wrap">{event.agenda}</p>
        </div>
        {event.qa && (
          <div>
            <h3 className="font-semibold">Q&A</h3>
            <p className="whitespace-pre-wrap">{event.qa}</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold">Registrations</h3>
          <p>{('_count' in event ? event._count?.registrations : 0) || 0} people registered</p>
        </div>
      </CardContent>
    </Card>
  );
}
