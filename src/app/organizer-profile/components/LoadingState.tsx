"use client";

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState() {
  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader>
        <Skeleton className="h-6 w-48 bg-white/[0.05]" />
        <Skeleton className="h-4 w-64 bg-white/[0.05]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full bg-white/[0.05]" />
        <Skeleton className="h-4 w-3/4 bg-white/[0.05]" />
        <Skeleton className="h-4 w-1/2 bg-white/[0.05]" />
      </CardContent>
    </Card>
  );
} 