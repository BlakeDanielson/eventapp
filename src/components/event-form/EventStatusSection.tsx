import { useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Settings, Users, Plus, X, Shield } from 'lucide-react';
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
      <Card className="border-0 shadow-none bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Event Privacy
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
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
                <FormLabel className="text-base font-medium text-gray-900">
                  Publication Status
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">🌍 Public - Visible to everyone with the link</SelectItem>
                    <SelectItem value="private">🔒 Private - Only visible to invitees</SelectItem>
                    <SelectItem value="draft">📝 Draft - Only visible to you</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-sm text-gray-500 space-y-1">
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
      <Card className="border-0 shadow-none bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-rose-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Manage Invitees
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
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
              className="flex-1 h-12 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-rose-500 focus:ring-rose-500/20 rounded-lg"
            />
            <Button
              type="button"
              onClick={addInvitee}
              disabled={!newInvitee}
              className="h-12 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          {invitees.length > 0 && (
            <div className="space-y-4">
              <FormLabel className="text-base font-medium text-gray-900">
                Invited People ({invitees.length})
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {invitees.map((email) => (
                  <Badge 
                    key={email} 
                    variant="secondary" 
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 px-3 py-2 rounded-lg"
                  >
                    {email}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvitee(email)}
                      className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {invitees.length === 0 && (
            <div className="text-center py-8 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No invitees added yet. Start building your guest list!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 