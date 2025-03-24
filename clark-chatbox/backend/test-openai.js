require('dotenv').config();
const { OpenAI } = require('openai');

// Check if API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log('Using OpenAI API Key:', process.env.OPENAI_API_KEY.substring(0, 12) + '...');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API connection...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, can you hear me? Please respond with a short message.' }
      ],
      max_tokens: 50
    });

    console.log('\nAPI TEST SUCCESSFUL!');
    console.log('Response:', completion.choices[0].message.content);
    console.log('\nYour OpenAI API key is valid and working correctly.');
  } catch (error) {
    console.error('\nAPI TEST FAILED!');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.error('\nPlease check your OpenAI API key and network connection.');
  }
}

testOpenAI();
