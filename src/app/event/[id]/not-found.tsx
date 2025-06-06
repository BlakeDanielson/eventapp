import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Event Not Found</h1>
        <p className="text-lg text-gray-600">
          The event you're looking for doesn't exist or may have been removed.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </main>
  );
} 