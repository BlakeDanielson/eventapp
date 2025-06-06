import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useState } from "react";

interface FloatingStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
  className?: string;
}

export function FloatingStatsCard({
  title,
  value,
  description,
  icon,
  gradient,
  delay = 0,
  className
}: FloatingStatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        y: -10,
        rotateX: 5,
        rotateY: 5,
        scale: 1.02,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
      className={cn(
        "relative group cursor-pointer",
        className
      )}
    >
      {/* Floating glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
          gradient
        )}
        style={{
          transform: "translateZ(-10px) scale(1.1)",
        }}
      />
      
      {/* Main card */}
      <div 
        className={cn(
          "relative p-8 rounded-2xl border border-white/10 backdrop-blur-lg",
          "bg-gradient-to-br from-white/5 to-white/10",
          "shadow-2xl",
          "transform-gpu",
          "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:mask-composite before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
          "before:[mask-composite:xor]",
          isHovered && "before:from-white/40"
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Holographic shimmer */}
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "animate-pulse"
          )}
          style={{
            background: isHovered ? 
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)" :
              "transparent",
            animation: isHovered ? "shimmer 2s ease-in-out infinite" : "none",
          }}
        />

        {/* Content */}
        <div className="relative z-10 space-y-4">
          {/* Icon */}
          <motion.div
            animate={isHovered ? { 
              rotateY: 360,
              scale: 1.1 
            } : { 
              rotateY: 0,
              scale: 1 
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white",
              gradient
            )}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {icon}
          </motion.div>

          {/* Value */}
          <motion.div
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <div className="text-3xl font-bold text-white tracking-tight">
              {value}
            </div>
            <div className="text-sm font-medium text-gray-300">
              {title}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            animate={isHovered ? { opacity: 1 } : { opacity: 0.7 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-gray-400"
          >
            {description}
          </motion.div>
        </div>

        {/* Floating particles */}
        {isHovered && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className={cn(
                  "absolute w-1 h-1 rounded-full pointer-events-none",
                  gradient.includes("blue") && "bg-blue-400",
                  gradient.includes("green") && "bg-green-400",
                  gradient.includes("purple") && "bg-purple-400",
                  gradient.includes("orange") && "bg-orange-400"
                )}
                style={{
                  left: "50%",
                  top: "50%",
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
} 