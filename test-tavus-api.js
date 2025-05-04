const fetch = require('node-fetch');
const { performance } = require('perf_hooks');

// Load the Tavus prompts to get the replica and persona IDs
const tavusPrompts = require('./front-end/project/tavus-prompts.json');

// Get the API key from the .env file or use the one from the logs
const TAVUS_API_KEY = '5e123216085a43b0a8e69746e6abc1e8';

// Get the genre config for spy-novel (or any other genre you want to test)
const genreConfig = tavusPrompts.genres['spy-novel'];

async function testTavusAPI() {
  console.log('Testing Tavus API...');
  console.log('Using genre config:', genreConfig);
  console.log('API Key:', TAVUS_API_KEY.substring(0, 5) + '...');
  
  const startTime = performance.now();
  
  try {
    console.log('Making request to https://api.tavus.io/v2/videos...');
    
    const response = await fetch('https://api.tavus.io/v2/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY,
      },
      body: JSON.stringify({
        replica_id: genreConfig.replica_id,
        persona_id: genreConfig.persona_id,
        script: 'Hello! I am your writing coach. I am here to help you with your project.',
      }),
    });
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log(`Request completed in ${duration.toFixed(2)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response:', data);
      
      // If the response includes a video URL, log it
      if (data.video_url) {
        console.log('Video URL:', data.video_url);
      }
    } else {
      console.log('API Error:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        console.log('Error details:', errorData);
      } catch (e) {
        const errorText = await response.text();
        console.log('Error details (text):', errorText);
      }
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log(`Request failed after ${duration.toFixed(2)} seconds`);
    console.error('Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Connection refused. The server might be down or the hostname might be incorrect.');
    } else if (error.code === 'ENOTFOUND') {
      console.log('Hostname not found. Check if the domain is correct.');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('Connection timed out. The server might be slow to respond or unreachable.');
    }
  }
}

// Now let's also test the conversation API
async function testTavusConversationAPI() {
  console.log('\nTesting Tavus Conversation API...');
  console.log('Using genre config:', genreConfig);
  console.log('API Key:', TAVUS_API_KEY.substring(0, 5) + '...');
  
  const startTime = performance.now();
  
  try {
    console.log('Making request to https://api.tavus.io/v2/conversations...');
    
    const response = await fetch('https://api.tavus.io/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY,
      },
      body: JSON.stringify({
        replica_id: genreConfig.replica_id,
        persona_id: genreConfig.persona_id,
        conversation_name: `Writing Coach Session - ${genreConfig.name}`,
        conversational_context: `The user is working on a spy-novel project and needs writing guidance. Use the persona of a ${genreConfig.name} to provide helpful advice.`,
        custom_greeting: `Hello! I'm your ${genreConfig.name}. I'm here to help you with your spy-novel writing project. What aspect of your story would you like to discuss today?`,
        callback_url: 'https://your-domain.com/api/tavus/transcript', // This is where the transcript would be sent
        properties: {
          max_call_duration: 1800, // 30 minutes
        }
      }),
    });
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log(`Request completed in ${duration.toFixed(2)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response:', data);
      
      // If the response includes a conversation URL, log it
      if (data.conversation_url) {
        console.log('Conversation URL:', data.conversation_url);
      }
    } else {
      console.log('API Error:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        console.log('Error details:', errorData);
      } catch (e) {
        const errorText = await response.text();
        console.log('Error details (text):', errorText);
      }
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log(`Request failed after ${duration.toFixed(2)} seconds`);
    console.error('Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Connection refused. The server might be down or the hostname might be incorrect.');
    } else if (error.code === 'ENOTFOUND') {
      console.log('Hostname not found. Check if the domain is correct.');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('Connection timed out. The server might be slow to respond or unreachable.');
    }
  }
}

// Run both tests
async function runTests() {
  await testTavusAPI();
  await testTavusConversationAPI();
}

runTests();
