'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EventWithDetails } from '@/types/event';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import our new components
import { AttendeeHeader } from './components/AttendeeHeader';
import { StatsCards } from './components/StatsCards';
import { EventInfo } from './components/EventInfo';
import { AttendeeControls } from './components/AttendeeControls';
import { AttendeesTabs } from './components/AttendeesTabs';

interface Invitee {
  id: string;
  email: string;
  inviteToken: string;
  hasAccessed: boolean;
  accessedAt: Date | null;
  referredCount: number;
  createdAt: Date;
  inviteLink: string;
}

export default function AttendeeManagementPage() {
  const params = useParams();

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteesLoading, setInviteesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('attendees');

  useEffect(() => {
    if (params.id) {
      fetchEventWithAttendees();
      fetchInvitees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchEventWithAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/events/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - please sign in');
        }
        throw new Error('Failed to load event');
      }
      
      const eventData = await response.json();
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitees = async () => {
    try {
      setInviteesLoading(true);
      
      const response = await fetch(`/api/events/${params.id}/invitees`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setInvitees([]);
          return;
        }
        throw new Error('Failed to load invitees');
      }
      
      const data = await response.json();
      setInvitees(data.invitees || []);
    } catch (error) {
      console.error('Error fetching invitees:', error);
      setInvitees([]);
    } finally {
      setInviteesLoading(false);
    }
  };

  const filteredAttendees = event?.registrations.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attendee.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredInvitees = invitees.filter(invitee => {
    const matchesSearch = invitee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'accessed' && invitee.hasAccessed) ||
                         (statusFilter === 'pending' && !invitee.hasAccessed);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
              <p className="text-white/60">Loading attendees...</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <AttendeeHeader />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>
                  {error || 'Event not found'}
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AttendeeHeader event={event} />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <StatsCards 
            event={event} 
            filteredAttendees={filteredAttendees}
            invitees={invitees}
          />

          <EventInfo event={event} />

          <AttendeeControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            activeTab={activeTab}
            selectedAttendees={selectedAttendees}
            selectedInvitees={selectedInvitees}
            filteredAttendees={filteredAttendees}
            filteredInvitees={filteredInvitees}
            eventId={params.id as string}
            onEmailSuccess={() => {
              setSelectedAttendees([]);
              setSelectedInvitees([]);
            }}
          />

          <AttendeesTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredAttendees={filteredAttendees}
            filteredInvitees={filteredInvitees}
            inviteesLoading={inviteesLoading}
            selectedAttendees={selectedAttendees}
            setSelectedAttendees={setSelectedAttendees}
            selectedInvitees={selectedInvitees}
            setSelectedInvitees={setSelectedInvitees}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            event={event}
          />

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-sm text-white/60">
            <p>
              Showing {activeTab === 'attendees' ? filteredAttendees.length : filteredInvitees.length} of{" "}
              {activeTab === 'attendees' ? event._count.registrations : invitees.length} {activeTab}
            </p>
            <p>
              {activeTab === 'attendees' ? selectedAttendees.length : selectedInvitees.length} selected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 