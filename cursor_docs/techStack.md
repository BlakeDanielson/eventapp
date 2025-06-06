# Tech Stack & Architecture

## Core Technologies

### Frontend Framework
- **Next.js 15.3.3** (App Router)
  - React 19.0.0
  - TypeScript for type safety
  - Server-side rendering and API routes

### Authentication
- **Clerk** (@clerk/nextjs ^6.21.0)
  - Handles user authentication and management
  - Provides UserButton component for dashboard
  - Integrated with Next.js App Router

### Database & ORM
- **SQLite** with **Prisma** 
  - Prisma Client ^6.9.0
  - Simple file-based database for MVP
  - Schema includes Event, Registration, Referral models

### Styling & UI
- **Tailwind CSS** (v4)
- **shadcn/ui** components
  - Radix UI primitives (@radix-ui/react-*)
  - Class Variance Authority for component variants
  - Lucide React for icons

### Forms & Validation
- **React Hook Form** ^7.57.0
- **Zod** ^3.25.53 for schema validation
- **@hookform/resolvers** for Zod integration

### Email Service
- **Resend** ^4.5.2
  - For transactional emails
  - Registration confirmations, reminders, thank you emails

## Architecture Decisions

### Database Schema
```prisma
Event {
  id, title, date, time, location, bio, agenda, qa, imageUrl
  registrations[], referrals[]
}

Registration {
  id, name, email, eventId, customQuestions, status, referralId
}

Referral {
  id, name, eventId, registrations[]
}
```

### API Structure
- `/api/events` - Event CRUD operations
- `/api/register` - Registration processing
- `/api/referrals` - Referral link management
- `/api/send-confirmation` - Email sending

### Folder Structure
```
src/
├── app/
│   ├── (auth)/ - Clerk auth pages
│   ├── api/ - API routes
│   ├── create-event/ - Event creation
│   ├── dashboard/ - Organizer dashboard
│   └── event/[id]/ - Public event pages
├── components/ - Reusable UI components
├── hooks/ - Custom React hooks
├── lib/ - Utility functions
└── types/ - TypeScript type definitions
```

## Development Decisions

### Why This Stack
- **SQLite**: Simple for MVP, easy deployment, no external database needed
- **Clerk**: Rapid auth implementation, good developer experience
- **Prisma**: Type-safe database access, great with TypeScript
- **shadcn/ui**: High-quality components, consistent design system
- **Resend**: Simple email API, better than SMTP setup for MVP

### Key Considerations
- **Privacy**: Events are private, accessible via shareable links only
- **Referral Tracking**: Each referral gets unique link parameters  
- **Email Templates**: Using Resend's template system
- **File Uploads**: Need to implement for event images
- **Deployment**: Vercel-ready with SQLite file storage

## Environment Variables Needed
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
RESEND_API_KEY=
DATABASE_URL="file:./dev.db"
```

## Deployment Considerations
- **Vercel**: Primary deployment target
- **SQLite**: File-based storage works with Vercel
- **Static Assets**: Next.js handles optimization
- **Email**: Resend handles delivery and templates 