import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface EventFormActionsProps {
  isSubmitting: boolean;
  submitButtonText: string;
  eventId: string | null;
}

export function EventFormActions({ 
  isSubmitting, 
  submitButtonText, 
  eventId 
}: EventFormActionsProps) {
  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button 
          type="submit" 
          size="lg" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {submitButtonText}...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
        
        {eventId && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" size="lg">
              Preview Event
            </Button>
            <Button type="button" variant="outline" size="lg">
              Export Attendees
            </Button>
          </div>
        )}
      </div>

      {/* Success State */}
      {eventId && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🎉 Event Created Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                Share this link with your potential attendees:
              </p>
              <div className="bg-white border border-green-300 rounded-lg p-3 mb-4">
                <Link 
                  href={`/event/${eventId}`} 
                  className="text-blue-600 hover:underline font-mono text-sm break-all"
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}/event/{eventId}
                </Link>
              </div>
              <Link href={`/event/${eventId}`}>
                <Button variant="outline">View Event Page</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
} 