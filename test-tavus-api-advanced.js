const fetch = require('node-fetch');
const { performance } = require('perf_hooks');
const fs = require('fs');

// Load the Tavus prompts to get the replica and persona IDs
const tavusPrompts = require('./front-end/project/tavus-prompts.json');

// Get the API key from the .env file or use the one from the logs
const TAVUS_API_KEY = '5e123216085a43b0a8e69746e6abc1e8';

// Get the genre config for spy-novel (or any other genre you want to test)
const genreConfig = tavusPrompts.genres['spy-novel'];

// Create a log file
const logStream = fs.createWriteStream('tavus-api-test.log', { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
};

// Test different API endpoints
async function testEndpoint(url, method = 'GET', headers = {}, body = null, timeout = 30000) {
  log(`Testing endpoint: ${url} (${method})`);
  log(`Headers: ${JSON.stringify(headers)}`);
  if (body) {
    log(`Body: ${JSON.stringify(body)}`);
  }
  
  const startTime = performance.now();
  
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout);
    });
    
    // Create the fetch promise
    const fetchPromise = fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    log(`Request completed in ${duration.toFixed(2)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      log(`Success! Response: ${JSON.stringify(data, null, 2)}`);
      return { success: true, data, duration };
    } else {
      log(`API Error: ${response.status} ${response.statusText}`);
      try {
        const errorData = await response.json();
        log(`Error details: ${JSON.stringify(errorData, null, 2)}`);
      } catch (e) {
        const errorText = await response.text();
        log(`Error details (text): ${errorText}`);
      }
      return { success: false, status: response.status, duration };
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    log(`Request failed after ${duration.toFixed(2)} seconds`);
    log(`Error: ${error.message}`);
    
    if (error.code) {
      log(`Error code: ${error.code}`);
    }
    
    return { success: false, error: error.message, duration };
  }
}

// Test different API endpoints with different timeouts
async function runTests() {
  log('Starting Tavus API tests...');
  log(`Using genre config: ${JSON.stringify(genreConfig, null, 2)}`);
  log(`API Key: ${TAVUS_API_KEY.substring(0, 5)}...`);
  
  // Test 1: Simple GET request to check if the domain is reachable
  log('\n=== Test 1: Simple GET request to check if the domain is reachable ===');
  await testEndpoint('https://api.tavus.io', 'GET', {}, null, 10000);
  
  // Test 2: Check if the videos endpoint exists
  log('\n=== Test 2: Check if the videos endpoint exists ===');
  await testEndpoint('https://api.tavus.io/v2/videos', 'GET', {
    'x-api-key': TAVUS_API_KEY
  }, null, 10000);
  
  // Test 3: Create a video with a short timeout
  log('\n=== Test 3: Create a video with a short timeout (10s) ===');
  await testEndpoint('https://api.tavus.io/v2/videos', 'POST', {
    'Content-Type': 'application/json',
    'x-api-key': TAVUS_API_KEY
  }, {
    replica_id: genreConfig.replica_id,
    persona_id: genreConfig.persona_id,
    script: 'Hello! I am your writing coach. I am here to help you with your project.'
  }, 10000);
  
  // Test 4: Create a video with a longer timeout
  log('\n=== Test 4: Create a video with a longer timeout (30s) ===');
  await testEndpoint('https://api.tavus.io/v2/videos', 'POST', {
    'Content-Type': 'application/json',
    'x-api-key': TAVUS_API_KEY
  }, {
    replica_id: genreConfig.replica_id,
    persona_id: genreConfig.persona_id,
    script: 'Hello! I am your writing coach. I am here to help you with your project.'
  }, 30000);
  
  // Test 5: Create a video with a very long timeout
  log('\n=== Test 5: Create a video with a very long timeout (60s) ===');
  await testEndpoint('https://api.tavus.io/v2/videos', 'POST', {
    'Content-Type': 'application/json',
    'x-api-key': TAVUS_API_KEY
  }, {
    replica_id: genreConfig.replica_id,
    persona_id: genreConfig.persona_id,
    script: 'Hello! I am your writing coach. I am here to help you with your project.'
  }, 60000);
  
  // Test 6: Check if the conversations endpoint exists
  log('\n=== Test 6: Check if the conversations endpoint exists ===');
  await testEndpoint('https://api.tavus.io/v2/conversations', 'GET', {
    'x-api-key': TAVUS_API_KEY
  }, null, 10000);
  
  // Test 7: Create a conversation with a short timeout
  log('\n=== Test 7: Create a conversation with a short timeout (10s) ===');
  await testEndpoint('https://api.tavus.io/v2/conversations', 'POST', {
    'Content-Type': 'application/json',
    'x-api-key': TAVUS_API_KEY
  }, {
    replica_id: genreConfig.replica_id,
    persona_id: genreConfig.persona_id,
    conversation_name: `Writing Coach Session - ${genreConfig.name}`,
    conversational_context: `The user is working on a spy-novel project and needs writing guidance.`,
    custom_greeting: `Hello! I'm your writing coach.`,
    callback_url: 'https://your-domain.com/api/tavus/transcript',
    properties: {
      max_call_duration: 1800
    }
  }, 10000);
  
  // Test 8: Create a conversation with a longer timeout
  log('\n=== Test 8: Create a conversation with a longer timeout (30s) ===');
  await testEndpoint('https://api.tavus.io/v2/conversations', 'POST', {
    'Content-Type': 'application/json',
    'x-api-key': TAVUS_API_KEY
  }, {
    replica_id: genreConfig.replica_id,
    persona_id: genreConfig.persona_id,
    conversation_name: `Writing Coach Session - ${genreConfig.name}`,
    conversational_context: `The user is working on a spy-novel project and needs writing guidance.`,
    custom_greeting: `Hello! I'm your writing coach.`,
    callback_url: 'https://your-domain.com/api/tavus/transcript',
    properties: {
      max_call_duration: 1800
    }
  }, 30000);
  
  // Test 9: Try a different API endpoint (tavusapi.com instead of api.tavus.io)
  log('\n=== Test 9: Try a different API endpoint (tavusapi.com) ===');
  await testEndpoint('https://tavusapi.com/v2/videos', 'POST', {
    'Content-Type': 'application/json',
    'x-api-key': TAVUS_API_KEY
  }, {
    replica_id: genreConfig.replica_id,
    persona_id: genreConfig.persona_id,
    script: 'Hello! I am your writing coach. I am here to help you with your project.'
  }, 30000);
  
  log('\nAll tests completed. Check the log file for details: tavus-api-test.log');
  logStream.end();
}

// Run the tests
runTests();
