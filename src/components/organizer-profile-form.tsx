'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Globe, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram,
  Palette,
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  organizerProfileFormSchema,
  OrganizerProfileFormData,
  OrganizerProfileFormProps,
  organizerProfileToFormData,
  getOrganizerProfileFormDefaults,
} from '@/types/forms';

export function OrganizerProfileForm({ 
  initialData, 
  onSubmit, 
  mode, 
  submitButtonText = mode === 'create' ? 'Create Profile' : 'Update Profile' 
}: OrganizerProfileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrganizerProfileFormData>({
    resolver: zodResolver(organizerProfileFormSchema),
    defaultValues: initialData 
      ? organizerProfileToFormData(initialData)
      : getOrganizerProfileFormDefaults(),
  });

  const organizationType = watch('organizationType');
  const showContactInfo = watch('showContactInfo');
  const showSocialLinks = watch('showSocialLinks');

  const handleFormSubmit = async (data: OrganizerProfileFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="Your name or organization name"
                {...register('displayName')}
              />
              {errors.displayName && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.displayName.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType">Organization Type</Label>
              <Select
                value={organizationType}
                onValueChange={(value) => setValue('organizationType', value as 'individual' | 'company' | 'nonprofit' | 'government' | 'education' | 'other')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="nonprofit">Non-profit</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About</Label>
            <Textarea
              id="bio"
              placeholder="Tell people about yourself or your organization..."
              rows={4}
              {...register('bio')}
            />
            {errors.bio && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.bio.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Public Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                {...register('email')}
              />
              {errors.email && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.email.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register('website')}
              />
              {errors.website && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.website.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State or Full Address"
                {...register('location')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/username"
                {...register('linkedinUrl')}
              />
              {errors.linkedinUrl && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.linkedinUrl.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterUrl" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter/X
              </Label>
              <Input
                id="twitterUrl"
                type="url"
                placeholder="https://twitter.com/username"
                {...register('twitterUrl')}
              />
              {errors.twitterUrl && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.twitterUrl.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Label>
              <Input
                id="facebookUrl"
                type="url"
                placeholder="https://facebook.com/username"
                {...register('facebookUrl')}
              />
              {errors.facebookUrl && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.facebookUrl.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagramUrl"
                type="url"
                placeholder="https://instagram.com/username"
                {...register('instagramUrl')}
              />
              {errors.instagramUrl && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.instagramUrl.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding & Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding & Event Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandColor">Brand Color</Label>
            <Input
              id="brandColor"
              type="color"
              {...register('brandColor')}
              className="w-20 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultLocation">Default Event Location</Label>
            <Input
              id="defaultLocation"
              placeholder="Your usual event location"
              {...register('defaultLocation')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultAgenda">Default Event Agenda Template</Label>
            <Textarea
              id="defaultAgenda"
              placeholder="Your standard agenda template..."
              rows={3}
              {...register('defaultAgenda')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDisclaimer">Event Disclaimer/Terms</Label>
            <Textarea
              id="eventDisclaimer"
              placeholder="Standard disclaimer or terms for your events..."
              rows={3}
              {...register('eventDisclaimer')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showContactInfo"
              checked={showContactInfo}
              onCheckedChange={(checked) => setValue('showContactInfo', !!checked)}
            />
            <Label htmlFor="showContactInfo">
              Show contact information on event pages
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSocialLinks"
              checked={showSocialLinks}
              onCheckedChange={(checked) => setValue('showSocialLinks', !!checked)}
            />
            <Label htmlFor="showSocialLinks">
              Show social media links on event pages
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
} 