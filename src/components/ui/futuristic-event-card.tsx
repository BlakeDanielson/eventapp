import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { Calendar, MapPin, Users, Mail, MoreVertical, Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";


interface FuturisticEventCardProps {
  event: {
    id: string;
    title: string;
    bio: string;
    date: Date;
    time: string;
    location: string;
    status: string;
    _count: {
      registrations: number;
      invitees: number;
    };
  };
  delay?: number;
}

export function FuturisticEventCard({ event, delay = 0 }: FuturisticEventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusInfo = () => {
    const now = new Date();
    const eventDate = new Date(event.date);

    if (event.status === 'draft') {
      return {
        status: "draft",
        color: "from-gray-500 to-slate-500",
        glow: "shadow-gray-500/25",
        text: "Draft",
        pulse: false
      };
    } else if (event.status === 'cancelled') {
      return {
        status: "cancelled",
        color: "from-red-500 to-rose-500",
        glow: "shadow-red-500/25",
        text: "Cancelled",
        pulse: false
      };
    } else if (now < eventDate) {
      return {
        status: "upcoming",
        color: "from-blue-500 to-cyan-500",
        glow: "shadow-blue-500/25",
        text: "Upcoming",
        pulse: true
      };
    } else {
      return {
        status: "completed",
        color: "from-green-500 to-emerald-500",
        glow: "shadow-green-500/25",
        text: "Completed",
        pulse: false
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 120,
        damping: 20
      }}
      whileHover={{
        y: -8,
        rotateX: 2,
        rotateY: 2,
        scale: 1.01,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
      className="relative group cursor-pointer"
    >
      {/* Holographic glow */}
      <div 
        className={cn(
          "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-60 transition-all duration-500 blur-2xl",
          `bg-gradient-to-r ${statusInfo.color}`,
          statusInfo.glow
        )}
        style={{
          transform: "translateZ(-20px) scale(1.05)",
        }}
      />

      {/* Main card */}
      <div 
        className={cn(
          "relative rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden",
          "bg-gradient-to-br from-black/20 via-gray-900/30 to-black/40",
          "shadow-2xl",
          "transform-gpu"
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Animated border */}
        <div 
          className={cn(
            "absolute inset-0 rounded-3xl p-[1px]",
            `bg-gradient-to-r ${statusInfo.color}`,
            "opacity-50 group-hover:opacity-100 transition-opacity duration-500"
          )}
          style={{
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor"
          }}
        />

        {/* Status indicator */}
        <div className="absolute top-4 right-4 z-20">
          <motion.div
            animate={statusInfo.pulse ? { 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            } : {}}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md",
              `bg-gradient-to-r ${statusInfo.color}`,
              "text-white shadow-lg"
            )}
          >
            {statusInfo.text}
          </motion.div>
        </div>

        {/* Privacy indicator */}
        {event.status === 'private' && (
          <div className="absolute top-4 left-4 z-20">
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse shadow-lg shadow-purple-500/50" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-8 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">
                {event.title}
              </h3>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowActions(!showActions);
                }}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors duration-300"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            <p className="text-gray-300 text-sm line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
              {event.bio}
            </p>
          </div>

          {/* Event details */}
          <div className="space-y-3">
            <motion.div 
              animate={isHovered ? { x: 5 } : { x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-gray-400 text-sm"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </motion.div>

            <motion.div 
              animate={isHovered ? { x: 5 } : { x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-3 text-gray-400 text-sm"
            >
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="line-clamp-1">{event.location}</span>
            </motion.div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-2">
              <motion.div 
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-blue-400"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{event._count.registrations}</span>
                <span className="text-xs text-gray-500">registered</span>
              </motion.div>

              <motion.div 
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center gap-2 text-purple-400"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{event._count.invitees}</span>
                <span className="text-xs text-gray-500">invited</span>
              </motion.div>
            </div>
          </div>

          {/* Floating action menu */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute top-16 right-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 space-y-1 shadow-2xl z-30"
            >
              <Link href={`/event/${event.id}`}>
                <motion.div
                  whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-blue-400 transition-colors duration-300"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </motion.div>
              </Link>
              
              <Link href={`/edit-event/${event.id}`}>
                <motion.div
                  whileHover={{ x: 5, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-green-400 transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </motion.div>
              </Link>
              
              <motion.div
                whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-red-400 transition-colors duration-300 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </motion.div>
            </motion.div>
          )}

          {/* Scanning line effect */}
          {isHovered && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "100%", opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent skew-x-12"
              style={{ transform: "translateZ(10px)" }}
            />
          )}
        </div>

        {/* Holographic noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3Ccircle cx='33' cy='5' r='1'/%3E%3Ccircle cx='3' cy='23' r='1'/%3E%3Ccircle cx='25' cy='25' r='1'/%3E%3Ccircle cx='45' cy='45' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </motion.div>
  );
} 