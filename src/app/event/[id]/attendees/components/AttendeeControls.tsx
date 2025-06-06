import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Mail, Download, Send, Loader2 } from 'lucide-react';

// Define proper types for attendees and invitees
interface Attendee {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  referral?: {
    name: string;
  };
}

interface Invitee {
  id: string;
  email: string;
  hasAccessed: boolean;
  inviteToken: string;
  accessedAt?: string;
  referredCount: number;
  inviteLink: string;
}

interface AttendeeControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  activeTab: string;
  selectedAttendees: string[];
  selectedInvitees: string[];
  filteredAttendees: Attendee[];
  filteredInvitees: Invitee[];
  eventId: string;
  onEmailSuccess: () => void;
}

export function AttendeeControls({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  activeTab,
  selectedAttendees,
  selectedInvitees,
  filteredAttendees,
  filteredInvitees,
  eventId,
  onEmailSuccess
}: AttendeeControlsProps) {
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

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

      const response = await fetch(`/api/events/${eventId}/bulk-email`, {
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
        throw new Error('Failed to send bulk email');
      }

      alert('Bulk email sent successfully!');
      setBulkEmailOpen(false);
      setEmailSubject('');
      setEmailMessage('');
      onEmailSuccess();
    } catch (error) {
      console.error('Error sending bulk email:', error);
      alert('Failed to send bulk email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleExportAttendees = () => {
    const dataToExport = activeTab === 'attendees' ? filteredAttendees : filteredInvitees;
    
    const csvContent = [
      activeTab === 'attendees' 
        ? ['Name', 'Email', 'Status', 'Registration Date', 'Referral']
        : ['Email', 'Status', 'Invite Token', 'Access Date', 'Referrals'],
      ...dataToExport.map(item => 
        activeTab === 'attendees' 
          ? [
              (item as Attendee).name,
              (item as Attendee).email,
              (item as Attendee).status,
              new Date((item as Attendee).createdAt).toLocaleDateString(),
              (item as Attendee).referral?.name || 'None'
            ]
          : [
              (item as Invitee).email,
              (item as Invitee).hasAccessed ? 'Accessed' : 'Pending',
              (item as Invitee).inviteToken,
              (item as Invitee).accessedAt ? new Date((item as Invitee).accessedAt!).toLocaleDateString() : 'N/A',
              (item as Invitee).referredCount.toString()
            ]
      )
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-white/[0.08] text-white placeholder:text-white/50 hover:border-white/[0.12] focus:border-white/20 focus:ring-white/10 transition-all duration-200"
          />
        </div>
        
        {/* Filter and Actions */}
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-black/40 border-white/[0.08] text-white hover:border-white/[0.12] focus:border-white/20 focus:ring-white/10 transition-all duration-200">
              <Filter className="h-4 w-4 mr-2 text-white/50" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/[0.08]">
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

          <Dialog open={bulkEmailOpen} onOpenChange={setBulkEmailOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                disabled={
                  activeTab === 'attendees' 
                    ? selectedAttendees.length === 0 
                    : selectedInvitees.length === 0
                }
                className="border-white/[0.08] bg-black/40 hover:bg-white/[0.05] hover:border-white/[0.12] text-white transition-all duration-200"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email ({
                  activeTab === 'attendees' 
                    ? selectedAttendees.length 
                    : selectedInvitees.length
                })
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-white/[0.08] text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Send Bulk Email</DialogTitle>
                <DialogDescription className="text-white/60">
                  Send an email to {
                    activeTab === 'attendees' 
                      ? selectedAttendees.length 
                      : selectedInvitees.length
                  } selected {activeTab === 'attendees' ? 'attendees' : 'invitees'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white">Subject</label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject"
                    className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50 hover:border-white/[0.12] focus:border-white/20 focus:ring-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white">Message</label>
                  <Textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Email message"
                    rows={4}
                    className="bg-black/40 border-white/[0.08] text-white placeholder:text-white/50 hover:border-white/[0.12] focus:border-white/20 focus:ring-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setBulkEmailOpen(false)}
                  className="border-white/[0.08] bg-black/40 hover:bg-white/[0.05] hover:border-white/[0.12] text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkEmail}
                  disabled={sendingEmail}
                  className="bg-white text-black hover:bg-white/90"
                >
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
            className="border-white/[0.08] bg-black/40 hover:bg-white/[0.05] hover:border-white/[0.12] text-white transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 