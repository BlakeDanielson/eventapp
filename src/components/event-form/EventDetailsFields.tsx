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
import { FileText, Calendar, HelpCircle, Image } from 'lucide-react';
import { ImageUpload } from '../image-upload';
import { EventFormData } from '@/types/forms';

interface EventDetailsFieldsProps {
  control: Control<EventFormData>;
}

export function EventDetailsFields({ control }: EventDetailsFieldsProps) {
  return (
    <Card className="border-zinc-800 bg-black rounded-lg shadow-none">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-white">
              Event Details
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Tell your audience what makes this event special
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium text-white">
                About This Event
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your event, what it's about, who should attend, and what value it provides..."
                  className="min-h-[140px] bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg resize-none text-white placeholder:text-zinc-500"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-zinc-500">
                A compelling description helps potential attendees understand the value of your event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="image"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-base font-medium text-white">
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Image className="h-4 w-4 text-zinc-400" />
                </div>
                Event Image
              </FormLabel>
              <FormControl>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                  <ImageUpload />
                </div>
              </FormControl>
              <FormDescription className="text-sm text-zinc-500">
                Upload a compelling image to make your event page stand out and attract more attendees
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="agenda"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-base font-medium text-white">
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                </div>
                Event Agenda
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Outline the event schedule, topics, speakers, or activities..."
                  className="min-h-[140px] bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg resize-none text-white placeholder:text-zinc-500"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-zinc-500">
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
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-base font-medium text-white">
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-zinc-400" />
                </div>
                Q&A & Additional Information
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Answer common questions, provide additional details, requirements, or special instructions..."
                  className="min-h-[120px] bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg resize-none text-white placeholder:text-zinc-500"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-zinc-500">
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