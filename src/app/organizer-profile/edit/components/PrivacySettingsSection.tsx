"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface PrivacySettingsSectionProps {
  formData: {
    showContactInfo: boolean;
    showSocialLinks: boolean;
  };
  onInputChange: (field: string, value: boolean) => void;
}

export function PrivacySettingsSection({ formData, onInputChange }: PrivacySettingsSectionProps) {
  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-white/70 mt-0.5" />
            <div>
              <Label className="text-white">Show Contact Information</Label>
              <p className="text-sm text-white/50">Display email and phone on your public profile</p>
            </div>
          </div>
          <Switch
            checked={formData.showContactInfo}
            onCheckedChange={(checked) => onInputChange('showContactInfo', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            {formData.showSocialLinks ? (
              <Eye className="h-5 w-5 text-white/70 mt-0.5" />
            ) : (
              <EyeOff className="h-5 w-5 text-white/70 mt-0.5" />
            )}
            <div>
              <Label className="text-white">Show Social Links</Label>
              <p className="text-sm text-white/50">Display social media links on your public profile</p>
            </div>
          </div>
          <Switch
            checked={formData.showSocialLinks}
            onCheckedChange={(checked) => onInputChange('showSocialLinks', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
} 