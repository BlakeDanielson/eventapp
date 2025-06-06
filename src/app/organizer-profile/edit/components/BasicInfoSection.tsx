"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building, Mail, Phone, Globe, MapPin } from 'lucide-react';

interface BasicInfoSectionProps {
  formData: {
    displayName: string;
    bio: string;
    organizationType: string;
    email: string;
    phone: string;
    website: string;
    location: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function BasicInfoSection({ formData, onInputChange }: BasicInfoSectionProps) {
  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-white">Display Name *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => onInputChange('displayName', e.target.value)}
              placeholder="Your organization or personal name"
              className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationType" className="text-white">Organization Type</Label>
            <Select value={formData.organizationType} onValueChange={(value) => onInputChange('organizationType', value)}>
              <SelectTrigger className="bg-black/40 border-white/[0.08] text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/[0.08]">
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="nonprofit">Non-profit</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            placeholder="Tell people about yourself or your organization..."
            className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="contact@example.com"
              className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="website" className="text-white flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => onInputChange('website', e.target.value)}
              placeholder="https://example.com"
              className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-white flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onInputChange('location', e.target.value)}
              placeholder="City, State/Country"
              className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 