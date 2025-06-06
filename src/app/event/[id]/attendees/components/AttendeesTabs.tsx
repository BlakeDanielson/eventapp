import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { EventWithDetails } from '@/types/event';
import { StatusBadge } from './StatusBadge';

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

interface AttendeesTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredAttendees: Attendee[];
  filteredInvitees: Invitee[];
  inviteesLoading: boolean;
  selectedAttendees: string[];
  setSelectedAttendees: React.Dispatch<React.SetStateAction<string[]>>;
  selectedInvitees: string[];
  setSelectedInvitees: React.Dispatch<React.SetStateAction<string[]>>;
  searchTerm: string;
  statusFilter: string;
  event: EventWithDetails;
}

export function AttendeesTabs({
  activeTab,
  setActiveTab,
  filteredAttendees,
  filteredInvitees,
  inviteesLoading,
  selectedAttendees,
  setSelectedAttendees,
  selectedInvitees,
  setSelectedInvitees,
  searchTerm,
  statusFilter,
  event
}: AttendeesTabsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleSelectAll = (type: 'attendees' | 'invitees') => {
    if (type === 'attendees') {
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

  const toggleSelect = (id: string, type: 'attendees' | 'invitees') => {
    if (type === 'attendees') {
      setSelectedAttendees((prev: string[]) => 
        prev.includes(id) 
          ? prev.filter((selectedId: string) => selectedId !== id)
          : [...prev, id]
      );
    } else {
      setSelectedInvitees((prev: string[]) => 
        prev.includes(id) 
          ? prev.filter((selectedId: string) => selectedId !== id)
          : [...prev, id]
      );
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border-b border-white/[0.08] rounded-none">
          <TabsTrigger 
            value="attendees"
            className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/60 hover:text-white/80 border-none transition-all duration-200"
          >
            Attendees ({filteredAttendees.length})
          </TabsTrigger>
          {event.status === 'private' && (
            <TabsTrigger 
              value="invitees"
              className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/60 hover:text-white/80 border-none transition-all duration-200"
            >
              Invitees ({filteredInvitees.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="attendees" className="mt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.08] hover:bg-white/[0.02]">
                  <TableHead className="w-[50px] text-white/70">
                    <Checkbox
                      checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                      onCheckedChange={() => toggleSelectAll('attendees')}
                      className="border-white/[0.08] data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                  </TableHead>
                  <TableHead className="text-white/70">Name</TableHead>
                  <TableHead className="text-white/70">Email</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Registration Date</TableHead>
                  <TableHead className="text-white/70">Referral Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendees.map((attendee) => (
                  <TableRow 
                    key={attendee.id} 
                    className="border-white/[0.08] hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedAttendees.includes(attendee.id)}
                        onCheckedChange={() => toggleSelect(attendee.id, 'attendees')}
                        className="border-white/[0.08] data-[state=checked]:bg-white data-[state=checked]:text-black"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-white">{attendee.name}</TableCell>
                    <TableCell className="text-white/70">{attendee.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={attendee.status} />
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(attendee.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {attendee.referral?.name || 'Direct'}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAttendees.length === 0 && (
                  <TableRow className="border-white/[0.08]">
                    <TableCell colSpan={6} className="text-center text-white/50 py-8">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No attendees match your search criteria'
                        : 'No attendees yet'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {event.status === 'private' && (
          <TabsContent value="invitees" className="mt-0">
            {inviteesLoading ? (
              <div className="flex items-center justify-center py-16">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-white" />
                  <p className="text-white/60 text-sm">Loading invitees...</p>
                </motion.div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.08] hover:bg-white/[0.02]">
                      <TableHead className="w-[50px] text-white/70">
                        <Checkbox
                          checked={selectedInvitees.length === filteredInvitees.length && filteredInvitees.length > 0}
                          onCheckedChange={() => toggleSelectAll('invitees')}
                          className="border-white/[0.08] data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                      </TableHead>
                      <TableHead className="text-white/70">Email</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Invite Token</TableHead>
                      <TableHead className="text-white/70">Access Date</TableHead>
                      <TableHead className="text-white/70">Referrals</TableHead>
                      <TableHead className="text-white/70">Invite Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvitees.map((invitee) => (
                      <TableRow 
                        key={invitee.id} 
                        className="border-white/[0.08] hover:bg-white/[0.02] transition-colors duration-200"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedInvitees.includes(invitee.id)}
                            onCheckedChange={() => toggleSelect(invitee.id, 'invitees')}
                            className="border-white/[0.08] data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-white">{invitee.email}</TableCell>
                        <TableCell>
                          <StatusBadge status={invitee.hasAccessed ? 'accessed' : 'pending'} />
                        </TableCell>
                        <TableCell className="text-white/70 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span>{invitee.inviteToken.slice(0, 8)}...</span>
                            <button
                              onClick={() => copyToClipboard(invitee.inviteToken)}
                              className="text-white/50 hover:text-white/80 transition-colors duration-200"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/70">
                          {invitee.accessedAt ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              {new Date(invitee.accessedAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-white/50">Not accessed</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white/70">{invitee.referredCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(invitee.inviteLink)}
                              className="text-white/50 hover:text-white/80 transition-colors duration-200"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <a
                              href={invitee.inviteLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/50 hover:text-white/80 transition-colors duration-200"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvitees.length === 0 && (
                      <TableRow className="border-white/[0.08]">
                        <TableCell colSpan={7} className="text-center text-white/50 py-8">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'No invitees match your search criteria'
                            : 'No invitees yet'
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
} 