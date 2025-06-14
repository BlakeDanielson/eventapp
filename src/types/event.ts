export type EventStatus = 'draft' | 'public' | 'private' | 'cancelled';

export type OrganizationType = 'individual' | 'company' | 'nonprofit' | 'government' | 'education' | 'other';

// New ticketing types
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrganizerProfile {
  id: string;
  userId: string;
  
  // Personal/Organization Information
  displayName: string;
  organizationType: OrganizationType;
  bio?: string;
  
  // Contact Information  
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  
  // Social Media Links
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  
  // Branding & Customization
  profileImageUrl?: string;
  brandColor?: string;
  defaultEventImageUrl?: string;
  
  // Default Event Settings
  defaultLocation?: string;
  defaultLocationType?: 'address' | 'virtual';
  defaultStreetAddress?: string;
  defaultCity?: string;
  defaultState?: string;
  defaultZipCode?: string;
  defaultCountry?: string;
  defaultVirtualLink?: string;
  defaultVirtualPlatform?: string;
  defaultAgenda?: string;
  eventDisclaimer?: string;
  
  // Settings
  showContactInfo: boolean;
  showSocialLinks: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  maxQuantity?: number;
  soldQuantity: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
  isActive: boolean;
  allowMultiple: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  eventId: string;
  ticketId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalAmount: number;
  status: PurchaseStatus;
  paymentMethod: string;
  transactionId?: string;
  paymentData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  ticket?: Ticket;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  imageUrl?: string;
  userId: string; // Clerk user ID of the event creator
  status: EventStatus;
  // New ticketing fields
  hasTickets: boolean;
  requiresTickets: boolean;
  // New Q&A settings
  qaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  eventId: string;
  customQuestions?: Record<string, unknown>;
  status: string;
  referralId?: string;
  // New ticket purchase tracking
  purchaseId?: string;
  purchase?: Purchase;
  createdAt: Date;
  updatedAt: Date;
  referral?: {
    id: string;
    name: string;
  };
}

export interface Referral {
  id: string;
  name: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended type for dashboard display with counts and related data
export interface EventWithDetails {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  imageUrl?: string;
  userId: string;
  status: EventStatus;
  // New ticketing fields
  hasTickets: boolean;
  requiresTickets: boolean;
  // New Q&A settings
  qaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  registrations: Pick<Registration, 'id' | 'name' | 'email' | 'status' | 'createdAt' | 'referral' | 'purchase'>[];
  referrals: (Pick<Referral, 'id' | 'name'> & {
    _count: {
      registrations: number;
    };
  })[];
  // New ticketing data
  tickets: Ticket[];
  purchases: Purchase[];
  _count: {
    registrations: number;
    referrals: number;
    invitees: number;
    tickets: number;
    purchases: number;
  };
}

// Extended type for public event display with organizer profile and tickets
export interface EventWithOrganizer extends Event {
  organizerProfile?: OrganizerProfile;
  tickets?: Ticket[];
}

// Extended type for dashboard with organizer profile and tickets
export interface EventWithDetailsAndOrganizer extends EventWithDetails {
  organizerProfile?: OrganizerProfile;
}

// Q&A System Types
export interface Question {
  id: string;
  eventId: string;
  content: string;
  askerName: string;
  askerEmail: string;
  isPublic: boolean;
  isAnswered: boolean;
  isApproved: boolean;
  isHidden: boolean;
  upvotes: number;
  answers?: Answer[];
  upvotedBy?: QuestionUpvote[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  answererName: string;
  answererEmail: string;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionUpvote {
  id: string;
  questionId: string;
  voterEmail: string;
  voterName?: string;
  createdAt: Date;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
  hasUserUpvoted?: boolean;
}

// API Request/Response Types for Q&A
export interface CreateQuestionRequest {
  content: string;
  askerName: string;
  askerEmail: string;
  isPublic?: boolean;
}

export interface CreateAnswerRequest {
  content: string;
  answererName: string;
  answererEmail: string;
}

export interface UpvoteQuestionRequest {
  voterEmail: string;
  voterName?: string;
} 