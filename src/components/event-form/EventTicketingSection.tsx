import { useState } from 'react';
import { Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { EventFormData } from '@/types/forms';

export interface TicketData {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  maxQuantity?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isActive: boolean;
  allowMultiple: boolean;
}

export interface EventTicketingSectionProps {
  control: Control<EventFormData>;
  onTicketsChange?: (tickets: TicketData[]) => void;
}

export function EventTicketingSection({ onTicketsChange }: EventTicketingSectionProps) {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [hasTickets, setHasTickets] = useState(false);



  const addTicket = () => {
    const newTicket: TicketData = {
      name: `Ticket ${tickets.length + 1}`,
      description: '',
      price: 0,
      currency: 'USD',
      isActive: true,
      allowMultiple: true,
    };
    
    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    onTicketsChange?.(updatedTickets);
  };

  const removeTicket = (index: number) => {
    const updatedTickets = tickets.filter((_, i) => i !== index);
    setTickets(updatedTickets);
    onTicketsChange?.(updatedTickets);
  };

  const updateTicket = (index: number, updates: Partial<TicketData>) => {
    const updatedTickets = tickets.map((ticket, i) => 
      i === index ? { ...ticket, ...updates } : ticket
    );
    setTickets(updatedTickets);
    onTicketsChange?.(updatedTickets);
  };

  const handleHasTicketsChange = (enabled: boolean) => {
    setHasTickets(enabled);
    if (!enabled) {
      setTickets([]);
      onTicketsChange?.([]);
    } else if (tickets.length === 0) {
      // Add a default free ticket
      const defaultTicket: TicketData = {
        name: 'General Admission',
        description: 'Standard event attendance',
        price: 0,
        currency: 'USD',
        isActive: true,
        allowMultiple: true,
      };
      setTickets([defaultTicket]);
      onTicketsChange?.([defaultTicket]);
    }
  };

  return (
    <Card className="border-zinc-800 bg-black rounded-lg shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-white">
              Ticketing & Pricing
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Configure ticket types and pricing for your event. You can offer free or paid tickets.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enable Ticketing Toggle */}
        <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-900">
          <div className="space-y-1">
            <div className="font-medium text-white">Enable Ticketing</div>
            <div className="text-sm text-zinc-400">
              Require attendees to get tickets (free or paid) to register for your event
            </div>
          </div>
          <Switch
            checked={hasTickets}
            onCheckedChange={handleHasTicketsChange}
          />
        </div>

        {hasTickets && (
          <div className="space-y-4">
            {/* Tickets List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Ticket Types</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTicket}
                  className="flex items-center gap-2 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Ticket
                </Button>
              </div>

              {tickets.length === 0 && (
                <div className="text-center py-8 text-zinc-400">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tickets configured yet.</p>
                  <p className="text-sm">Click &quot;Add Ticket&quot; to create your first ticket type.</p>
                </div>
              )}

              {tickets.map((ticket, index) => (
                <Card key={index} className="border border-zinc-800 bg-zinc-900 border-l-4 border-l-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base text-white">{ticket.name || `Ticket ${index + 1}`}</CardTitle>
                        {ticket.price === 0 && (
                          <Badge variant="secondary">Free</Badge>
                        )}
                        {ticket.price > 0 && (
                          <Badge variant="default">${ticket.price} {ticket.currency}</Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicket(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Ticket Name *</label>
                        <Input
                          value={ticket.name}
                          onChange={(e) => updateTicket(index, { name: e.target.value })}
                          placeholder="e.g., General Admission, VIP"
                          className="bg-black border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Price</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e) => updateTicket(index, { price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            className="flex-1 bg-black border-zinc-700 text-white placeholder:text-zinc-500"
                          />
                          <Input
                            value={ticket.currency}
                            onChange={(e) => updateTicket(index, { currency: e.target.value })}
                            placeholder="USD"
                            className="w-20 bg-black border-zinc-700 text-white placeholder:text-zinc-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Description</label>
                      <Textarea
                        value={ticket.description || ''}
                        onChange={(e) => updateTicket(index, { description: e.target.value })}
                        placeholder="Describe what's included with this ticket..."
                        className="min-h-[60px] bg-black border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>

                    {/* Advanced Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Max Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={ticket.maxQuantity || ''}
                          onChange={(e) => updateTicket(index, { 
                            maxQuantity: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          placeholder="Unlimited"
                          className="bg-black border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                        <p className="text-xs text-zinc-500">Leave empty for unlimited</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Settings</label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">Active</span>
                            <Switch
                              checked={ticket.isActive}
                              onCheckedChange={(checked) => updateTicket(index, { isActive: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">Allow Multiple</span>
                            <Switch
                              checked={ticket.allowMultiple}
                              onCheckedChange={(checked) => updateTicket(index, { allowMultiple: checked })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sale Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Sale Start Date</label>
                        <Input
                          type="datetime-local"
                          value={ticket.saleStartDate || ''}
                          onChange={(e) => updateTicket(index, { saleStartDate: e.target.value })}
                          className="bg-black border-zinc-700 text-white"
                        />
                        <p className="text-xs text-zinc-500">Leave empty to start immediately</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Sale End Date</label>
                        <Input
                          type="datetime-local"
                          value={ticket.saleEndDate || ''}
                          onChange={(e) => updateTicket(index, { saleEndDate: e.target.value })}
                          className="bg-black border-zinc-700 text-white"
                        />
                        <p className="text-xs text-zinc-500">Leave empty to sell until event</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {tickets.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-white">Ticketing Summary</h4>
                <div className="space-y-1 text-sm text-zinc-400">
                  <div className="flex justify-between">
                    <span>Total ticket types:</span>
                    <span className="font-medium text-white">{tickets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free tickets:</span>
                    <span className="font-medium text-white">{tickets.filter(t => t.price === 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid tickets:</span>
                    <span className="font-medium text-white">{tickets.filter(t => t.price > 0).length}</span>
                  </div>
                  {tickets.some(t => t.price > 0) && (
                    <div className="flex justify-between">
                      <span>Price range:</span>
                      <span className="font-medium text-white">
                        ${Math.min(...tickets.filter(t => t.price > 0).map(t => t.price))} - 
                        ${Math.max(...tickets.map(t => t.price))} {tickets[0]?.currency || 'USD'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 