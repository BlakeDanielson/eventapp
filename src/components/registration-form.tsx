'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddToCalendar } from './add-to-calendar';
import { Event } from '@/types/event';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Schema for public events (standard registration)
const publicFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  customQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
});

// Schema for private events (first/last name, pre-populated email)
const privateFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  customQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
});

type PublicFormData = z.infer<typeof publicFormSchema>;
type PrivateFormData = z.infer<typeof privateFormSchema>;

interface RegistrationFormProps {
  eventId: string;
  event: Event;
  accessInfo?: {
    hasAccess: boolean;
    reason: 'invited' | 'shared_link' | 'public_event' | 'owner';
    inviteToken?: string;
    inviteeId?: string;
    sharedBy?: string;
    inviteeEmail?: string; // Add this to pass the verified email
  };
}

interface RegistrationResponse {
  success: boolean;
  registration?: any;
  message?: string;
  error?: string;
  details?: any[];
}

export function RegistrationForm({ eventId, event, accessInfo }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [registration, setRegistration] = useState<any>(null);

  // Determine if this is a private event registration
  const isPrivateEvent = event.status === 'private' && 
    (accessInfo?.reason === 'invited' || accessInfo?.reason === 'shared_link' || accessInfo?.reason === 'owner');

  // Create separate forms for public and private events
  const publicForm = useForm<PublicFormData>({
    resolver: zodResolver(publicFormSchema),
    defaultValues: {
      name: '',
      email: '',
      customQuestions: [],
    },
  });

  const privateForm = useForm<PrivateFormData>({
    resolver: zodResolver(privateFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      customQuestions: [],
    },
  });

  // Pre-populate email for private events when component mounts or accessInfo changes
  useEffect(() => {
    if (isPrivateEvent && accessInfo?.inviteeEmail) {
      privateForm.setValue('email', accessInfo.inviteeEmail);
    }
  }, [isPrivateEvent, accessInfo?.inviteeEmail, privateForm]);

  async function handleSubmit(values: PublicFormData | PrivateFormData) {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // For private events, combine first and last name into a single name field for the API
      const submitData = isPrivateEvent && 'firstName' in values ? {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        customQuestions: values.customQuestions,
      } : values;

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitData,
          eventId,
          inviteToken: accessInfo?.inviteToken,
          accessReason: accessInfo?.reason,
        }),
      });

      const data: RegistrationResponse = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setSubmitMessage(data.message || 'Registration successful!');
        setRegistration(data.registration);
        if (isPrivateEvent) {
          privateForm.reset();
        } else {
          publicForm.reset();
        }
      } else {
        setSubmitStatus('error');
        if (data.details) {
          // Handle validation errors
          setSubmitMessage(data.details.map((detail: any) => detail.message).join(', '));
        } else {
          setSubmitMessage(data.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show success state with calendar integration
  if (submitStatus === 'success' && registration) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {submitMessage}
          </AlertDescription>
        </Alert>
        
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">You're all set!</h3>
          <p className="text-sm text-gray-600">
            We've sent a confirmation email to {registration.email}
          </p>
          
          <AddToCalendar 
            title={event.title}
            date={new Date(event.date).toISOString().split('T')[0]}
            time={event.time}
            location={event.location}
            description={event.bio}
          />
          
          {!isPrivateEvent && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSubmitStatus('idle');
                setRegistration(null);
                setSubmitMessage('');
              }}
              className="mt-4"
            >
              Register Another Person
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Customize header and description based on event type
  const getFormHeader = () => {
    if (isPrivateEvent) {
      if (accessInfo?.reason === 'owner') {
        return {
          title: "Register for Your Event",
          description: "Complete your registration to secure your spot at your own event."
        };
      }
      return {
        title: "Complete Your Registration",
        description: "You're invited! Please provide your name to confirm your attendance."
      };
    }
    return {
      title: "Register for Event",
      description: "Fill out the form below to secure your spot."
    };
  };

  const { title, description } = getFormHeader();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {submitStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {submitMessage}
          </AlertDescription>
        </Alert>
      )}

      {isPrivateEvent ? (
        // Private event form
        <Form {...privateForm}>
          <form onSubmit={privateForm.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={privateForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="First name" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={privateForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Last name" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={privateForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Your email address" 
                      {...field} 
                      disabled={true} // Always disabled for private events since it's pre-populated
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Attendance'
              )}
            </Button>
          </form>
        </Form>
      ) : (
        // Public event form
        <Form {...publicForm}>
          <form onSubmit={publicForm.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={publicForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={publicForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter your email address" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register for Event'
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
