import { z } from 'zod';
import { OrganizationType } from './event';

// Form validation schema
export const eventFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }).max(200, {
    message: 'Title must be less than 200 characters.',
  }),
  date: z.string().min(1, {
    message: 'Date is required.',
  }),
  time: z.string().min(1, {
    message: 'Time is required.',
  }),
  // Enhanced location fields
  locationType: z.enum(['address', 'virtual']),
  location: z.string().min(1, {
    message: 'Location is required.',
  }),
  // Address fields (when locationType is 'address')
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  // Virtual fields (when locationType is 'virtual')
  virtualLink: z.string().url().optional().or(z.literal('')),
  virtualPlatform: z.string().optional(),
  bio: z.string().min(10, {
    message: 'Bio must be at least 10 characters.',
  }).max(2000, {
    message: 'Bio must be less than 2000 characters.',
  }),
  agenda: z.string().min(10, {
    message: 'Agenda must be at least 10 characters.',
  }).max(5000, {
    message: 'Agenda must be less than 5000 characters.',
  }),
  qa: z.string().optional(),
  // Q&A settings
  qaEnabled: z.boolean(),
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
  locationType: 'address' | 'virtual';
  location: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  virtualLink: string;
  virtualPlatform: string;
  bio: string;
  agenda: string;
  qa: string;
  qaEnabled: boolean;
  status: 'draft' | 'public' | 'private' | 'cancelled';
  image: File | null;
}

// Utility function to convert database event to form data
export function eventToFormData(event: Record<string, unknown>): Partial<EventFormData> {
  if (!event) return {};
  
  // Handle legacy 'published' status by converting to 'public'
  let status = event.status || 'public';
  if (status === 'published') {
    status = 'public';
  }
  
  return {
    title: typeof event.title === 'string' ? event.title : '',
    date: event.date ? new Date(event.date as string | Date).toISOString().split('T')[0] : '',
    time: typeof event.time === 'string' ? event.time : '',
    locationType: (event.locationType === 'virtual' ? 'virtual' : 'address') as 'address' | 'virtual',
    location: typeof event.location === 'string' ? event.location : '',
    streetAddress: typeof event.streetAddress === 'string' ? event.streetAddress : '',
    city: typeof event.city === 'string' ? event.city : '',
    state: typeof event.state === 'string' ? event.state : '',
    zipCode: typeof event.zipCode === 'string' ? event.zipCode : '',
    country: typeof event.country === 'string' ? event.country : '',
    virtualLink: typeof event.virtualLink === 'string' ? event.virtualLink : '',
    virtualPlatform: typeof event.virtualPlatform === 'string' ? event.virtualPlatform : '',
    bio: typeof event.bio === 'string' ? event.bio : '',
    agenda: typeof event.agenda === 'string' ? event.agenda : '',
    qa: typeof event.qa === 'string' ? event.qa : '',
    qaEnabled: typeof event.qaEnabled === 'boolean' ? event.qaEnabled : true,
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
    locationType: 'address',
    location: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    virtualLink: '',
    virtualPlatform: '',
    bio: '',
    agenda: '',
    qa: '',
    qaEnabled: true,
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
  defaultLocationType: z.enum(['address', 'virtual']).optional(),
  defaultStreetAddress: z.string().optional(),
  defaultCity: z.string().optional(),
  defaultState: z.string().optional(),
  defaultZipCode: z.string().optional(),
  defaultCountry: z.string().optional(),
  defaultVirtualLink: z.string().url().optional().or(z.literal('')),
  defaultVirtualPlatform: z.string().optional(),
  defaultAgenda: z.string().optional(),
  eventDisclaimer: z.string().optional(),
  
  // Settings
  showContactInfo: z.boolean(),
  showSocialLinks: z.boolean(),
  
  // File uploads
  profileImage: z.instanceof(File).nullable().optional(),
  defaultEventImage: z.instanceof(File).nullable().optional(),
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
  defaultLocationType: 'address' | 'virtual';
  defaultStreetAddress: string;
  defaultCity: string;
  defaultState: string;
  defaultZipCode: string;
  defaultCountry: string;
  defaultVirtualLink: string;
  defaultVirtualPlatform: string;
  defaultAgenda: string;
  eventDisclaimer: string;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  profileImage: File | null;
  defaultEventImage: File | null;
}

// Utility function to convert database organizer profile to form data
export function organizerProfileToFormData(profile: Record<string, unknown>): Partial<OrganizerProfileFormData> {
  if (!profile) return {};
  
  return {
    displayName: typeof profile.displayName === 'string' ? profile.displayName : '',
    organizationType: (profile.organizationType as OrganizationType) || 'individual',
    bio: typeof profile.bio === 'string' ? profile.bio : '',
    email: typeof profile.email === 'string' ? profile.email : '',
    phone: typeof profile.phone === 'string' ? profile.phone : '',
    website: typeof profile.website === 'string' ? profile.website : '',
    location: typeof profile.location === 'string' ? profile.location : '',
    linkedinUrl: typeof profile.linkedinUrl === 'string' ? profile.linkedinUrl : '',
    twitterUrl: typeof profile.twitterUrl === 'string' ? profile.twitterUrl : '',
    facebookUrl: typeof profile.facebookUrl === 'string' ? profile.facebookUrl : '',
    instagramUrl: typeof profile.instagramUrl === 'string' ? profile.instagramUrl : '',
    brandColor: typeof profile.brandColor === 'string' ? profile.brandColor : '',
    defaultLocation: typeof profile.defaultLocation === 'string' ? profile.defaultLocation : '',
    defaultLocationType: (profile.defaultLocationType === 'virtual' ? 'virtual' : 'address') as 'address' | 'virtual',
    defaultStreetAddress: typeof profile.defaultStreetAddress === 'string' ? profile.defaultStreetAddress : '',
    defaultCity: typeof profile.defaultCity === 'string' ? profile.defaultCity : '',
    defaultState: typeof profile.defaultState === 'string' ? profile.defaultState : '',
    defaultZipCode: typeof profile.defaultZipCode === 'string' ? profile.defaultZipCode : '',
    defaultCountry: typeof profile.defaultCountry === 'string' ? profile.defaultCountry : '',
    defaultVirtualLink: typeof profile.defaultVirtualLink === 'string' ? profile.defaultVirtualLink : '',
    defaultVirtualPlatform: typeof profile.defaultVirtualPlatform === 'string' ? profile.defaultVirtualPlatform : '',
    defaultAgenda: typeof profile.defaultAgenda === 'string' ? profile.defaultAgenda : '',
    eventDisclaimer: typeof profile.eventDisclaimer === 'string' ? profile.eventDisclaimer : '',
    showContactInfo: typeof profile.showContactInfo === 'boolean' ? profile.showContactInfo : true,
    showSocialLinks: typeof profile.showSocialLinks === 'boolean' ? profile.showSocialLinks : true,
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
    defaultLocationType: 'address',
    defaultStreetAddress: '',
    defaultCity: '',
    defaultState: '',
    defaultZipCode: '',
    defaultCountry: '',
    defaultVirtualLink: '',
    defaultVirtualPlatform: '',
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
export function ticketToFormData(ticket: Record<string, unknown>): Partial<TicketFormData> {
  if (!ticket) return {};
  
  return {
    name: typeof ticket.name === 'string' ? ticket.name : '',
    description: typeof ticket.description === 'string' ? ticket.description : '',
    price: typeof ticket.price === 'number' ? ticket.price : 0,
    currency: typeof ticket.currency === 'string' ? ticket.currency : 'USD',
    maxQuantity: typeof ticket.maxQuantity === 'number' ? ticket.maxQuantity : undefined,
    saleStartDate: ticket.saleStartDate ? new Date(ticket.saleStartDate as string | Date).toISOString().split('T')[0] : '',
    saleEndDate: ticket.saleEndDate ? new Date(ticket.saleEndDate as string | Date).toISOString().split('T')[0] : '',
    isActive: typeof ticket.isActive === 'boolean' ? ticket.isActive : true,
    allowMultiple: typeof ticket.allowMultiple === 'boolean' ? ticket.allowMultiple : true,
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