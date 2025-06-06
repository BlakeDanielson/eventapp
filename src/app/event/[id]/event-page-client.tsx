"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, Clock, Users, Share2, Heart, ArrowRight, Star, Ticket, Info, Mail, Phone, Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RegistrationForm } from '@/components/registration-form';
import { TicketPurchase } from '@/components/ticket-purchase';
import { EventQA } from '@/components/event-qa';
import { CalendarActions } from '@/components/calendar-actions';
import { EventWithOrganizer } from '@/types/event';
import dynamic from 'next/dynamic';

const EventMap = dynamic(() => import('@/components/event-map').then(mod => ({ default: mod.EventMap })), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-black/40 rounded-lg flex items-center justify-center border border-white/[0.08]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
        <p className="text-white/50">Loading interactive map...</p>
      </div>
    </div>
  )
});

const EventGallery = ({ imageUrl, title }: { imageUrl?: string; title: string }) => {
  const defaultImage = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80";
  
  return (
    <div className="relative aspect-[16/9] h-[550px] rounded-xl overflow-hidden shadow-2xl border border-white/[0.08]">
      <Image 
        src={imageUrl || defaultImage} 
        alt={title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6">
        <div className="backdrop-blur-sm bg-black/30 rounded-lg p-4 border border-white/10">
          <h2 className="text-white text-xl font-semibold mb-1">{title}</h2>
          <p className="text-white/80 text-sm">Event Gallery</p>
        </div>
      </div>
    </div>
  );
};

const EventAttendees = ({ count }: { count: number }) => {
  const maxCapacity = 200;
  const mockAttendees = Array.from({ length: Math.min(count, 5) }, (_, i) => ({
    name: `Attendee ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`
  }));

  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center text-white">
          <Users className="h-5 w-5 mr-2 text-blue-400" />
          Attendees
        </CardTitle>
        <CardDescription className="text-white/50">
          {count} people registered
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex -space-x-2 overflow-hidden mb-4">
          {mockAttendees.map((attendee, index) => (
            <Avatar key={index} className="border-2 border-white/[0.08] ring-2 ring-black">
              <AvatarImage src={attendee.avatar} alt={attendee.name} />
              <AvatarFallback className="bg-white/[0.05] text-white">{attendee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {count > 5 && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/[0.08] bg-white/[0.05] text-white/60 text-xs font-medium ring-2 ring-black">
              +{count - 5}
            </div>
          )}
        </div>
        <div className="w-full bg-white/[0.08] rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((count / maxCapacity) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-white/50 mt-2">
          {count > 0 ? `${count} registered` : 'Be the first to register!'}
        </p>
      </CardContent>
    </Card>
  );
};

// Client component for interactivity
export function EventPageClient({ 
  event, 
  eventId, 
  registrationCount, 
  formattedDate,
  accessInfo 
}: { 
  event: EventWithOrganizer; 
  eventId: string; 
  registrationCount: number; 
  formattedDate: string;
  accessInfo?: {
    hasAccess: boolean;
    reason: 'invited' | 'shared_link' | 'public_event' | 'owner';
    inviteToken?: string;
    inviteeId?: string;
    sharedBy?: string;
    inviteeEmail?: string;
  };
}) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <Star className="h-3 w-3 mr-1" />
                Featured Event
              </Badge>
              {event.hasTickets && (
                <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <Ticket className="h-3 w-3 mr-1" />
                  Ticketed Event
                </Badge>
              )}
              {accessInfo?.reason === 'owner' && (
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <Users className="h-3 w-3 mr-1" />
                  Your Event
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 mb-6 text-gray-300">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                <span className="text-lg">{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-purple-400" />
                <span className="text-lg">{event.time}</span>
              </div>
            </div>
            <div className="flex items-center text-gray-300 mb-6">
              <MapPin className="h-5 w-5 mr-3 text-emerald-400" />
              <span className="text-lg">{event.location}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <CalendarActions event={event} />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className="border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white"
            >
              <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500 text-red-500" : "")} />
            </Button>
            <Button variant="outline" size="icon" className="border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Photo and Event Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Photo */}
          <div className="lg:col-span-2">
            <EventGallery imageUrl={event.imageUrl} title={event.title} />
          </div>
          
                    {/* Event Tickets/Registration Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-black/40 border-white/[0.08]">
              <CardContent className="pt-6">
                {/* Registration/Ticket Purchase Section */}
                <div className="w-full">
                  {event.hasTickets ? (
                    <TicketPurchase event={event} eventId={eventId} />
                  ) : (
                    <RegistrationForm eventId={eventId} event={event} accessInfo={accessInfo} />
                  )}
                </div>
                
                {/* Calendar Actions */}
                <div className="mt-6 pt-6 border-t border-white/[0.08]">
                  <div className="text-center">
                    <p className="text-white/50 text-sm mb-3">Save this event</p>
                    <CalendarActions event={event} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-8 mb-8">
            {/* About Section */}
            <Card className="bg-black/40 border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white text-2xl">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-white/60 leading-relaxed text-lg">{event.bio}</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card className="bg-black/40 border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Event Location</CardTitle>
                <CardDescription className="text-white/50">{event.location}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <EventMap 
                  location={event.location}
                  eventTitle={event.title}
                  eventDate={formattedDate}
                  eventTime={event.time}
                  organizerName={event.organizerProfile?.displayName}
                  className="rounded-none"
                />
              </CardContent>
            </Card>
            
            {/* What to Expect Section */}
            <Card className="bg-black/40 border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white text-2xl">What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="bg-yellow-500/10 p-3 rounded-full mr-4 border border-yellow-500/20">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Premium Experience</h4>
                      <p className="text-white/50">Carefully curated content and experiences</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500/10 p-3 rounded-full mr-4 border border-blue-500/20">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Networking</h4>
                      <p className="text-white/50">Connect with like-minded individuals</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-500/10 p-3 rounded-full mr-4 border border-purple-500/20">
                      <Info className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Insights</h4>
                      <p className="text-white/50">Gain valuable knowledge and perspectives</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-emerald-500/10 p-3 rounded-full mr-4 border border-emerald-500/20">
                      <Calendar className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Structured Agenda</h4>
                      <p className="text-white/50">Well-planned schedule to maximize value</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Q&A Section */}
            <EventQA 
              eventId={eventId}
              isOrganizer={accessInfo?.reason === 'owner'}
              userEmail={accessInfo?.inviteeEmail}
              userName={accessInfo?.reason === 'owner' ? 'Event Organizer' : undefined}
              eventDate={event.date}
              qaEnabled={event.qaEnabled}
            />

            {/* Static Q&A Section (if exists) */}
            {event.qa && (
              <Card className="bg-black/40 border-white/[0.08]">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Event Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-white/60 leading-relaxed">{event.qa}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <EventAttendees count={registrationCount} />
          
          {/* Event Schedule */}
          <Card className="bg-black/40 border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-xl text-white">Event Schedule</CardTitle>
              <CardDescription className="text-white/50">Detailed timeline of activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-white/60 leading-relaxed text-sm">{event.agenda}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-xl text-white">Event Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white/[0.08]">
                  {event.organizerProfile?.profileImageUrl ? (
                    <AvatarImage 
                      src={event.organizerProfile.profileImageUrl} 
                      alt={event.organizerProfile.displayName || 'Organizer'} 
                    />
                  ) : null}
                  <AvatarFallback className="bg-white/[0.05] text-white text-lg">
                    {event.organizerProfile?.displayName 
                      ? event.organizerProfile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                      : 'EA'
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {event.organizerProfile?.displayName || 'EventApp'}
                  </h3>
                  <p className="text-white/50">
                    {event.organizerProfile?.organizationType === 'individual' ? 'Event Organizer' :
                     event.organizerProfile?.organizationType === 'company' ? 'Company' :
                     event.organizerProfile?.organizationType === 'nonprofit' ? 'Non-Profit Organization' :
                     event.organizerProfile?.organizationType === 'government' ? 'Government Agency' :
                     event.organizerProfile?.organizationType === 'education' ? 'Educational Institution' :
                     event.organizerProfile?.organizationType || 'Event Platform'}
                  </p>
                </div>
              </div>
              {event.organizerProfile?.bio && (
                <p className="text-white/50 leading-relaxed">
                  {event.organizerProfile.bio}
                </p>
              )}
              {!event.organizerProfile?.bio && (
                <p className="text-white/50 leading-relaxed">
                  Creating memorable experiences and bringing people together through thoughtfully organized events.
                </p>
              )}
              
              {/* Contact Information */}
              {event.organizerProfile?.showContactInfo && (
                <div className="space-y-3">
                  {event.organizerProfile?.email && (
                    <div className="flex items-center gap-3 text-white/50">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <a href={`mailto:${event.organizerProfile.email}`} className="hover:text-white transition-colors">
                        {event.organizerProfile.email}
                      </a>
                    </div>
                  )}
                  {event.organizerProfile?.phone && (
                    <div className="flex items-center gap-3 text-white/50">
                      <Phone className="h-4 w-4 text-emerald-400" />
                      <a href={`tel:${event.organizerProfile.phone}`} className="hover:text-white transition-colors">
                        {event.organizerProfile.phone}
                      </a>
                    </div>
                  )}
                  {event.organizerProfile?.website && (
                    <div className="flex items-center gap-3 text-white/50">
                      <Globe className="h-4 w-4 text-purple-400" />
                      <a 
                        href={event.organizerProfile.website.startsWith('http') ? event.organizerProfile.website : `https://${event.organizerProfile.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-white transition-colors flex items-center gap-1"
                      >
                        {event.organizerProfile.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {event.organizerProfile?.location && (
                    <div className="flex items-center gap-3 text-white/50">
                      <MapPin className="h-4 w-4 text-yellow-400" />
                      <span>{event.organizerProfile.location}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Social Media Links */}
              {event.organizerProfile?.showSocialLinks && (
                <div className="flex gap-3 flex-wrap">
                  {event.organizerProfile?.linkedinUrl && (
                    <a 
                      href={event.organizerProfile.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                  {event.organizerProfile?.twitterUrl && (
                    <a 
                      href={event.organizerProfile.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Twitter
                    </a>
                  )}
                  {event.organizerProfile?.facebookUrl && (
                    <a 
                      href={event.organizerProfile.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Facebook
                    </a>
                  )}
                  {event.organizerProfile?.instagramUrl && (
                    <a 
                      href={event.organizerProfile.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white">
                View More Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
} 