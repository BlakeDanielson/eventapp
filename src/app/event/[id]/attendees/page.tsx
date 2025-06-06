'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EventWithDetails } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Download, 
  Search, 
  Filter, 
  Send,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

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
  const router = useRouter();
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteesLoading, setInviteesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('attendees');

  useEffect(() => {
    if (params.id) {
      fetchEventWithAttendees();
      fetchInvitees();
    }
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
          // Event not found or no invitees - this is ok for public events
          setInvitees([]);
          return;
        }
        throw new Error('Failed to load invitees');
      }
      
      const data = await response.json();
      setInvitees(data.invitees || []);
    } catch (error) {
      console.error('Error fetching invitees:', error);
      // Don't set error for invitees failure - just log it
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
    // For invitees, we can filter by access status
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'accessed' && invitee.hasAccessed) ||
                         (statusFilter === 'pending' && !invitee.hasAccessed);
    return matchesSearch && matchesStatus;
  });

  const handleSelectAttendee = (attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const handleSelectAll = () => {
    if (activeTab === 'attendees') {
      if (selectedAttendees.length === filteredAttendees.length) {
        setSelectedAttendees([]);
      } else {
        setSelectedAttendees(filteredAttendees.map(a => a.id));
      }
    } else {
      if (selectedInvitees.length === filteredInvitees.length) {
        setSelectedInvitees([]);
      } else {
        setSelectedInvitees(filteredInvitees.map(i => i.id));
      }
    }
  };

  const handleSelectInvitee = (inviteeId: string) => {
    setSelectedInvitees(prev => 
      prev.includes(inviteeId) 
        ? prev.filter(id => id !== inviteeId)
        : [...prev, inviteeId]
    );
  };

  const handleBulkEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert('Please enter both subject and message');
      return;
    }

    setSendingEmail(true);
    try {
      let selectedEmails: string[] = [];
      
      if (activeTab === 'attendees') {
        selectedEmails = filteredAttendees
          .filter(attendee => selectedAttendees.includes(attendee.id))
          .map(attendee => attendee.email);
      } else {
        selectedEmails = filteredInvitees
          .filter(invitee => selectedInvitees.includes(invitee.id))
          .map(invitee => invitee.email);
      }

      // TODO: Implement bulk email API endpoint
      const response = await fetch(`/api/events/${params.id}/bulk-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: selectedEmails,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      setBulkEmailOpen(false);
      setEmailSubject('');
      setEmailMessage('');
      if (activeTab === 'attendees') {
        setSelectedAttendees([]);
      } else {
        setSelectedInvitees([]);
      }
      alert(`Successfully sent emails to ${selectedEmails.length} ${activeTab}!`);
    } catch (error) {
      console.error('Error sending bulk email:', error);
      alert('Failed to send emails. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleExportAttendees = () => {
    if (!event) return;

    const csvContent = [
      ['Name', 'Email', 'Status', 'Registration Date', 'Referral Source'].join(','),
      ...filteredAttendees.map(attendee => [
        attendee.name,
        attendee.email,
        attendee.status,
        new Date(attendee.createdAt).toLocaleDateString(),
        attendee.referral?.name || 'Direct'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading attendees...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Event not found'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-8 w-8" />
                Attendee Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage registrations for "{event.title}"
              </p>
            </div>
          </div>

          {/* Event Summary */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-semibold">Total Registrations</p>
                    <p className="text-sm text-gray-600">{event._count.registrations} attendees</p>
                  </div>
                </div>
                {event.status === 'private' && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-semibold">Total Invitees</p>
                      <p className="text-sm text-gray-600">{invitees.length} invited</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tools */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Attendee Tools</CardTitle>
              <CardDescription>
                Filter, email, and export your attendee list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {activeTab === 'attendees' ? (
                      <>
                        <SelectItem value="registered">Registered</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="accessed">Accessed Event</SelectItem>
                        <SelectItem value="pending">Pending Access</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Dialog open={bulkEmailOpen} onOpenChange={setBulkEmailOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={
                        activeTab === 'attendees' 
                          ? selectedAttendees.length === 0 
                          : selectedInvitees.length === 0
                      }
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email Selected ({
                        activeTab === 'attendees' 
                          ? selectedAttendees.length 
                          : selectedInvitees.length
                      })
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send Bulk Email</DialogTitle>
                      <DialogDescription>
                        Send an email to {
                          activeTab === 'attendees' 
                            ? selectedAttendees.length 
                            : selectedInvitees.length
                        } selected {activeTab === 'attendees' ? 'attendees' : 'invitees'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Email subject"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          placeholder="Your message to attendees..."
                          rows={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBulkEmailOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkEmail} disabled={sendingEmail}>
                        {sendingEmail ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Email
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  onClick={handleExportAttendees}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendees and Invitees Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                Manage registered attendees and invited people
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="attendees">
                    Registered Attendees ({filteredAttendees.length})
                  </TabsTrigger>
                  <TabsTrigger value="invitees">
                    Invitees ({filteredInvitees.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="attendees" className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Registered Attendees</h3>
                      <p className="text-sm text-gray-600">
                        {selectedAttendees.length > 0 && `${selectedAttendees.length} selected`}
                      </p>
                    </div>
                    {filteredAttendees.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedAttendees.length === filteredAttendees.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                  </div>
                  
                  {filteredAttendees.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No attendees match your filters' 
                          : 'No attendees registered yet'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAttendees.map((attendee) => (
                        <div key={attendee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedAttendees.includes(attendee.id)}
                              onCheckedChange={() => handleSelectAttendee(attendee.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{attendee.name}</p>
                                <Badge variant={attendee.status === 'registered' ? 'default' : 'secondary'}>
                                  {attendee.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{attendee.email}</p>
                              {attendee.referral && (
                                <div className="flex items-center gap-1 mt-1">
                                  <UserPlus className="h-3 w-3 text-purple-500" />
                                  <span className="text-xs text-purple-600">
                                    Referred by {attendee.referral.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Registered {formatDate(attendee.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="invitees" className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Invited People</h3>
                      <p className="text-sm text-gray-600">
                        {selectedInvitees.length > 0 && `${selectedInvitees.length} selected`}
                      </p>
                    </div>
                    {filteredInvitees.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedInvitees.length === filteredInvitees.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                  </div>
                  
                  {inviteesLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading invitees...</p>
                    </div>
                  ) : filteredInvitees.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No invitees match your filters' 
                          : event?.status === 'private' 
                            ? 'No invitees added yet'
                            : 'This is a public event - no invitees'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredInvitees.map((invitee) => (
                        <div key={invitee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedInvitees.includes(invitee.id)}
                              onCheckedChange={() => handleSelectInvitee(invitee.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{invitee.email}</p>
                                <Badge variant={invitee.hasAccessed ? 'default' : 'secondary'}>
                                  {invitee.hasAccessed ? 'Accessed' : 'Pending'}
                                </Badge>
                                {invitee.referredCount > 0 && (
                                  <Badge variant="outline" className="text-purple-600">
                                    {invitee.referredCount} referrals
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                Invite Token: {invitee.inviteToken}
                              </p>
                              {invitee.hasAccessed && invitee.accessedAt && (
                                <p className="text-xs text-green-600">
                                  Accessed: {formatDate(invitee.accessedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Invited {formatDate(invitee.createdAt)}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-1"
                              onClick={() => {
                                navigator.clipboard.writeText(invitee.inviteLink);
                                alert('Invite link copied to clipboard!');
                              }}
                            >
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 