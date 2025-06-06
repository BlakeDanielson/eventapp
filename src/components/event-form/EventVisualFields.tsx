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
import { EventFormData } from '@/types/forms';

interface EventVisualFieldsProps {
  control: Control<EventFormData>;
}

export function EventVisualFields({ control }: EventVisualFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Customization</CardTitle>
        <CardDescription>
          Add an image to make your event page more attractive
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Event Image</FormLabel>
              <FormControl>
                <ImageUpload />
              </FormControl>
              <FormDescription>
                Upload a compelling image to make your event page stand out
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 