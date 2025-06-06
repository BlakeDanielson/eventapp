'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Edit, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useOrganizerProfile } from '@/hooks/useOrganizerProfile';

export default function OrganizerProfilePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { profile, loading, error, fetchProfile, deleteProfile } = useOrganizerProfile();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn, fetchProfile]);

  const handleDeleteProfile = async () => {
    setDeleteLoading(true);
    const success = await deleteProfile();
    if (success) {
      setShowDeleteConfirm(false);
      // Refresh the profile data
      fetchProfile();
    }
    setDeleteLoading(false);
  };

  // Authentication Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your organizer profile.</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizer Profile</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your profile information and event defaults
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && !profile && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        )}

        {/* No Profile State */}
        {!loading && !profile && !error && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create Your Organizer Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Set up your organizer profile to display your information on event pages and 
                configure default settings for new events.
              </p>
              <Link href="/organizer-profile/edit">
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Profile Display */}
        {profile && (
          <div className="space-y-6">
            {/* Profile Actions */}
            <div className="flex justify-end gap-2">
              <Link href="/organizer-profile/edit">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Profile
              </Button>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Display Name</h3>
                    <p className="text-gray-600">{profile.displayName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Organization Type</h3>
                    <p className="text-gray-600 capitalize">{profile.organizationType}</p>
                  </div>
                </div>
                {profile.bio && (
                  <div>
                    <h3 className="font-medium text-gray-900">About</h3>
                    <p className="text-gray-600">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(profile.email || profile.phone || profile.website || profile.location) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.email && (
                      <div>
                        <h3 className="font-medium text-gray-900">Email</h3>
                        <p className="text-gray-600">{profile.email}</p>
                      </div>
                    )}
                    {profile.phone && (
                      <div>
                        <h3 className="font-medium text-gray-900">Phone</h3>
                        <p className="text-gray-600">{profile.phone}</p>
                      </div>
                    )}
                    {profile.website && (
                      <div>
                        <h3 className="font-medium text-gray-900">Website</h3>
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {profile.location && (
                      <div>
                        <h3 className="font-medium text-gray-900">Location</h3>
                        <p className="text-gray-600">{profile.location}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media */}
            {(profile.linkedinUrl || profile.twitterUrl || profile.facebookUrl || profile.instagramUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.linkedinUrl && (
                      <div>
                        <h3 className="font-medium text-gray-900">LinkedIn</h3>
                        <a 
                          href={profile.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.linkedinUrl}
                        </a>
                      </div>
                    )}
                    {profile.twitterUrl && (
                      <div>
                        <h3 className="font-medium text-gray-900">Twitter/X</h3>
                        <a 
                          href={profile.twitterUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.twitterUrl}
                        </a>
                      </div>
                    )}
                    {profile.facebookUrl && (
                      <div>
                        <h3 className="font-medium text-gray-900">Facebook</h3>
                        <a 
                          href={profile.facebookUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.facebookUrl}
                        </a>
                      </div>
                    )}
                    {profile.instagramUrl && (
                      <div>
                        <h3 className="font-medium text-gray-900">Instagram</h3>
                        <a 
                          href={profile.instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.instagramUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Defaults */}
            {(profile.defaultLocation || profile.defaultAgenda || profile.eventDisclaimer) && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Defaults</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.defaultLocation && (
                    <div>
                      <h3 className="font-medium text-gray-900">Default Location</h3>
                      <p className="text-gray-600">{profile.defaultLocation}</p>
                    </div>
                  )}
                  {profile.defaultAgenda && (
                    <div>
                      <h3 className="font-medium text-gray-900">Default Agenda</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{profile.defaultAgenda}</p>
                    </div>
                  )}
                  {profile.eventDisclaimer && (
                    <div>
                      <h3 className="font-medium text-gray-900">Event Disclaimer</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{profile.eventDisclaimer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Show Contact Info</h3>
                    <p className="text-gray-600">
                      {profile.showContactInfo ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Show Social Links</h3>
                    <p className="text-gray-600">
                      {profile.showSocialLinks ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">Delete Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete your organizer profile? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteProfile}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
} 