"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe } from 'lucide-react';

interface SocialLinksSectionProps {
  formData: {
    linkedinUrl: string;
    twitterUrl: string;
    facebookUrl: string;
    instagramUrl: string;
    showSocialLinks: boolean;
  };
  onInputChange: (field: string, value: string | boolean) => void;
}

export function SocialLinksSection({ formData, onInputChange }: SocialLinksSectionProps) {
  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Social Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Show Social Links</Label>
            <p className="text-sm text-white/50">Display social media links on your profile</p>
          </div>
          <Switch
            checked={formData.showSocialLinks}
            onCheckedChange={(checked) => onInputChange('showSocialLinks', checked)}
          />
        </div>

        {formData.showSocialLinks && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="text-white">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => onInputChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterUrl" className="text-white">Twitter/X</Label>
              <Input
                id="twitterUrl"
                value={formData.twitterUrl}
                onChange={(e) => onInputChange('twitterUrl', e.target.value)}
                placeholder="https://twitter.com/username"
                className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookUrl" className="text-white">Facebook</Label>
              <Input
                id="facebookUrl"
                value={formData.facebookUrl}
                onChange={(e) => onInputChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/username"
                className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl" className="text-white">Instagram</Label>
              <Input
                id="instagramUrl"
                value={formData.instagramUrl}
                onChange={(e) => onInputChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/username"
                className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 