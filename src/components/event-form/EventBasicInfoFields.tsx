import { useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GoogleMapsAutocomplete } from '@/components/ui/google-maps-autocomplete';
import { Calendar, Clock, MapPin, Sparkles, Globe, Link as LinkIcon } from 'lucide-react';
import { EventFormData } from '@/types/forms';

interface EventBasicInfoFieldsProps {
  control: Control<EventFormData>;
}

export function EventBasicInfoFields({ control }: EventBasicInfoFieldsProps) {
  const locationType = useWatch({ control, name: 'locationType' });

  return (
    <Card className="border-zinc-800 bg-black rounded-lg shadow-none">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-white">
              Essential Details
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
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
              <FormLabel className="text-base font-medium text-white">
                Event Title
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your event title" 
                  className="text-lg h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm text-zinc-500">
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
                <FormLabel className="flex items-center gap-2 text-base font-medium text-white">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                  </div>
                  Event Date
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white"
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
                <FormLabel className="flex items-center gap-2 text-base font-medium text-white">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-zinc-400" />
                  </div>
                  Start Time
                </FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Enhanced Location Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-zinc-400" />
            </div>
            <h3 className="text-base font-medium text-white">Event Location</h3>
          </div>

          {/* Location Type Toggle */}
          <FormField
            control={control}
            name="locationType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium text-white">
                  Location Type
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="address" className="text-white hover:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Physical Address
                      </div>
                    </SelectItem>
                    <SelectItem value="virtual" className="text-white hover:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Virtual Event
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address Fields */}
          {locationType === 'address' && (
            <div className="space-y-4">
              <FormField
                control={control}
                name="streetAddress"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-white">
                      Street Address
                    </FormLabel>
                    <FormControl>
                      <GoogleMapsAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        onPlaceSelect={(place) => {
                          // Auto-fill other address fields when a place is selected
                          field.onChange(place.streetAddress);
                          // You can also set other form fields here if needed
                          // setValue('city', place.city);
                          // setValue('state', place.state);
                          // etc.
                        }}
                        placeholder="Start typing an address..."
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-zinc-500">
                      Start typing to see address suggestions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-white">
                        City
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="New York" 
                          className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-white">
                        State / Province
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="NY" 
                          className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-white">
                        ZIP / Postal Code
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10001" 
                          className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-white">
                        Country
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="United States" 
                          className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormDescription className="text-sm text-zinc-500">
                Provide the complete address where your event will take place
              </FormDescription>
            </div>
          )}

          {/* Virtual Event Fields */}
          {locationType === 'virtual' && (
            <div className="space-y-4">
              <FormField
                control={control}
                name="virtualLink"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-white">
                      <LinkIcon className="h-4 w-4" />
                      Meeting Link
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://zoom.us/j/123456789 or https://meet.google.com/xyz-abc-def" 
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="virtualPlatform"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-white">
                      Platform (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Zoom, Google Meet, Microsoft Teams, etc." 
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormDescription className="text-sm text-zinc-500">
                Provide the meeting link and platform details for your virtual event
              </FormDescription>
            </div>
          )}

          {/* Fallback Location Field for compatibility */}
          <FormField
            control={control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium text-white">
                  Location Summary
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={locationType === 'virtual' ? "Virtual Event" : "Brief location description"}
                    className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-sm text-zinc-500">
                  {locationType === 'virtual' 
                    ? "A brief description for your virtual event (e.g., 'Online Workshop via Zoom')"
                    : "A brief, friendly description of the location (e.g., 'Downtown Conference Center')"
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
} 