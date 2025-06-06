# Calendar Integration

## Overview

The EventApp now includes comprehensive calendar integration features that allow users to easily add events to their preferred calendar applications or download calendar files.

## Features

### Supported Calendar Platforms

1. **Google Calendar** - Direct web integration
2. **Outlook Web** - Microsoft Outlook online integration  
3. **Yahoo Calendar** - Yahoo's calendar service integration
4. **ICS Download** - Universal calendar file format for desktop applications

### User Experience

Users can access calendar functionality through:

- **Header Actions**: "Add to Calendar" button in the event header alongside like/share buttons
- **Registration Sidebar**: Prominent calendar section after registration/ticketing area

## Implementation

### Components

#### `CalendarActions` Component
- Location: `src/components/calendar-actions.tsx`
- Dropdown menu with all calendar options
- Responsive design matching the app's dark theme
- Icon-based interface for easy recognition

#### `CalendarUtils` Utility Class
- Location: `src/lib/calendar-utils.ts`
- Centralized calendar logic and URL generation
- ICS file generation with proper formatting
- Date/time parsing and formatting for different platforms

### Technical Details

#### Event Duration
- Default duration: 2 hours (configurable)
- Start time: Parsed from event time field
- End time: Calculated as start + duration

#### ICS File Features
- RFC 5545 compliant format
- Includes 15-minute reminder alarm
- Proper text escaping for special characters
- Unique event IDs for calendar applications

#### URL Generation
Each platform requires different URL formats:
- **Google**: `calendar.google.com/calendar/render` with specific parameters
- **Outlook**: `outlook.live.com/calendar/0/deeplink/compose` with ISO dates
- **Yahoo**: `calendar.yahoo.com` with custom date format

## Usage

### Basic Implementation

```tsx
import { CalendarActions } from '@/components/calendar-actions';

<CalendarActions event={event} className="w-full" />
```

### With Utility Functions

```tsx
import { CalendarUtils } from '@/lib/calendar-utils';

const calendarEvent = {
  title: "My Event",
  description: "Event description",
  location: "Event location", 
  start: new Date(),
  end: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours later
};

// Generate URLs
const googleUrl = CalendarUtils.getGoogleCalendarUrl(calendarEvent);
const outlookUrl = CalendarUtils.getOutlookWebUrl(calendarEvent);

// Download ICS file
CalendarUtils.downloadICS(calendarEvent);
```

## Styling

The calendar components follow the app's design system:
- Dark theme with transparent backgrounds
- White text with opacity variations
- Colored icons for different platforms
- Hover states and transitions
- Responsive behavior

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers supported
- File downloads work on desktop and mobile
- External calendar links open in new tabs

## Future Enhancements

Potential improvements:
- Apple Calendar integration (requires different approach)
- Recurring event support
- Custom event duration settings
- Multiple timezone support
- Calendar app detection and direct opening 