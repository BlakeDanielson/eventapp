import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail } from 'lucide-react';
import { EventWithDetails } from '@/types/event';
import { Attendee, Invitee } from '@/types/attendee';

interface StatsCardsProps {
  event: EventWithDetails;
  filteredAttendees: Attendee[];
  invitees: Invitee[];
}

export function StatsCards({ event, filteredAttendees, invitees }: StatsCardsProps) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-4 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 hover:border-white/20 hover:shadow-lg hover:shadow-white/[0.03] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-300">
              <Users className="h-4 w-4 text-white/70 group-hover:text-white/90 transition-colors duration-300" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors duration-300">Total Registrations</p>
            <p className="text-2xl font-semibold text-white group-hover:text-white transition-colors duration-300">{event._count.registrations.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 hover:border-white/20 hover:shadow-lg hover:shadow-white/[0.03] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-emerald-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.12] group-hover:bg-emerald-500/[0.12] group-hover:border-emerald-500/[0.18] transition-all duration-300">
              <Users className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors duration-300">Confirmed</p>
            <p className="text-2xl font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">{filteredAttendees.filter(a => a.status === 'confirmed').length.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 hover:border-white/20 hover:shadow-lg hover:shadow-white/[0.03] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-300">
              <Users className="h-4 w-4 text-white/70 group-hover:text-white/90 transition-colors duration-300" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors duration-300">Pending</p>
            <p className="text-2xl font-semibold text-white group-hover:text-white transition-colors duration-300">{filteredAttendees.filter(a => a.status === 'registered').length.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>
      
      {event.status === 'private' && (
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 hover:border-white/20 hover:shadow-lg hover:shadow-white/[0.03] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-300">
                <Mail className="h-4 w-4 text-white/70 group-hover:text-white/90 transition-colors duration-300" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors duration-300">Total Invitees</p>
              <p className="text-2xl font-semibold text-white group-hover:text-white transition-colors duration-300">{invitees.length.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 