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
import { CustomizationPanel } from '../customization-panel';
import { EventFormData } from '@/types/forms';

interface EventVisualFieldsProps {
  control: Control<EventFormData>;
}

export function EventVisualFields({ control }: EventVisualFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual & Customization</CardTitle>
        <CardDescription>
          Make your event page stand out with images and customization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                Add a compelling image to make your event page more attractive
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomizationPanel />
      </CardContent>
    </Card>
  );
} 