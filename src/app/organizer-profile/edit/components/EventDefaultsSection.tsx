"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface EventDefaultsSectionProps {
  formData: {
    defaultLocation: string;
    defaultAgenda: string;
    eventDisclaimer: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function EventDefaultsSection({ formData, onInputChange }: EventDefaultsSectionProps) {
  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event Defaults
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="defaultLocation" className="text-white">Default Event Location</Label>
          <Input
            id="defaultLocation"
            value={formData.defaultLocation}
            onChange={(e) => onInputChange('defaultLocation', e.target.value)}
            placeholder="Your usual event venue or location"
            className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
          />
          <p className="text-sm text-white/50">This will be pre-filled when creating new events</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultAgenda" className="text-white">Default Event Agenda</Label>
          <Textarea
            id="defaultAgenda"
            value={formData.defaultAgenda}
            onChange={(e) => onInputChange('defaultAgenda', e.target.value)}
            placeholder="Your standard event agenda or template..."
            className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
            rows={4}
          />
          <p className="text-sm text-white/50">Template agenda that will be pre-filled for new events</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventDisclaimer" className="text-white">Event Disclaimer</Label>
          <Textarea
            id="eventDisclaimer"
            value={formData.eventDisclaimer}
            onChange={(e) => onInputChange('eventDisclaimer', e.target.value)}
            placeholder="Standard disclaimer text for your events..."
            className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
            rows={3}
          />
          <p className="text-sm text-white/50">Legal disclaimer or terms that will appear on your events</p>
        </div>
      </CardContent>
    </Card>
  );
} 