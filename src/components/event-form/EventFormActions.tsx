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
          className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              Creating Your Event...
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
              className="h-14 bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-gray-50/80 rounded-xl font-medium transition-all duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Event
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg"
              className="h-14 bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-gray-50/80 rounded-xl font-medium transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        )}
      </div>

      {/* Success State */}
      {eventId && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 rounded-xl shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Event Created Successfully! 🎉
              </h3>
              <p className="text-green-700 mb-6 text-lg">
                Your event is now live and ready to attract attendees
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-700 mb-2 font-medium">Share this link:</p>
                <Link 
                  href={`/event/${eventId}`} 
                  className="text-blue-600 hover:text-blue-700 font-mono text-sm break-all bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-200/50 inline-block transition-colors"
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}/event/{eventId}
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/event/${eventId}`}>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Event Page
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-green-200/60 hover:bg-green-50/80 px-6 py-3 rounded-lg font-medium transition-all duration-200">
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