import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferralForm } from '../referral-form';

export function EventReferralSection() {
  return (
    <Card className="border-zinc-800 bg-black rounded-lg shadow-none">
      <CardHeader>
        <CardTitle className="text-white">Referral Settings</CardTitle>
        <CardDescription className="text-zinc-400">
          Set up referral tracking to grow your event attendance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReferralForm />
      </CardContent>
    </Card>
  );
} 