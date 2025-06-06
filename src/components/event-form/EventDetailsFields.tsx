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
import { FileText, Calendar, HelpCircle } from 'lucide-react';
import { EventFormData } from '@/types/forms';

interface EventDetailsFieldsProps {
  control: Control<EventFormData>;
}

export function EventDetailsFields({ control }: EventDetailsFieldsProps) {
  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Event Details
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
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
              <FormLabel className="text-base font-medium text-gray-900">
                About This Event
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your event, what it's about, who should attend, and what value it provides..."
                  className="min-h-[140px] bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-lg resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-gray-500">
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
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                Event Agenda
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Outline the event schedule, topics, speakers, or activities..."
                  className="min-h-[140px] bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-gray-500">
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
              <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-white" />
                </div>
                Q&A & Additional Information
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Answer common questions, provide additional details, requirements, or special instructions..."
                  className="min-h-[120px] bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-gray-500">
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