import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    registered: "bg-white/[0.08] text-white/70 border-white/[0.12]",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    accessed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-white/[0.08] text-white/60 border-white/[0.08]",
  };

  const variant = status as keyof typeof statusStyles;
  
  return (
    <Badge 
      variant="outline" 
      className={`${statusStyles[variant] || "bg-white/[0.08] text-white/60 border-white/[0.08]"} capitalize border hover:bg-opacity-80 transition-all duration-200`}
    >
      {status}
    </Badge>
  );
} 