import { useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Users, Plus, X, Shield } from 'lucide-react';
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
  
  // Watch the status value for informational purposes
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

  const getInviteeDescription = () => {
    switch (status) {
      case 'private':
        return 'Add email addresses of people who should have access to this private event';
      case 'public':
        return 'Track specific invitees, VIP guests, or people you want to personally invite';
      case 'draft':
        return 'Prepare your invite list while your event is in draft mode';
      default:
        return 'Manage your event invite list';
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-zinc-800 bg-black rounded-lg shadow-none">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">
                Event Privacy
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                Control who can discover and access your event
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium text-white">
                  Publication Status
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="public" className="text-white hover:bg-zinc-800">🌍 Public - Visible to everyone with the link</SelectItem>
                    <SelectItem value="private" className="text-white hover:bg-zinc-800">🔒 Private - Only visible to invitees</SelectItem>
                    <SelectItem value="draft" className="text-white hover:bg-zinc-800">📝 Draft - Only visible to you</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-sm text-zinc-500 space-y-1">
                  <span className="block"><strong>🌍 Public:</strong> Anyone with the link can view and register</span>
                  <span className="block"><strong>🔒 Private:</strong> Only people you invite can view the event</span>
                  <span className="block"><strong>📝 Draft:</strong> Event is hidden while you work on it</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Invitee Management - Now visible for all event statuses */}
      <Card className="border-zinc-800 bg-black rounded-lg shadow-none">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-black" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">
                Manage Invitees
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                {getInviteeDescription()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter email address"
              value={newInvitee}
              onChange={(e) => setNewInvitee(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-12 bg-zinc-900 border-zinc-800 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder:text-zinc-500"
            />
            <Button
              type="button"
              onClick={addInvitee}
              disabled={!newInvitee}
              className="h-12 px-6 bg-white hover:bg-zinc-100 text-black rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          {invitees.length > 0 && (
            <div className="space-y-4">
              <FormLabel className="text-base font-medium text-white">
                Invited People ({invitees.length})
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {invitees.map((email) => (
                  <Badge 
                    key={email} 
                    variant="secondary" 
                    className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-2 rounded-lg"
                  >
                    {email}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvitee(email)}
                      className="h-4 w-4 p-0 hover:bg-zinc-800 hover:text-red-400 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {invitees.length === 0 && (
            <div className="text-center py-8 bg-zinc-900 rounded-lg border border-zinc-800">
              <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium mb-2">No invitees yet</p>
              <p className="text-sm text-zinc-500">Add email addresses above to start building your guest list</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 