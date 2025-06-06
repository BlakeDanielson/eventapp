# Codebase Summary: Event Planning MVP

## Project Overview
An event planning application built with Next.js that allows organizers to create private event pages and manage registrations. The system supports two main user roles: Event Organizers and Attendees.

## Key Components and Their Interactions

### Authentication Layer
- **Clerk Integration**: Handles user authentication across the application
- **Protected Routes**: Dashboard and event creation require authentication
- **Public Access**: Event pages accessible via shareable links (no auth required)

### Database Layer (Prisma + SQLite)
- **Event Model**: Core event information (title, date, time, location, bio, agenda, Q&A)
- **Registration Model**: Attendee registrations linked to events
- **Referral Model**: Tracks referral sources for registrations
- **Relationships**: Events → Registrations (one-to-many), Events → Referrals (one-to-many)

### Frontend Components
- **EventForm**: Handles event creation with form validation
- **RegistrationForm**: Attendee registration interface
- **EventPreview**: Displays event information to attendees
- **ReferralForm**: Manages referral link creation
- **UI Components**: shadcn/ui based design system

### API Layer
- **`/api/events`**: Event CRUD operations (currently only CREATE implemented)
- **`/api/register`**: Registration processing (structure exists, needs implementation)
- **`/api/referrals`**: Referral link management
- **`/api/send-confirmation`**: Email sending functionality

## Data Flow

### Event Creation Flow
1. Organizer navigates to `/create-event`
2. Fills out EventForm with event details
3. Form submits to `/api/events` POST endpoint
4. Event created in database, user redirected to event page

### Registration Flow (INCOMPLETE)
1. Attendee visits event page via shareable link
2. Views event details in EventPreview component
3. Fills out RegistrationForm
4. **MISSING**: API integration to process registration
5. **MISSING**: Email confirmation sending

### Dashboard Flow (INCOMPLETE)
1. Organizer accesses `/dashboard`
2. **MISSING**: Fetch and display user's events
3. **MISSING**: Event management actions (edit, delete, view registrations)

## External Dependencies

### Critical Integrations
- **Clerk**: User authentication and management
- **Prisma**: Database ORM and query generation
- **Resend**: Email service for transactional emails (not yet integrated)
- **React Hook Form + Zod**: Form handling and validation

### UI/Styling Dependencies
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **Lucide React**: Icon library

## Recent Significant Changes
*This is a new project analysis - tracking significant changes moving forward*

## Current Implementation Status

### ✅ Working Features
- User authentication (Clerk)
- Event creation form (frontend only)
- Registration form (frontend only)
- Basic page routing and navigation
- Database schema and connection

### ❌ Major Gaps
1. **Data Fetching**: Event pages show hardcoded data instead of database content
2. **Registration Processing**: No backend logic to save registrations
3. **Email Integration**: Resend dependency installed but not configured
4. **Dashboard Functionality**: Empty dashboard with no event management
5. **Referral System**: Components exist but no tracking implementation
6. **Error Handling**: No loading states or error boundaries

### 🔧 Technical Debt
- Missing TypeScript interfaces for API responses
- No validation schemas for API endpoints
- Incomplete API route implementations
- Missing environment variable setup
- No error handling patterns established

## User Feedback Integration Impact
*To be updated as user feedback is received and implemented*

## Architecture Patterns

### Established Patterns
- **App Router**: Using Next.js 13+ app directory structure
- **Component Composition**: Reusable UI components with props
- **API Routes**: Server-side API endpoints in app/api directory
- **Form Handling**: React Hook Form with Zod validation

### Needed Patterns
- **Error Boundaries**: For graceful error handling
- **Loading States**: For async operations
- **Data Fetching**: Server components vs client components strategy
- **Type Safety**: Consistent TypeScript interfaces across frontend/backend

## Next Priority Actions

1. **Complete Core Flow**: Fix event data fetching and registration processing
2. **Email Integration**: Set up Resend for confirmation emails
3. **Dashboard Enhancement**: Add event management functionality
4. **Error Handling**: Implement loading states and error boundaries
5. **UI Polish**: Improve styling and mobile responsiveness 