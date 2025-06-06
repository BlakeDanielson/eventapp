'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar, 
  Shield, 
  Eye, 
  EyeOff,
  ExternalLink,
  Loader2,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useOrganizerProfile } from '@/hooks/useOrganizerProfile';
import { NoProfileState, LoadingState } from './components';

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
      fetchProfile();
    }
    setDeleteLoading(false);
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
              <Users className="h-8 w-8 text-white/70" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-4">Authentication Required</h1>
            <p className="text-white/50 mb-6">Please sign in to access your organizer profile.</p>
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/[0.05]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-semibold text-white">Organizer Profile</h1>
                <p className="text-white/50 mt-1">
                  Manage your profile information and event defaults
                </p>
              </div>
            </div>
            {profile && (
              <div className="flex items-center gap-2">
                <Link href="/organizer-profile/edit">
                  <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/20">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-400/10 border-red-400/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && !profile && <LoadingState />}

        {/* No Profile State */}
        {!loading && !profile && !error && <NoProfileState />}

        {/* Profile Display */}
        {profile && (
          <div className="space-y-8">
            {/* Profile Header */}
            <Card className="bg-black/40 border-white/[0.08] hover:border-white/20 transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-white/[0.05] border border-white/[0.08] rounded-2xl flex items-center justify-center">
                    <User className="h-10 w-10 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-semibold text-white mb-2">{profile.displayName}</h2>
                    <Badge 
                      variant="secondary" 
                      className="mb-4 bg-white/[0.05] text-white/70 border border-white/[0.08] capitalize"
                    >
                      {profile.organizationType}
                    </Badge>
                    {profile.bio && (
                      <p className="text-white/60 leading-relaxed max-w-3xl">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                {(profile.email || profile.phone || profile.website || profile.location) && (
                  <Card className="bg-black/40 border-white/[0.08] hover:border-white/20 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Mail className="h-5 w-5 text-white/70" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.email && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <Mail className="h-5 w-5 text-white/70" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">Email</h3>
                              <a 
                                href={`mailto:${profile.email}`}
                                className="text-white/60 hover:text-white transition-colors"
                              >
                                {profile.email}
                              </a>
                            </div>
                          </div>
                        )}
                        {profile.phone && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <Phone className="h-5 w-5 text-white/70" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">Phone</h3>
                              <a 
                                href={`tel:${profile.phone}`}
                                className="text-white/60 hover:text-white transition-colors"
                              >
                                {profile.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        {profile.website && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <Globe className="h-5 w-5 text-white/70" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">Website</h3>
                              <a 
                                href={profile.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                              >
                                {profile.website.replace(/^https?:\/\//, '')}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        )}
                        {profile.location && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-white/70" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">Location</h3>
                              <p className="text-white/60">{profile.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Social Media */}
                {(profile.linkedinUrl || profile.twitterUrl || profile.facebookUrl || profile.instagramUrl) && (
                  <Card className="bg-black/40 border-white/[0.08] hover:border-white/20 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="h-5 w-5 text-white/70" />
                        Social Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.linkedinUrl && (
                          <a 
                            href={profile.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/20 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <span className="text-white/70 font-bold text-sm">in</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">LinkedIn</h3>
                              <p className="text-white/50 text-sm">View profile</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-white/40 ml-auto" />
                          </a>
                        )}
                        {profile.twitterUrl && (
                          <a 
                            href={profile.twitterUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/20 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <span className="text-white/70 font-bold text-sm">X</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">Twitter/X</h3>
                              <p className="text-white/50 text-sm">Follow us</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-white/40 ml-auto" />
                          </a>
                        )}
                        {profile.facebookUrl && (
                          <a 
                            href={profile.facebookUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/20 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <span className="text-white/70 font-bold text-sm">f</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">Facebook</h3>
                              <p className="text-white/50 text-sm">Like our page</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-white/40 ml-auto" />
                          </a>
                        )}
                        {profile.instagramUrl && (
                          <a 
                            href={profile.instagramUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/20 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center">
                              <span className="text-white/70 font-bold text-sm">ig</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">Instagram</h3>
                              <p className="text-white/50 text-sm">Follow us</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-white/40 ml-auto" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Defaults */}
                {(profile.defaultLocation || profile.defaultAgenda || profile.eventDisclaimer) && (
                  <Card className="bg-black/40 border-white/[0.08] hover:border-white/20 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-white/70" />
                        Event Defaults
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile.defaultLocation && (
                        <div>
                          <h3 className="font-medium text-white text-sm mb-1">Default Location</h3>
                          <p className="text-white/60 text-sm">{profile.defaultLocation}</p>
                        </div>
                      )}
                      {profile.defaultAgenda && (
                        <div>
                          <Separator className="bg-white/[0.08] my-3" />
                          <h3 className="font-medium text-white text-sm mb-1">Default Agenda</h3>
                          <p className="text-white/60 text-sm whitespace-pre-wrap">{profile.defaultAgenda}</p>
                        </div>
                      )}
                      {profile.eventDisclaimer && (
                        <div>
                          <Separator className="bg-white/[0.08] my-3" />
                          <h3 className="font-medium text-white text-sm mb-1">Event Disclaimer</h3>
                          <p className="text-white/60 text-sm whitespace-pre-wrap">{profile.eventDisclaimer}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Privacy Settings */}
                <Card className="bg-black/40 border-white/[0.08] hover:border-white/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-white/70" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white text-sm">Contact Info</h3>
                        <p className="text-white/50 text-xs">Visibility to attendees</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {profile.showContactInfo ? (
                          <Eye className="h-4 w-4 text-white/70" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-white/40" />
                        )}
                        <span className="text-sm text-white/60">
                          {profile.showContactInfo ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/[0.08]" />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white text-sm">Social Links</h3>
                        <p className="text-white/50 text-xs">Social media visibility</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {profile.showSocialLinks ? (
                          <Eye className="h-4 w-4 text-white/70" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-white/40" />
                        )}
                        <span className="text-sm text-white/60">
                          {profile.showSocialLinks ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 bg-black/40 border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Delete Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/60 mb-6">
                  Are you sure you want to delete your organizer profile? This action cannot be undone 
                  and will remove all your profile information and default settings.
                </p>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                    className="border-white/[0.08] text-white/70 hover:bg-white/[0.05] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteProfile}
                    disabled={deleteLoading}
                    className="bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Profile'
                    )}
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