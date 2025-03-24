# ClarkGuide Demo Mode

This document provides information about the demonstration mode for the Clark University AI Chatbox.

## Mock AI Service

The application includes a Mock AI Service that can be used in the following scenarios:

1. When the OpenAI API key is not available or invalid
2. For demonstration and testing purposes without using API credits
3. As a fallback when the OpenAI service experiences errors

## How it Works

The Mock AI Service provides pre-defined responses to common keywords:

- **Courses**: Information about course registration
- **Library**: Library hours and resources
- **ClarkYou**: Assistance with the university portal
- **OneCard**: Information about student ID cards
- **Appointments**: How to schedule appointments
- **Schedules**: Faculty scheduling information
- **Transportation**: Information about Transloc, MBTA, and WRTA
- **Places near Clark**: Restaurants and shops

## Using Demo Mode

By default, the application will attempt to use the OpenAI API if a valid API key is provided in the .env file. If no key is available or if the API call fails, it will automatically fall back to the Mock AI Service.

To force the use of the Mock AI Service (even with a valid API key):

1. Edit the `.env` file and comment out the `OPENAI_API_KEY` line
2. Restart the backend server

## Benefits of Demo Mode

- **Consistent Responses**: Predictable answers for demonstration purposes
- **No API Costs**: No OpenAI API credits are used
- **Fast Response Time**: No network latency for API calls
- **Hackathon-Ready**: Perfect for showcasing the project without depending on external services

## Running the Application with Demo Mode

Start the application as normal:

```bash
# Terminal 1: Backend
cd clark-chatbox/backend
npm run dev

# Terminal 2: Frontend 
cd clark-chatbox/frontend
npm start
```

The application will automatically detect whether to use the real OpenAI API or the Mock AI Service.

## Sample Questions for Demo

Try these questions to see how the Mock AI Service responds:

- "How do I register for courses?"
- "What are the library hours?"
- "I need help with my OneCard"
- "How can I schedule an appointment?"
- "What restaurants are near Clark?"
