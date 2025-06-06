---
**Product Requirements Document: Simple Event Page MVP (Revised)**

**1. Introduction & Overview**
This document outlines the requirements for a Minimum Viable Product (MVP) of a private event page system. The system will allow organizers to quickly create and share simple event pages, manage registrations, and communicate basic information to attendees. The core philosophy is simplicity, speed of deployment, and essential features for small, invite-only events.

**2. Goals**
*   Enable organizers to create a functional and informative event page with minimal effort.
*   Provide a straightforward registration process for invitees.
*   Facilitate basic automated communication with attendees (reminders, thank yous).
*   Allow organizers to track who has registered and through which referral links.
*   Offer a simple way for attendees to add the event to their Google Calendar.

**3. Target Audience**
*   **Organizers:** Individuals or small groups needing a quick, no-fuss solution for managing private events.
*   **Attendees:** Individuals invited to events via a direct link.

**4. Key Features (MVP)**

    **4.1. Event Page Creation & Display**
        *   **Access Control:** Event pages are private and accessible only via a unique, shareable link.
        *   **Content Sections:** The event page must display:
            *   Event Title, Date, and Time.
            *   **Location:** Physical address or virtual meeting link.
            *   **Bio/About:** A brief description of the event or host(s).
            *   **Breakdown of Event:** A simple agenda, schedule, or list of key activities.
            *   **Q&A (Static):** A section for pre-defined common questions and answers.
        *   **Visuals:** Basic customization (e.g., ability to upload a header image/logo).

    **4.2. Registration & Ticketing**
        *   **Registration Form:**
            *   Collect essential attendee information (e.g., Name, Email).
            *   Allow organizers to define a few custom questions for the registration form (e.g., "Dietary Preferences?", "How did you hear about us?").
        *   **Ticketing:**
            *   Support "free" tickets only for the MVP.
            *   Confirmation: Attendees receive an on-screen confirmation and an email upon successful registration.

    **4.3. Google Calendar Integration**
        *   Upon successful registration, attendees will be presented with an option (e.g., a button or link) to easily add the event to their Google Calendar. This should pre-fill event details.

    **4.4. Referral Link Tracking (Simplified)**
        *   Organizers can generate unique versions of the event link for specific individuals (referrers).
        *   When an attendee registers using a referrer-specific link, the system should record which referrer's link was used for that registration.

    **4.5. Automated Email Communication**
        *   **Customizable Templates:** Organizers can customize the content for the following automated emails:
            *   **Pre-Event Reminder:** Sent to registered attendees a configurable number of days/hours before the event (e.g., 24 hours prior).
            *   **Post-Event Thank You:** Sent to registered attendees after the event.

    **4.6. Attendee List Export**
        *   Organizers must be able to download the list of registered attendees (including their answers to custom questions and referral source, if applicable) as a CSV or Excel file.

**5. Design & User Experience (UX)**
*   **Simplicity & Clarity:** The interface should be clean, intuitive, and easy to understand for both organizers and attendees.
*   **Mobile-Responsive:** The event page and registration flow must be fully functional and look good on mobile devices and desktops.
*   **Minimalism:** Focus on essential information and actions, avoiding clutter. "Pretty versus complex."

**6. Technical Considerations (High-Level for MVP)**
*   **Framework:** Next.js (App Router) with React
*   **Language:** TypeScript
*   **UI Components:** Shadcn/ui
*   **Styling:** Tailwind CSS
*   **Authentication:** Clerk (for organizer access to manage events/registrations)
*   **Database:** SQLite (managed with Prisma or a similar ORM for Next.js)
*   **Email Delivery:** Resend (for transactional emails: registration confirmation, reminders, thank yous)
*   **Deployment Platform:** (To be confirmed, e.g., Vercel, Netlify, Render)

**7. Success Metrics (MVP)**
*   Percentage of invitees who successfully register.
*   Successful download of attendee lists by organizers.
