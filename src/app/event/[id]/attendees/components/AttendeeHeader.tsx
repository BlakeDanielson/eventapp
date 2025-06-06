import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { EventWithDetails } from '@/types/event';

interface AttendeeHeaderProps {
  event?: EventWithDetails | null;
}

export function AttendeeHeader({ event }: AttendeeHeaderProps) {
  return (
    <header className="border-b border-white/[0.08] bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] transition-all duration-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white flex items-center gap-3">
                <Users className="h-5 w-5" />
                Attendee Management
              </h1>
              {event && (
                <p className="text-sm text-white/50 mt-0.5">
                  {event.title}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
} 