# Claude AI Integration for Clark University Chatbox

This document provides information about the Claude AI integration for the Clark University chatbot.

## Overview

The Clark University AI Chatbox now supports integration with Anthropic's Claude AI models. This integration allows the chatbot to process and respond to user queries using Claude's powerful language understanding capabilities.

## Features

- **Claude AI Processing**: Utilize Claude's powerful language models for natural, contextual responses
- **Flexible Model Selection**: Configured to use the Claude 3 Haiku model, but can be easily changed to other Claude models
- **Intelligent Intent Detection**: Simple keyword-based intent detection to categorize user queries
- **Fallback System**: Three-tier fallback system (Claude → OpenAI → Mock Service) ensures reliable operations
- **Environment Variable Configuration**: Easy to configure through environment variables

## Setup

1. Obtain a Claude API key from Anthropic
2. Add your API key to the `.env` file in the backend directory:
   ```
   OPENAI_API_KEY=your_claude_api_key_here
   USE_CLAUDE=true
   ```
3. Restart the backend server

## Testing Claude Integration

You can test the Claude integration by running the test script:

```bash
cd clark-chatbox/backend
node test-claude.js
```

This will send a test message to Claude and display the response, confirming that your API key and connection are working correctly.

## How It Works

1. The AI service first checks if Claude integration is enabled via the `USE_CLAUDE` environment variable
2. If enabled, user messages are sent to Claude for processing
3. Claude generates a response based on the system prompt and user query
4. The response is processed, with intent detection to categorize the type of query
5. If Claude fails for any reason, the system falls back to OpenAI, and finally to the Mock Service

## Modifying the Claude Implementation

### Changing the Claude Model

You can change which Claude model is used by modifying the `model` parameter in `claudeService.ts`. Available models include:

- `claude-3-haiku-20240307` (faster, more cost-effective)
- `claude-3-opus-20240229` (most capable)
- `claude-3-sonnet-20240229` (balanced capability and cost)

```typescript
const completion = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307', // Change this to the desired model
  // other parameters...
});
```

### System Prompt

The system prompt defines Claude's behavior and capabilities. You can modify this in the `constructor` of the `ClaudeService` class in `claudeService.ts`.

## Troubleshooting

If you encounter issues with the Claude integration:

1. Check that your API key is valid and correctly set in the `.env` file
2. Verify that the model name is correct and available to your API key
3. Run the test script to diagnose any connection issues
4. Check the server logs for detailed error messages
5. If Claude is unavailable, the system will automatically fall back to OpenAI or the Mock Service

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Claude Models Overview](https://www.anthropic.com/claude)
- [Claude API SDK for Node.js](https://github.com/anthropics/anthropic-sdk-typescript)
