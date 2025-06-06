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

    try {
      setPurchasing(true);
      setError(null);

      const purchaseData = {
        tickets: cart.map(item => ({
          ticketId: item.id,
          quantity: item.quantity
        })),
        buyerEmail: user?.emailAddresses[0]?.emailAddress,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="h-5 w-5 mr-2" />
            Event Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="h-5 w-5 mr-2" />
            Event Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Purchase Successful!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your tickets have been purchased successfully! Check your email for confirmation and ticket details.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ticket className="h-5 w-5 mr-2" />
          Event Tickets
        </CardTitle>
        <CardDescription>
          {event.requiresTickets 
            ? 'A ticket is required to attend this event' 
            : 'Purchase tickets to secure your spot'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Tickets */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
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
                  className={`border rounded-lg p-4 ${isUnavailable ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{ticket.name}</h4>
                      {ticket.description && (
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold">
                          ${ticket.price === 0 ? 'Free' : ticket.price.toFixed(2)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
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
                        className="h-8 w-8"
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
                        className="w-16 text-center"
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addToCart(ticket)}
                                                 disabled={
                           (cartItem?.quantity || 0) >= Math.min(ticket.maxQuantity, ticket.availableQuantity)
                         }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-sm text-muted-foreground ml-2">
                        Max {ticket.maxQuantity}
                      </span>
                    </div>
                  )}
                  
                  {isUnavailable && (
                    <Badge variant="destructive" className="mt-2">
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
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Your Order ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})
              </h4>
              
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <Separator />
              <div className="flex justify-between items-center font-medium">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Purchase Button */}
        {!isSignedIn ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to purchase tickets for this event.
            </AlertDescription>
          </Alert>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={cart.length === 0 || purchasing}
            className="w-full"
            size="lg"
          >
            {purchasing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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