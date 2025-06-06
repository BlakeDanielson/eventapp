"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export function NoProfileState() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-black/40 border-white/[0.08] text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-white/[0.05] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white/70" />
          </div>
          <CardTitle className="text-white text-2xl font-semibold">Create Your Organizer Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-white/60 text-lg leading-relaxed">
            Set up your organizer profile to display your information on event pages and 
            configure default settings for new events.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg">
              <Building className="h-6 w-6 text-white/70 mb-2" />
              <h3 className="font-medium text-white mb-1">Organization Info</h3>
              <p className="text-sm text-white/50">Display name, bio, and contact details</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg">
              <Calendar className="h-6 w-6 text-white/70 mb-2" />
              <h3 className="font-medium text-white mb-1">Event Defaults</h3>
              <p className="text-sm text-white/50">Default location, time, and settings</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg">
              <Shield className="h-6 w-6 text-white/70 mb-2" />
              <h3 className="font-medium text-white mb-1">Privacy Controls</h3>
              <p className="text-sm text-white/50">Control visibility of your information</p>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/organizer-profile/edit">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8">
                <User className="h-4 w-4 mr-2" />
                Create Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 