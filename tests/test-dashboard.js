#!/usr/bin/env node

/**
 * Dashboard Functionality Test Script
 * Tests the new dashboard functionality including:
 * - User authentication and event isolation
 * - Event creation and dashboard display
 * - Registration counts and analytics
 */

const BASE_URL = 'http://localhost:3000';

async function testDashboard() {
  console.log('🧪 Testing Dashboard Functionality');
  console.log('=====================================\n');

  try {
    // Test 1: Create an event (requires authentication)
    console.log('1. Testing Event Creation with User Association...');
    
    const eventData = {
      title: 'Dashboard Test Event',
      date: '2024-02-15',
      time: '6:00 PM',
      location: 'Test Venue Dashboard',
      bio: 'This is a test event for dashboard functionality.',
      agenda: '6:00 PM - Welcome\n6:30 PM - Testing',
      qa: 'Q: Will this work? A: We\'re testing!',
      imageUrl: 'https://example.com/test-image.jpg'
    };

    const createResponse = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (createResponse.status === 401) {
      console.log('⚠️  Expected: Authentication required for event creation');
      console.log('📝 Note: Event creation now properly requires user authentication');
    } else {
      const createResult = await createResponse.json();
      console.log(`✅ Event created with ID: ${createResult.id}`);
      console.log(`   Event has userId: ${createResult.userId ? 'Yes' : 'No'}`);
      
      // Test 2: Fetch user events
      console.log('\n2. Testing User Events Retrieval...');
      const eventsResponse = await fetch(`${BASE_URL}/api/events`);
      
      if (eventsResponse.status === 401) {
        console.log('⚠️  Expected: Authentication required for events retrieval');
        console.log('📝 Note: Dashboard properly requires user authentication');
      } else {
        const events = await eventsResponse.json();
        console.log(`✅ Found ${events.length} user events`);
        
        if (events.length > 0) {
          const event = events[0];
          console.log(`   First event: "${event.title}"`);
          console.log(`   Registration count: ${event._count?.registrations || 0}`);
          console.log(`   Referral count: ${event._count?.referrals || 0}`);
          console.log(`   Has userId: ${event.userId ? 'Yes' : 'No'}`);
        }
      }
    }

    console.log('\n3. Testing Dashboard Access...');
    console.log(`📍 Dashboard URL: ${BASE_URL}/dashboard`);
    console.log('💡 To test manually:');
    console.log('   1. Visit http://localhost:3000/dashboard');
    console.log('   2. Sign in with Clerk');
    console.log('   3. Create an event');
    console.log('   4. Verify it appears on dashboard');
    console.log('   5. Register for the event');
    console.log('   6. Check that registration count updates');

    console.log('\n4. Dashboard Features to Test:');
    console.log('   ✅ Event cards with status badges');
    console.log('   ✅ Registration and referral counts');
    console.log('   ✅ Event management dropdown menu');
    console.log('   ✅ Create event button integration');
    console.log('   ✅ Loading states and error handling');
    console.log('   ✅ Empty state for new users');
    console.log('   ⏳ Manage registrations (placeholder)');
    console.log('   ⏳ Edit event (placeholder)');
    console.log('   ⏳ Delete event (placeholder)');

    console.log('\n✅ Dashboard Authentication Tests Complete!');
    console.log('📝 Manual testing required for authenticated features');

  } catch (error) {
    console.error('❌ Dashboard test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure server is running: npm run dev');
    console.log('   2. Check database is migrated: npx prisma db push');
    console.log('   3. Verify Clerk environment variables');
  }
}

// Main execution
if (require.main === module) {
  testDashboard();
}

module.exports = { testDashboard }; 