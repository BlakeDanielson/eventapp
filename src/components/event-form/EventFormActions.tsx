import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Rocket, Eye, Download, Check, ExternalLink } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <Button 
          type="submit" 
          size="lg" 
          className="flex-1 h-14 bg-white hover:bg-zinc-100 text-black font-medium text-lg transition-all duration-200 rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              {submitButtonText.includes('Update') ? 'Updating Your Event...' : 'Creating Your Event...'}
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5 mr-3" />
              {submitButtonText}
            </>
          )}
        </Button>
        
        {eventId && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              size="lg"
              className="h-14 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Event
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg"
              className="h-14 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        )}
      </div>

      {/* Success State */}
      {eventId && (
        <Card className="bg-zinc-900 border-zinc-800 rounded-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Event Created Successfully! 🎉
              </h3>
              <p className="text-zinc-400 mb-6 text-lg">
                Your event is now live and ready to attract attendees
              </p>
              
              <div className="bg-black border border-zinc-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-zinc-400 mb-2 font-medium">Share this link:</p>
                <Link 
                  href={`/event/${eventId}`} 
                  className="text-white hover:text-zinc-300 font-mono text-sm break-all bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 inline-block transition-colors"
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}/event/{eventId}
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/event/${eventId}`}>
                  <Button className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-lg font-medium transition-all duration-200">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Event Page
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
} 