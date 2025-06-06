'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ticket, CreditCard, Plus, Minus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Event } from '@/types/event';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxQuantity: number;
  availableQuantity: number;
  eventId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TicketPurchaseProps {
  event: Event;
  eventId: string;
  accessInfo?: {
    hasAccess: boolean;
    reason: 'invited' | 'shared_link' | 'public_event' | 'owner';
    inviteToken?: string;
    inviteeId?: string;
    sharedBy?: string;
    inviteeEmail?: string;
  };
}

interface CartItem extends TicketType {
  quantity: number;
}

export function TicketPurchase({ event, eventId }: TicketPurchaseProps) {
  const { user, isSignedIn } = useUser();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load available tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/tickets`);
        
        if (response.ok) {
          const ticketsData = await response.json();
          setTickets(ticketsData.filter((ticket: TicketType) => ticket.isActive));
        } else {
          throw new Error('Failed to load tickets');
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
        setError('Failed to load available tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [eventId]);

  const addToCart = (ticket: TicketType) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === ticket.id);
      if (existing) {
        if (existing.quantity < ticket.maxQuantity && existing.quantity < ticket.availableQuantity) {
          return prev.map(item =>
            item.id === ticket.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prev;
      } else {
        return [...prev, { ...ticket, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (ticketId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === ticketId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === ticketId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.id !== ticketId);
      }
    });
  };

  const updateQuantity = (ticketId: string, quantity: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const maxAllowed = Math.min(ticket.maxQuantity, ticket.availableQuantity);
    const validQuantity = Math.max(0, Math.min(quantity, maxAllowed));

    if (validQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== ticketId));
    } else {
      setCart(prev => {
        const existing = prev.find(item => item.id === ticketId);
        if (existing) {
          return prev.map(item =>
            item.id === ticketId
              ? { ...item, quantity: validQuantity }
              : item
          );
        } else {
          return [...prev, { ...ticket, quantity: validQuantity }];
        }
      });
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePurchase = async () => {
    if (!isSignedIn) {
      setError('Please sign in to purchase tickets');
      return;
    }

    if (cart.length === 0) {
      setError('Please select at least one ticket');
      return;
    }

    if (!buyerName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setPurchasing(true);
      setError(null);

      const purchaseData = {
        tickets: cart.map(item => ({
          ticketId: item.id,
          quantity: item.quantity
        })),
        buyerEmail: user?.emailAddresses[0]?.emailAddress,
        buyerName: buyerName.trim(),
        totalAmount
      };

      const response = await fetch(`/api/events/${eventId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (response.ok) {
        setSuccess(true);
        setCart([]);
        // Refresh tickets to update available quantities
        const ticketsResponse = await fetch(`/api/events/${eventId}/tickets`);
        if (ticketsResponse.ok) {
          const updatedTickets = await ticketsResponse.json();
          setTickets(updatedTickets.filter((ticket: TicketType) => ticket.isActive));
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase tickets');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError(error instanceof Error ? error.message : 'Failed to purchase tickets');
    } finally {
      setPurchasing(false);
    }
  };

  if (!event.hasTickets) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-black/40 border-white/[0.08]">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Ticket className="h-5 w-5 mr-2" />
            Event Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            <p className="text-sm text-white/50 mt-2">Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <Card className="bg-black/40 border-white/[0.08]">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Ticket className="h-5 w-5 mr-2" />
            Event Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="bg-black/40 border-white/[0.08]">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
            Purchase Successful!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500/20 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Your tickets have been purchased successfully! Check your email for confirmation and ticket details.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-white/[0.08]">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Ticket className="h-5 w-5 mr-2" />
          Event Tickets
        </CardTitle>
        <CardDescription className="text-white/50">
          {event.requiresTickets 
            ? 'A ticket is required to attend this event' 
            : 'Purchase tickets to secure your spot'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Tickets */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <Alert className="bg-white/[0.02] border-white/[0.08]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white/70">
                No tickets are currently available for this event.
              </AlertDescription>
            </Alert>
          ) : (
            tickets.map((ticket) => {
              const cartItem = cart.find(item => item.id === ticket.id);
              const isUnavailable = ticket.availableQuantity === 0;
              
              return (
                <div
                  key={ticket.id}
                  className={`border border-white/[0.08] bg-white/[0.02] rounded-lg p-4 ${isUnavailable ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{ticket.name}</h4>
                      {ticket.description && (
                        <p className="text-sm text-white/50">{ticket.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-white">
                          ${ticket.price === 0 ? 'Free' : ticket.price.toFixed(2)}
                        </span>
                        <Badge variant="secondary" className="text-xs bg-white/[0.08] text-white/70 border-white/[0.08]">
                          {ticket.availableQuantity} available
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {!isUnavailable && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white"
                        onClick={() => removeFromCart(ticket.id)}
                        disabled={!cartItem}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        min="0"
                        max={Math.min(ticket.maxQuantity, ticket.availableQuantity)}
                        value={cartItem?.quantity || 0}
                        onChange={(e) => updateQuantity(ticket.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center bg-white/[0.02] border-white/[0.08] text-white"
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-white"
                        onClick={() => addToCart(ticket)}
                        disabled={
                          (cartItem?.quantity || 0) >= Math.min(ticket.maxQuantity, ticket.availableQuantity)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-sm text-white/50 ml-2">
                        Max {ticket.maxQuantity}
                      </span>
                    </div>
                  )}
                  
                  {isUnavailable && (
                    <Badge variant="destructive" className="mt-2 bg-red-500/10 text-red-400 border-red-500/20">
                      Sold Out
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <>
            <Separator className="bg-white/[0.08]" />
            
            {/* Buyer Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">Your Information</h4>
              <div>
                <label htmlFor="buyerName" className="block text-sm font-medium mb-2 text-white/70">
                  Full Name *
                </label>
                <Input
                  id="buyerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-white/40"
                />
              </div>
            </div>
            
            <Separator className="bg-white/[0.08]" />
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center text-white">
                <Users className="h-4 w-4 mr-2" />
                Your Order ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})
              </h4>
              
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm text-white/70">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <Separator className="bg-white/[0.08]" />
              <div className="flex justify-between items-center font-medium text-white">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Purchase Button */}
        {!user ? (
          <Alert className="bg-white/[0.02] border-white/[0.08]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-white/70">
              Please sign in to purchase tickets for this event.
            </AlertDescription>
          </Alert>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={cart.length === 0 || purchasing}
            className="w-full bg-white text-black hover:bg-white/90"
            size="lg"
          >
            {purchasing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Purchase Tickets
                {totalAmount > 0 && ` - $${totalAmount.toFixed(2)}`}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 