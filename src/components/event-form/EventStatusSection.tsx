import { useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Settings, Users, Plus, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EventFormData } from '@/types/forms';

interface EventStatusSectionProps {
  control: Control<EventFormData>;
  onInviteesChange?: (invitees: string[]) => void;
}

export function EventStatusSection({ control, onInviteesChange }: EventStatusSectionProps) {
  const [invitees, setInvitees] = useState<string[]>([]);
  const [newInvitee, setNewInvitee] = useState('');
  
  // Watch the status value to conditionally show invitee management
  const status = useWatch({ control, name: 'status' });
  
  const addInvitee = () => {
    if (newInvitee && !invitees.includes(newInvitee)) {
      const updatedInvitees = [...invitees, newInvitee];
      setInvitees(updatedInvitees);
      setNewInvitee('');
      console.log('🔍 EventStatusSection DEBUG: Adding invitee:', newInvitee);
      console.log('🔍 EventStatusSection DEBUG: Updated invitees:', updatedInvitees);
      console.log('🔍 EventStatusSection DEBUG: onInviteesChange callback exists:', !!onInviteesChange);
      onInviteesChange?.(updatedInvitees);
    }
  };
  
  const removeInvitee = (email: string) => {
    const updatedInvitees = invitees.filter(inv => inv !== email);
    setInvitees(updatedInvitees);
    onInviteesChange?.(updatedInvitees);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInvitee();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Event Status
          </CardTitle>
          <CardDescription>
            Control who can see your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publication Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public - Visible to everyone with the link</SelectItem>
                    <SelectItem value="private">Private - Only visible to invitees</SelectItem>
                    <SelectItem value="draft">Draft - Only visible to you</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  <span className="block mb-1"><strong>Public:</strong> Anyone with the link can view and register</span>
                  <span className="block mb-1"><strong>Private:</strong> Only people you invite can view the event</span>
                  <span className="block"><strong>Draft:</strong> Event is hidden while you work on it</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Invitee Management - Only show for private events */}
      {status === 'private' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Invitees
            </CardTitle>
            <CardDescription>
              Add email addresses of people who should have access to this private event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newInvitee}
                onChange={(e) => setNewInvitee(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addInvitee}
                disabled={!newInvitee}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {invitees.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Invited People ({invitees.length})</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {invitees.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvitee(email)}
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 