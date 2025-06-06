import { z } from 'zod';
import { EventStatus, OrganizationType } from './event';

// Form validation schema
export const eventFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  date: z.string().min(1, {
    message: 'Date is required.',
  }),
  time: z.string().min(1, {
    message: 'Time is required.',
  }),
  location: z.string().min(1, {
    message: 'Location is required.',
  }),
  bio: z.string().min(10, {
    message: 'Bio must be at least 10 characters.',
  }),
  agenda: z.string().min(10, {
    message: 'Agenda must be at least 10 characters.',
  }),
  qa: z.string().optional(),
  status: z.enum(['draft', 'public', 'private', 'cancelled']),
  image: z.any().optional(),
});

// Infer the form data type from the schema
export type EventFormData = z.infer<typeof eventFormSchema>;

// Props for the EventForm component
export interface EventFormProps {
  initialData?: Partial<EventFormData> & {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
  };
  onSubmit: (data: EventFormData & { invitees?: string[] }) => Promise<void>;
  mode: 'create' | 'edit';
  submitButtonText?: string;
}

// Helper type for form default values
export interface EventFormDefaults {
  title: string;
  date: string;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa: string;
  status: 'draft' | 'public' | 'private' | 'cancelled';
  image: any;
}

// Utility function to convert database event to form data
export function eventToFormData(event: any): Partial<EventFormData> {
  if (!event) return {};
  
  // Handle legacy 'published' status by converting to 'public'
  let status = event.status || 'public';
  if (status === 'published') {
    status = 'public';
  }
  
  return {
    title: event.title || '',
    date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
    time: event.time || '',
    location: event.location || '',
    bio: event.bio || '',
    agenda: event.agenda || '',
    qa: event.qa || '',
    status: status as 'draft' | 'public' | 'private' | 'cancelled',
    image: null, // Always reset image for forms
  };
}

// Utility function to get safe default values for the form
export function getFormDefaults(): EventFormDefaults {
  return {
    title: '',
    date: '',
    time: '',
    location: '',
    bio: '',
    agenda: '',
    qa: '',
    status: 'public',
    image: null,
  };
}

// Organizer Profile Form validation schema
export const organizerProfileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  organizationType: z.enum(['individual', 'company', 'nonprofit', 'government', 'education', 'other']),
  bio: z.string().optional(),
  
  // Contact Information
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  
  // Social Media Links
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  
  // Branding
  brandColor: z.string().optional(),
  
  // Default Event Settings
  defaultLocation: z.string().optional(),
  defaultAgenda: z.string().optional(),
  eventDisclaimer: z.string().optional(),
  
  // Settings
  showContactInfo: z.boolean(),
  showSocialLinks: z.boolean(),
  
  // File uploads
  profileImage: z.any().optional(),
  defaultEventImage: z.any().optional(),
});

// Infer the form data type from the schema
export type OrganizerProfileFormData = z.infer<typeof organizerProfileFormSchema>;

// Props for the OrganizerProfileForm component
export interface OrganizerProfileFormProps {
  initialData?: Partial<OrganizerProfileFormData> & {
    id?: string;
    userId?: string;
    profileImageUrl?: string;
    defaultEventImageUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  onSubmit: (data: OrganizerProfileFormData) => Promise<void>;
  mode: 'create' | 'edit';
  submitButtonText?: string;
}

// Helper type for form default values
export interface OrganizerProfileFormDefaults {
  displayName: string;
  organizationType: OrganizationType;
  bio: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  linkedinUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  brandColor: string;
  defaultLocation: string;
  defaultAgenda: string;
  eventDisclaimer: string;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  profileImage: any;
  defaultEventImage: any;
}

// Utility function to convert database organizer profile to form data
export function organizerProfileToFormData(profile: any): Partial<OrganizerProfileFormData> {
  if (!profile) return {};
  
  return {
    displayName: profile.displayName || '',
    organizationType: profile.organizationType || 'individual',
    bio: profile.bio || '',
    email: profile.email || '',
    phone: profile.phone || '',
    website: profile.website || '',
    location: profile.location || '',
    linkedinUrl: profile.linkedinUrl || '',
    twitterUrl: profile.twitterUrl || '',
    facebookUrl: profile.facebookUrl || '',
    instagramUrl: profile.instagramUrl || '',
    brandColor: profile.brandColor || '',
    defaultLocation: profile.defaultLocation || '',
    defaultAgenda: profile.defaultAgenda || '',
    eventDisclaimer: profile.eventDisclaimer || '',
    showContactInfo: profile.showContactInfo ?? true,
    showSocialLinks: profile.showSocialLinks ?? true,
    profileImage: null, // Always reset images for forms
    defaultEventImage: null,
  };
}

// Utility function to get safe default values for the organizer profile form
export function getOrganizerProfileFormDefaults(): OrganizerProfileFormDefaults {
  return {
    displayName: '',
    organizationType: 'individual',
    bio: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    brandColor: '',
    defaultLocation: '',
    defaultAgenda: '',
    eventDisclaimer: '',
    showContactInfo: true,
    showSocialLinks: true,
    profileImage: null,
    defaultEventImage: null,
  };
}

// Ticket Form validation schema
export const ticketFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Ticket name is required.',
  }),
  description: z.string().optional(),
  price: z.number().min(0, {
    message: 'Price must be 0 or greater.',
  }),
  currency: z.string(),
  maxQuantity: z.number().min(1).optional(),
  saleStartDate: z.string().optional(),
  saleEndDate: z.string().optional(),
  isActive: z.boolean(),
  allowMultiple: z.boolean(),
});

// Infer the form data type from the schema
export type TicketFormData = z.infer<typeof ticketFormSchema>;

// Props for the TicketForm component
export interface TicketFormProps {
  initialData?: Partial<TicketFormData> & {
    id?: string;
    eventId?: string;
    soldQuantity?: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  onSubmit: (data: TicketFormData) => Promise<void>;
  mode: 'create' | 'edit';
  submitButtonText?: string;
}

// Helper type for form default values
export interface TicketFormDefaults {
  name: string;
  description: string;
  price: number;
  currency: string;
  maxQuantity?: number;
  saleStartDate: string;
  saleEndDate: string;
  isActive: boolean;
  allowMultiple: boolean;
}

// Utility function to convert database ticket to form data
export function ticketToFormData(ticket: any): Partial<TicketFormData> {
  if (!ticket) return {};
  
  return {
    name: ticket.name || '',
    description: ticket.description || '',
    price: ticket.price || 0,
    currency: ticket.currency || 'USD',
    maxQuantity: ticket.maxQuantity || undefined,
    saleStartDate: ticket.saleStartDate ? new Date(ticket.saleStartDate).toISOString().split('T')[0] : '',
    saleEndDate: ticket.saleEndDate ? new Date(ticket.saleEndDate).toISOString().split('T')[0] : '',
    isActive: ticket.isActive ?? true,
    allowMultiple: ticket.allowMultiple ?? true,
  };
}

// Utility function to get safe default values for the ticket form
export function getTicketFormDefaults(): TicketFormDefaults {
  return {
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    maxQuantity: undefined,
    saleStartDate: '',
    saleEndDate: '',
    isActive: true,
    allowMultiple: true,
  };
}

// Purchase/Checkout Form validation schema
export const purchaseFormSchema = z.object({
  ticketId: z.string().min(1, {
    message: 'Please select a ticket type.',
  }),
  quantity: z.number().min(1, {
    message: 'Quantity must be at least 1.',
  }),
  buyerName: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  buyerEmail: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  // Mock payment fields
  paymentMethod: z.enum(['mock-credit-card', 'mock-paypal', 'mock-apple-pay']).default('mock-credit-card'),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

// Infer the form data type from the schema
export type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

// Props for the PurchaseForm component
export interface PurchaseFormProps {
  eventId: string;
  tickets: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    maxQuantity?: number;
    soldQuantity: number;
    isActive: boolean;
  }>;
  onSubmit: (data: PurchaseFormData) => Promise<void>;
  submitButtonText?: string;
}

// Update EventFormData to include ticket settings
export const eventFormSchemaWithTickets = eventFormSchema.extend({
  hasTickets: z.boolean().default(false),
  requiresTickets: z.boolean().default(false),
});

export type EventFormDataWithTickets = z.infer<typeof eventFormSchemaWithTickets>; 