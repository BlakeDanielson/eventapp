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
import { ImageUpload } from '../image-upload';
import { Image } from 'lucide-react';
import { EventFormData } from '@/types/forms';

interface EventVisualFieldsProps {
  control: Control<EventFormData>;
}

export function EventVisualFields({ control }: EventVisualFieldsProps) {
  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Image className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Visual Appeal
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Add an image to make your event page memorable
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="image"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium text-gray-900">
                Event Image
              </FormLabel>
              <FormControl>
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg p-1">
                  <ImageUpload />
                </div>
              </FormControl>
              <FormDescription className="text-sm text-gray-500">
                Upload a compelling image to make your event page stand out and attract more attendees
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 