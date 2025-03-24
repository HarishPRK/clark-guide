require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

// Check if API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log('Using Claude API Key:', process.env.OPENAI_API_KEY.substring(0, 12) + '...');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testClaude() {
  try {
    console.log('Testing Claude API connection...');
    
    const completion = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      temperature: 0.7,
      system: 'You are ClarkAI, a helpful assistant for Clark University students.',
      messages: [
        { role: 'user', content: 'Hello, can you tell me about the library hours at Clark University?' }
      ]
    });

    console.log('\nAPI TEST SUCCESSFUL!');
    console.log('Response:');
    
    if (completion.content && completion.content.length > 0) {
      const contentBlock = completion.content[0];
      if (contentBlock.type === 'text') {
        console.log(contentBlock.text);
      } else {
        console.log('Non-text response received:', contentBlock);
      }
    } else {
      console.log('No content received in response');
    }
    
    console.log('\nYour Claude API key is valid and working correctly.');
  } catch (error) {
    console.error('\nAPI TEST FAILED!');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.error('\nPlease check your Claude API key and network connection.');
  }
}

testClaude();
