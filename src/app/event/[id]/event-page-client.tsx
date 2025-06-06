"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, Clock, Users, Share2, Heart, ArrowRight, Star, Ticket, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RegistrationForm } from '@/components/registration-form';
import { TicketPurchase } from '@/components/ticket-purchase';
import { EventWithOrganizer } from '@/types/event';
import { EventMap } from '@/components/event-map';
import { EnhancedLocationCard } from '@/components/enhanced-location-card';

const EventGallery = ({ imageUrl, title }: { imageUrl?: string; title: string }) => {
  const defaultImage = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80";
  
  return (
    <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl">
      <Image 
        src={imageUrl || defaultImage} 
        alt={title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
};

const EventAttendees = ({ count }: { count: number }) => {
  const maxCapacity = 200; // Default capacity
  const mockAttendees = Array.from({ length: Math.min(count, 5) }, (_, i) => ({
    name: `Attendee ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Attendees
        </CardTitle>
        <CardDescription>
          {count} people registered
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex -space-x-2 overflow-hidden mb-4">
          {mockAttendees.map((attendee, index) => (
            <Avatar key={index} className="border-2 border-background">
              <AvatarImage src={attendee.avatar} alt={attendee.name} />
              <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {count > 5 && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-muted text-muted-foreground text-xs font-medium">
              +{count - 5}
            </div>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((count / maxCapacity) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
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
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                Featured Event
              </Badge>
              {event.hasTickets && (
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                  <Ticket className="h-3 w-3 mr-1" />
                  Ticketed Event
                </Badge>
              )}
              {accessInfo?.reason === 'owner' && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <Users className="h-3 w-3 mr-1" />
                  Your Event
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 mb-4 text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{event.time}</span>
              </div>
            </div>
            <div className="flex items-center text-muted-foreground mb-6">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500 text-red-500" : "")} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <EventGallery imageUrl={event.imageUrl} title={event.title} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6 mb-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{event.bio}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* What to Expect Section */}
            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Premium Experience</h4>
                      <p className="text-sm text-muted-foreground">Carefully curated content and experiences</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Networking</h4>
                      <p className="text-sm text-muted-foreground">Connect with like-minded individuals</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Insights</h4>
                      <p className="text-sm text-muted-foreground">Gain valuable knowledge and perspectives</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Structured Agenda</h4>
                      <p className="text-sm text-muted-foreground">Well-planned schedule to maximize value</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Section */}
            <Card>
              <CardHeader>
                <CardTitle>Event Schedule</CardTitle>
                <CardDescription>Detailed timeline of activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{event.agenda}</div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Location Section with Weather */}
            <div className="space-y-6">
              <EnhancedLocationCard 
                location={event.location}
                eventTitle={event.title}
                eventDate={formattedDate}
                eventTime={event.time}
                organizerName={event.organizerProfile?.displayName}
              />
              
              {/* Interactive Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Map</CardTitle>
                  <CardDescription>Explore the event location in detail</CardDescription>
                </CardHeader>
                <CardContent>
                  <EventMap 
                    location={event.location}
                    eventTitle={event.title}
                    eventDate={formattedDate}
                    eventTime={event.time}
                    organizerName={event.organizerProfile?.displayName}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Q&A Section (if exists) */}
            {event.qa && (
              <Card>
                <CardHeader>
                  <CardTitle>Questions & Answers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap">{event.qa}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{event.time}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-right text-sm">{event.location}</span>
              </div>
            </CardContent>
            <CardFooter>
              {event.hasTickets ? (
                <div className="w-full">
                  <TicketPurchase event={event} eventId={eventId} />
                </div>
              ) : (
                <RegistrationForm eventId={eventId} event={event} accessInfo={accessInfo} />
              )}
            </CardFooter>
          </Card>
          
          <EventAttendees count={registrationCount} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Event Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {event.organizerProfile?.profileImageUrl ? (
                    <AvatarImage 
                      src={event.organizerProfile.profileImageUrl} 
                      alt={event.organizerProfile.displayName || 'Organizer'} 
                    />
                  ) : null}
                  <AvatarFallback>
                    {event.organizerProfile?.displayName 
                      ? event.organizerProfile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                      : 'EA'
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {event.organizerProfile?.displayName || 'EventApp'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">
                  {event.organizerProfile.bio}
                </p>
              )}
              {!event.organizerProfile?.bio && (
                <p className="text-sm text-muted-foreground">
                  Creating memorable experiences and bringing people together through thoughtfully organized events.
                </p>
              )}
              
              {/* Contact Information */}
              {event.organizerProfile?.showContactInfo && (
                <div className="space-y-2">
                  {event.organizerProfile?.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📧</span>
                      <a href={`mailto:${event.organizerProfile.email}`} className="hover:text-foreground">
                        {event.organizerProfile.email}
                      </a>
                    </div>
                  )}
                  {event.organizerProfile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📞</span>
                      <a href={`tel:${event.organizerProfile.phone}`} className="hover:text-foreground">
                        {event.organizerProfile.phone}
                      </a>
                    </div>
                  )}
                  {event.organizerProfile?.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🌐</span>
                      <a 
                        href={event.organizerProfile.website.startsWith('http') ? event.organizerProfile.website : `https://${event.organizerProfile.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-foreground"
                      >
                        {event.organizerProfile.website}
                      </a>
                    </div>
                  )}
                  {event.organizerProfile?.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{event.organizerProfile.location}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Social Media Links */}
              {event.organizerProfile?.showSocialLinks && (
                <div className="flex gap-2 flex-wrap">
                  {event.organizerProfile?.linkedinUrl && (
                    <a 
                      href={event.organizerProfile.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      LinkedIn
                    </a>
                  )}
                  {event.organizerProfile?.twitterUrl && (
                    <a 
                      href={event.organizerProfile.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600 text-sm"
                    >
                      Twitter
                    </a>
                  )}
                  {event.organizerProfile?.facebookUrl && (
                    <a 
                      href={event.organizerProfile.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 text-sm"
                    >
                      Facebook
                    </a>
                  )}
                  {event.organizerProfile?.instagramUrl && (
                    <a 
                      href={event.organizerProfile.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 text-sm"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" size="sm">
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