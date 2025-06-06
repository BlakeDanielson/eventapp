#!/usr/bin/env node

/**
 * Core Functionality Test Suite
 * Tests the main flows: Event Creation → Event Retrieval → Registration → Duplicate Prevention
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testEvent = {
  title: 'Test Event - Automated Test',
  date: '2025-12-15',
  time: '14:00',
  location: 'Test Location, Test City',
  bio: 'This is a test event created by the automated test suite.',
  agenda: 'Test agenda item 1\nTest agenda item 2',
  qa: 'Q: Is this a test? A: Yes!'
};

const testRegistration1 = {
  name: 'Test User',
  email: 'test@example.com'
};

const testRegistration2 = {
  name: 'Test User 2',
  email: 'test2@example.com'
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data, ok: response.ok, status: response.status };
  } catch (error) {
    log(`Request failed: ${error.message}`, 'error');
    return { error, ok: false };
  }
}

// Test functions
async function testEventCreation() {
  log('🧪 Testing Event Creation...', 'info');
  
  const result = await makeRequest(`${BASE_URL}/api/events`, {
    method: 'POST',
    body: JSON.stringify(testEvent)
  });
  
  if (!result.ok) {
    log(`❌ Event creation failed: ${result.data?.error || result.error?.message}`, 'error');
    return null;
  }
  
  if (result.data?.id) {
    log(`✅ Event created successfully! ID: ${result.data.id}`, 'success');
    return result.data.id;
  } else {
    log('❌ Event creation returned success but no ID', 'error');
    return null;
  }
}

async function testEventRetrieval(eventId) {
  log(`🧪 Testing Event Retrieval for ID: ${eventId}...`, 'info');
  
  const result = await makeRequest(`${BASE_URL}/api/events/${eventId}`);
  
  if (!result.ok) {
    log(`❌ Event retrieval failed: ${result.data?.error || result.error?.message}`, 'error');
    return false;
  }
  
  const event = result.data;
  
  // Verify event data
  const checks = [
    { field: 'title', expected: testEvent.title, actual: event.title },
    { field: 'location', expected: testEvent.location, actual: event.location },
    { field: 'bio', expected: testEvent.bio, actual: event.bio }
  ];
  
  let allCorrect = true;
  for (const check of checks) {
    if (check.expected !== check.actual) {
      log(`❌ Event ${check.field} mismatch. Expected: "${check.expected}", Got: "${check.actual}"`, 'error');
      allCorrect = false;
    }
  }
  
  if (allCorrect) {
    log('✅ Event retrieval successful and data matches!', 'success');
    return true;
  }
  
  return false;
}

async function testSingleRegistration(eventId, registration, shouldSucceed = true) {
  log(`🧪 Testing Registration for ${registration.name}...`, 'info');
  
  const result = await makeRequest(`${BASE_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...registration,
      eventId
    })
  });
  
  if (shouldSucceed) {
    if (!result.ok) {
      log(`❌ Registration failed: ${result.data?.error || result.error?.message}`, 'error');
      return false;
    }
    
    if (result.data?.success && result.data?.registration) {
      log(`✅ Registration successful for ${registration.name}!`, 'success');
      log(`   Registration ID: ${result.data.registration.id}`, 'info');
      return true;
    } else {
      log('❌ Registration returned success but missing data', 'error');
      return false;
    }
  } else {
    // Should fail
    if (result.ok) {
      log(`❌ Registration should have failed but succeeded`, 'error');
      return false;
    } else {
      log(`✅ Registration correctly failed: ${result.data?.error}`, 'success');
      return true;
    }
  }
}

async function testDuplicateRegistration(eventId) {
  log('🧪 Testing Duplicate Registration Prevention...', 'info');
  
  // First registration should succeed
  const firstResult = await testSingleRegistration(eventId, testRegistration1, true);
  if (!firstResult) return false;
  
  // Second registration with same email should fail
  const duplicateResult = await testSingleRegistration(eventId, testRegistration1, false);
  return duplicateResult;
}

async function testInvalidEventRegistration() {
  log('🧪 Testing Registration for Non-existent Event...', 'info');
  
  const fakeEventId = 'fake-event-id-12345';
  const result = await makeRequest(`${BASE_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...testRegistration2,
      eventId: fakeEventId
    })
  });
  
  if (!result.ok && result.data?.error?.includes('Event not found')) {
    log('✅ Registration correctly failed for non-existent event', 'success');
    return true;
  } else {
    log('❌ Registration should have failed for non-existent event', 'error');
    return false;
  }
}

async function testEventNotFound() {
  log('🧪 Testing Event Retrieval for Non-existent Event...', 'info');
  
  const fakeEventId = 'fake-event-id-12345';
  const result = await makeRequest(`${BASE_URL}/api/events/${fakeEventId}`);
  
  if (!result.ok && result.status === 404) {
    log('✅ Event retrieval correctly returned 404 for non-existent event', 'success');
    return true;
  } else {
    log('❌ Event retrieval should have returned 404 for non-existent event', 'error');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Core Functionality Test Suite', 'info');
  log('=' .repeat(60), 'info');
  
  const results = [];
  let eventId = null;
  
  try {
    // Test 1: Event Creation
    eventId = await testEventCreation();
    results.push({ test: 'Event Creation', passed: !!eventId });
    
    if (eventId) {
      // Test 2: Event Retrieval
      const retrievalResult = await testEventRetrieval(eventId);
      results.push({ test: 'Event Retrieval', passed: retrievalResult });
      
      // Test 3: Registration
      const registrationResult = await testSingleRegistration(eventId, testRegistration2, true);
      results.push({ test: 'Registration', passed: registrationResult });
      
      // Test 4: Duplicate Registration Prevention
      const duplicateResult = await testDuplicateRegistration(eventId);
      results.push({ test: 'Duplicate Prevention', passed: duplicateResult });
    }
    
    // Test 5: Invalid Event Registration
    const invalidEventResult = await testInvalidEventRegistration();
    results.push({ test: 'Invalid Event Registration', passed: invalidEventResult });
    
    // Test 6: Event Not Found
    const notFoundResult = await testEventNotFound();
    results.push({ test: 'Event Not Found', passed: notFoundResult });
    
  } catch (error) {
    log(`💥 Unexpected error during tests: ${error.message}`, 'error');
    results.push({ test: 'Test Suite', passed: false, error: error.message });
  }
  
  // Print results
  log('', 'info');
  log('📊 Test Results:', 'info');
  log('=' .repeat(60), 'info');
  
  let passed = 0;
  let total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASSED' : 'FAILED';
    log(`${icon} ${result.test}: ${status}`, result.passed ? 'success' : 'error');
    if (result.error) {
      log(`   Error: ${result.error}`, 'error');
    }
    if (result.passed) passed++;
  });
  
  log('', 'info');
  log(`🎯 Overall Results: ${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');
  
  if (eventId) {
    log(`📝 Test event created with ID: ${eventId}`, 'info');
    log(`🔗 View at: ${BASE_URL}/event/${eventId}`, 'info');
  }
  
  log('=' .repeat(60), 'info');
  
  return passed === total;
}

// Check if server is running
async function checkServer() {
  log('🔍 Checking if development server is running...', 'info');
  
  try {
    const response = await fetch(`${BASE_URL}/api/events`);
    
    // 405 Method Not Allowed means server is up but doesn't support GET
    if (response.status === 405) {
      log('✅ Development server is running!', 'success');
      return true;
    }
    
    // Try to parse JSON if response is OK
    if (response.ok) {
      const data = await response.json();
      log('✅ Development server is running!', 'success');
      return true;
    }
    
    log('❌ Development server responded but with unexpected status', 'error');
    return false;
    
  } catch (error) {
    log('❌ Development server is not running or not accessible', 'error');
    log('💡 Please run: npm run dev', 'warning');
    return false;
  }
}

// Entry point
(async () => {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  const allPassed = await runAllTests();
  process.exit(allPassed ? 0 : 1);
})(); 