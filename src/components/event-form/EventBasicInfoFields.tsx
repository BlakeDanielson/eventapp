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
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { EventFormData } from '@/types/forms';

interface EventBasicInfoFieldsProps {
  control: Control<EventFormData>;
}

export function EventBasicInfoFields({ control }: EventBasicInfoFieldsProps) {
  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Essential Details
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Let's start with the key information about your event
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium text-gray-900">
                Event Title
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your event title" 
                  className="text-lg h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-gray-500">
                Create a compelling title that will attract your target audience
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="date"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Event Date
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-green-500 focus:ring-green-500/20 rounded-lg"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="time"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Start Time
                </FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-base font-medium text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Event Location
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Where will your event take place?" 
                  className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-gray-500">
                Include the full address for physical events or meeting links for virtual events
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 