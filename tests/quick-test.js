#!/usr/bin/env node

/**
 * Quick Test Script
 * Run individual tests or quick checks
 */

const BASE_URL = 'http://localhost:3000';

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const data = await response.json();
    return { response, data, ok: response.ok, status: response.status };
  } catch (error) {
    return { error, ok: false };
  }
}

// Quick tests
async function testCreateEvent() {
  log('🎯 Quick Test: Creating Event');
  
  const testEvent = {
    title: 'Quick Test Event',
    date: '2025-12-20',
    time: '15:00',
    location: 'Quick Test Location',
    bio: 'Quick test event description',
    agenda: 'Quick test agenda'
  };
  
  const result = await makeRequest(`${BASE_URL}/api/events`, {
    method: 'POST',
    body: JSON.stringify(testEvent)
  });
  
  if (result.ok && result.data?.id) {
    log(`✅ Event created! ID: ${result.data.id}`, 'success');
    log(`🔗 View at: ${BASE_URL}/event/${result.data.id}`, 'info');
    return result.data.id;
  } else {
    log(`❌ Failed: ${result.data?.error || result.error?.message}`, 'error');
    return null;
  }
}

async function testRegisterForEvent(eventId) {
  if (!eventId) {
    log('❌ No event ID provided', 'error');
    return false;
  }
  
  log(`🎯 Quick Test: Registering for Event ${eventId}`);
  
  const registration = {
    name: 'Quick Test User',
    email: `quicktest-${Date.now()}@example.com`,
    eventId
  };
  
  const result = await makeRequest(`${BASE_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify(registration)
  });
  
  if (result.ok && result.data?.success) {
    log(`✅ Registration successful!`, 'success');
    log(`📧 Email would be sent to: ${registration.email}`, 'info');
    return true;
  } else {
    log(`❌ Failed: ${result.data?.error || result.error?.message}`, 'error');
    return false;
  }
}

async function testGetEvent(eventId) {
  if (!eventId) {
    log('❌ No event ID provided', 'error');
    return false;
  }
  
  log(`🎯 Quick Test: Getting Event ${eventId}`);
  
  const result = await makeRequest(`${BASE_URL}/api/events/${eventId}`);
  
  if (result.ok) {
    log(`✅ Event retrieved!`, 'success');
    log(`📝 Title: ${result.data.title}`, 'info');
    log(`📅 Date: ${result.data.date}`, 'info');
    log(`👥 Registrations: ${result.data._count?.registrations || 0}`, 'info');
    return true;
  } else {
    log(`❌ Failed: ${result.data?.error || result.error?.message}`, 'error');
    return false;
  }
}

// Main runner
async function main() {
  const command = process.argv[2];
  const eventId = process.argv[3];
  
  if (!command) {
    log('Usage:', 'info');
    log('  node quick-test.js create              # Create a test event', 'info');
    log('  node quick-test.js register <eventId>  # Register for an event', 'info');
    log('  node quick-test.js get <eventId>       # Get event details', 'info');
    log('  node quick-test.js flow                # Run create + register flow', 'info');
    return;
  }
  
  switch (command) {
    case 'create':
      await testCreateEvent();
      break;
      
    case 'register':
      await testRegisterForEvent(eventId);
      break;
      
    case 'get':
      await testGetEvent(eventId);
      break;
      
    case 'flow':
      log('🚀 Running Quick Flow Test', 'info');
      const newEventId = await testCreateEvent();
      if (newEventId) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
        await testGetEvent(newEventId);
        await testRegisterForEvent(newEventId);
      }
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, 'error');
      break;
  }
}

main().catch(error => {
  log(`💥 Error: ${error.message}`, 'error');
  process.exit(1);
}); 