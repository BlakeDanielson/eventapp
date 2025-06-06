# Test Documentation

This directory contains test scripts for the Event App to verify core functionality.

## Test Scripts

### 1. `test-core-functionality.js`
**Command:** `npm test` or `npm run test`

Comprehensive test suite that validates all core API endpoints:
- ✅ Event Creation (POST /api/events)
- ✅ Event Retrieval (GET /api/events/[id])
- ✅ User Registration (POST /api/register)
- ✅ Duplicate Registration Prevention
- ✅ Invalid Event Registration Handling
- ✅ Event Not Found (404) Handling

**Status:** All 6 tests passing ✅

### 2. `quick-test.js`
**Command:** `npm run test:quick [action]`

Individual test commands for specific functionality:
- `npm run test:create` - Test event creation only
- `npm run test:quick get <eventId>` - Test event retrieval
- `npm run test:quick register <eventId>` - Test registration
- `npm run test:help` - Show all available commands

### 3. `test-dashboard.js` ⭐ NEW
**Command:** `npm run test:dashboard`

Tests dashboard functionality and authentication:
- 🔐 Authentication Requirements (Events API)
- 📊 Dashboard User Event Isolation
- 🎯 Manual Testing Guide for Authenticated Features

**Important:** This test validates that authentication is working correctly by expecting 401 responses for unauthenticated requests.

## Test Results Summary

### ✅ Authentication Working Correctly
- Event creation requires valid user authentication (401 without auth)
- Dashboard API requires valid user authentication (401 without auth)
- This confirms user isolation and security is functioning

### ✅ Core Functionality Verified
- End-to-end event creation → registration → confirmation flow
- Email confirmation system operational
- Database operations functioning correctly
- API validation and error handling working

### 🧪 Manual Testing Required
For dashboard functionality that requires authentication:

1. **Start the server:** `npm run dev`
2. **Visit dashboard:** http://localhost:3000/dashboard
3. **Sign in** with Clerk authentication
4. **Create an event** using the "Create Event" button
5. **Verify event appears** on dashboard with correct information
6. **Test registration flow** by visiting the event page and registering
7. **Check registration count** updates on dashboard

## Current Project Status

### Completed & Tested ✅
- **Task 1.1:** Event Data Fetching & Display
- **Task 1.2:** Registration Processing & Email Confirmation  
- **Task 1.3:** Dashboard Core Functionality (Authentication + Display)

### In Progress 🚀
- **Task 1.3:** Event Management Actions (Edit, Delete, Manage Registrations)

### Next Up 📋
- **Task 1.4:** UI/UX Improvements & Polish
- **Task 1.5:** Advanced Features (Referral Links, Analytics)

## Testing Notes

- All public API endpoints are tested automatically
- Authenticated endpoints require manual testing with valid user sessions
- Database is reset during schema changes - test data is recreated as needed
- Email functionality requires valid Resend API key in environment

## Troubleshooting

If tests fail:
1. Ensure server is running: `npm run dev`
2. Check database is migrated: `npx prisma db push`
3. Verify environment variables in `.env`
4. For dashboard tests, ensure Clerk is configured
5. Check console output for specific error messages

## Prerequisites

- Development server must be running (`npm run dev`)
- Server should be accessible at `http://localhost:3000`

## Running Tests

### Option 1: Using npm scripts (recommended)
```bash
# Run full test suite
npm test

# Run quick flow test
npm run test:quick
```

### Option 2: Direct execution
```bash
# Full test suite
node tests/test-core-functionality.js

# Quick tests
node tests/quick-test.js flow
```

## What the Tests Verify

### 🎯 **Event Creation Flow**
- Event data is properly stored in database
- Event ID is generated correctly
- All required fields are preserved

### 🎯 **Event Retrieval Flow**  
- Events can be fetched by ID
- Event data matches what was stored
- Registration counts are accurate
- 404 handling for non-existent events

### 🎯 **Registration Flow**
- Users can register for events
- Registration data is stored correctly
- Email confirmation is triggered (simulated)
- Validation works for required fields

### 🎯 **Error Handling**
- Duplicate registrations are prevented
- Invalid event IDs are handled gracefully
- Proper HTTP status codes are returned
- Error messages are user-friendly

## Email Testing

The tests work with email simulation when `RESEND_API_KEY` is not set:
- Email content is logged to console
- Registration still succeeds
- You can verify email templates in the logs

To test with real emails:
1. Set `RESEND_API_KEY` in your `.env` file
2. Set `FROM_EMAIL` to your verified Resend domain
3. Run tests - real emails will be sent

## Adding New Tests

To add new test cases:

1. **Add to core test suite**: Edit `test-core-functionality.js`
2. **Add new quick test**: Edit `quick-test.js`
3. **Follow the pattern**:
   ```javascript
   async function testNewFeature() {
     log('🧪 Testing New Feature...', 'info');
     const result = await makeRequest(url, options);
     // ... validation logic
     return success;
   }
   ```

## Next Steps

After core functionality is verified:
- Add dashboard functionality tests
- Add referral system tests  
- Add event editing tests
- Add bulk operation tests 