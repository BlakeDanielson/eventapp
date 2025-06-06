import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { EventWithDetails } from '@/types/event';

interface EventInfoProps {
  event: EventWithDetails;
}

export function EventInfo({ event }: EventInfoProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="grid md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
            <Calendar className="h-4 w-4 text-white/70" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Date & Time</p>
            <p className="text-sm text-white/60">
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
            <MapPin className="h-4 w-4 text-white/70" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Location</p>
            <p className="text-sm text-white/60">{event.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
            <Users className="h-4 w-4 text-white/70" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Event Type</p>
            <p className="text-sm text-white/60 capitalize">{event.status}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 