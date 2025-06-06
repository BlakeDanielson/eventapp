import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferralForm } from '../referral-form';

export function EventReferralSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Settings</CardTitle>
        <CardDescription>
          Set up referral tracking to grow your event attendance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReferralForm />
      </CardContent>
    </Card>
  );
} 