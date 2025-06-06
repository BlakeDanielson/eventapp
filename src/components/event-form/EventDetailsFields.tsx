import { Control } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { List, HelpCircle } from 'lucide-react';
import { EventFormData } from '@/types/forms';

interface EventDetailsFieldsProps {
  control: Control<EventFormData>;
}

export function EventDetailsFields({ control }: EventDetailsFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Event Details
        </CardTitle>
        <CardDescription>
          Provide detailed information about what attendees can expect
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About This Event</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your event, what it's about, who should attend, and what value it provides..."
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                A compelling description helps potential attendees understand the value of your event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="agenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agenda</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Outline the event schedule, topics, speakers, or activities..."
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Help attendees know what to expect and plan their time accordingly
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="qa"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Q&A / Additional Information
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Answer common questions, provide additional details, requirements, or special instructions..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional: Address frequently asked questions or provide additional context
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 