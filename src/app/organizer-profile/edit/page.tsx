'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Loader2, 
  User
} from 'lucide-react';
import Link from 'next/link';
import { useOrganizerProfile } from '@/hooks/useOrganizerProfile';
import { 
  BasicInfoSection, 
  SocialLinksSection, 
  EventDefaultsSection, 
  PrivacySettingsSection 
} from './components';

interface FormData {
  displayName: string;
  bio: string;
  organizationType: 'company' | 'individual' | 'nonprofit' | 'government' | 'education' | 'other';
  email: string;
  phone: string;
  website: string;
  location: string;
  linkedinUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  defaultLocation: string;
  defaultAgenda: string;
  eventDisclaimer: string;
  showContactInfo: boolean;
  showSocialLinks: boolean;
}

export default function EditOrganizerProfilePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { profile, loading, error, fetchProfile, saveProfile } = useOrganizerProfile();
  
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    bio: '',
    organizationType: 'company',
    email: '',
    phone: '',
    website: '',
    location: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    defaultLocation: '',
    defaultAgenda: '',
    eventDisclaimer: '',
    showContactInfo: true,
    showSocialLinks: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        organizationType: profile.organizationType || 'company',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        location: profile.location || '',
        linkedinUrl: profile.linkedinUrl || '',
        twitterUrl: profile.twitterUrl || '',
        facebookUrl: profile.facebookUrl || '',
        instagramUrl: profile.instagramUrl || '',
        defaultLocation: profile.defaultLocation || '',
        defaultAgenda: profile.defaultAgenda || '',
        eventDisclaimer: profile.eventDisclaimer || '',
        showContactInfo: profile.showContactInfo ?? true,
        showSocialLinks: profile.showSocialLinks ?? true,
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const success = await saveProfile(formData);

      if (success) {
        router.push('/organizer-profile');
      } else {
        setSubmitError('Failed to save profile. Please try again.');
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authentication Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white/70 mx-auto mb-4" />
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/[0.05] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-white/70" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-4">Authentication Required</h1>
            <p className="text-white/50 mb-6">Please sign in to edit your organizer profile.</p>
          </div>
          <Link href="/sign-in">
            <Button className="bg-white text-black hover:bg-white/90 px-8 py-3">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/organizer-profile">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/[0.05]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-semibold text-white">
                  {profile ? 'Edit Profile' : 'Create Profile'}
                </h1>
                <p className="text-white/50 mt-1">
                  {profile 
                    ? 'Update your organizer profile and settings'
                    : 'Set up your organizer profile to get started'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Error Messages */}
        {(error || submitError) && (
          <Alert variant="destructive" className="mb-6 bg-red-400/10 border-red-400/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || submitError}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/40 border-white/[0.08]">
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white/70 mr-3" />
                  <span className="text-white/60">Loading profile...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              <BasicInfoSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
              
              <SocialLinksSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
              
              <EventDefaultsSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
              
              <PrivacySettingsSection 
                formData={formData}
                onInputChange={handleInputChange}
              />

              {/* Submit Button */}
              <Card className="bg-black/40 border-white/[0.08]">
                <CardFooter className="flex justify-between items-center">
                  <div>
                    <p className="text-white/50 text-sm">
                      All changes will be automatically applied to future events
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href="/organizer-profile">
                      <Button 
                        type="button" 
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/20"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !formData.displayName.trim()}
                      className="bg-white text-black hover:bg-white/90 px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {profile ? 'Update Profile' : 'Create Profile'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </div>
        )}
      </main>
    </div>
  );
} 