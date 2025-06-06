'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Palette, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function DashboardComparison() {
  const pathname = usePathname();
  const isAceternity = pathname === '/dashboard-aceternity';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-2 flex items-center gap-2">
        <span className="text-sm text-white/80 px-2">
          {isAceternity ? 'Aceternity UI' : 'Shadcn UI'}
        </span>
        
        {isAceternity ? (
          <Link href="/dashboard">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Palette className="h-4 w-4" />
              View Shadcn
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard-aceternity">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 bg-black/10 border-gray-300 text-gray-700 hover:bg-black/20"
            >
              <Sparkles className="h-4 w-4" />
              View Aceternity
              <ArrowLeft className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
} 