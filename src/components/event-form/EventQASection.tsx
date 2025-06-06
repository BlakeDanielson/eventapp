'use client';

import React from 'react';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Info } from 'lucide-react';
import { EventFormData } from '@/types/forms';

interface EventQASectionProps {
  control: Control<EventFormData>;
}

export function EventQASection({ control }: EventQASectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Q&A Settings
        </CardTitle>
        <CardDescription>
          Configure question and answer functionality for your event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="qaEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Enable Interactive Q&A
                </FormLabel>
                <FormDescription>
                  Allow attendees to post questions and receive answers from organizers
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">How Interactive Q&A Works</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Attendees can post questions on the event page</li>
                <li>• Other attendees can upvote interesting questions</li>
                <li>• You can answer questions with official responses</li>
                <li>• Questions are accepted until 24 hours after the event</li>
                <li>• You can moderate and hide inappropriate content</li>
              </ul>
            </div>
          </div>
        </div>

        <FormField
          control={control}
          name="qa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Static Event Information (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information about the event, FAQ, policies, etc."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This appears as a separate section below the interactive Q&A.
                Use this for event policies, FAQ, or other static information.
              </FormDescription>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 