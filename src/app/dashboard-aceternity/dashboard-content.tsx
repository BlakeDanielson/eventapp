'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useMemo } from 'react';
import { useEventOperations } from '@/hooks/useEventOperations';
import { FuturisticEventCard } from '@/components/ui/futuristic-event-card';
import { motion } from 'framer-motion';

export function DashboardContent() {
  const { isLoaded, isSignedIn } = useUser();
  const { events, loading, fetchEvents } = useEventOperations();

  useEffect(() => {
    // Only fetch events if user is authenticated
    if (isLoaded && isSignedIn) {
      fetchEvents();
    }
  }, [fetchEvents, isLoaded, isSignedIn]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-800/20 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-20"
      >
        <div className="relative">
          {/* Holographic background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
          
          <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center"
            >
              <div className="text-4xl text-gray-400">📅</div>
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              No Events Yet
            </h3>
            <p className="text-gray-400 mb-8">
              Ready to create your first event? Start building amazing experiences for your community.
            </p>
            
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden inline-block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl border border-white/20 backdrop-blur-lg shadow-2xl">
                Create Your First Event
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {events.map((event, index) => (
          <FuturisticEventCard
            key={event.id}
            event={event}
            delay={index * 0.1}
          />
        ))}
      </motion.div>
    </div>
  );
} 