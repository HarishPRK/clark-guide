import { OpenAI } from 'openai';

// Load OpenAI API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define message interface
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserQuery {
  text: string;
  userId?: string;
  userType?: 'student' | 'faculty' | 'other';
  sessionId?: string;
}

export interface AIResponse {
  text: string;
  intent: string;
  confidence: number;
  category: 'student' | 'faculty' | 'other';
  subcategory?: string;
  sources?: string[];
}

export class AIService {
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = `
      You are Clark AI, a helpful assistant for Clark University students, faculty, and visitors.
      
      Your main capabilities include:
      
      For Students:
      - Providing information about courses
      - Offering details about campus resources like the Library, Kneller, Dolan Field House
      - Helping with ClarkYou credentials
      - Answering OneCard queries
      - Scheduling appointments
      - Handling other student queries or feedback
      
      For Faculty:
      - Providing information about campus resources, especially the Library
      - Offering details about course schedules
      - Handling other faculty queries or feedback
      
      For Other Users:
      - Providing information about commuter options (Transloc, MBTA, WRTA)
      - Offering details about places near Clark University
      
      Be concise, accurate, and helpful in your responses. If you're not sure about something, 
      be honest about your limitations.
    `;
  }

  // Process user message and determine intent and response
  async processMessage(query: UserQuery): Promise<AIResponse> {
    try {
      // Prepare conversation for OpenAI
      const messages: Message[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: query.text }
      ];

      // Generate response from OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        tools: [
          {
            type: 'function',
            function: {
              name: 'categorize_query',
              description: 'Categorize the user query and extract intent',
              parameters: {
                type: 'object',
                properties: {
                  intent: {
                    type: 'string',
                    description: 'The specific intent of the user query (e.g., course_info, library_hours, onecard_lost)'
                  },
                  category: {
                    type: 'string',
                    enum: ['student', 'faculty', 'other'],
                    description: 'The main category the query belongs to'
                  },
                  subcategory: {
                    type: 'string',
                    description: 'The specific subcategory (e.g., courses, campus_resources, credentials)'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score from 0 to 1 for this categorization'
                  }
                },
                required: ['intent', 'category', 'confidence']
              }
            }
          }
        ],
        tool_choice: 'auto'
      });

      // Extract the tool call result and the assistant's response
      const responseMessage = completion.choices[0].message;
      const toolCall = responseMessage.tool_calls?.[0];
      
      let intent = 'general_inquiry';
      let category = query.userType || 'student';
      let subcategory = undefined;
      let confidence = 0.7;
      
      // Parse the tool call result if it exists
      if (toolCall && toolCall.function.name === 'categorize_query') {
        const toolCallResult = JSON.parse(toolCall.function.arguments);
        intent = toolCallResult.intent;
        category = toolCallResult.category;
        subcategory = toolCallResult.subcategory;
        confidence = toolCallResult.confidence;
      }

      // Return the response and metadata
      return {
        text: responseMessage.content || "I'm sorry, I couldn't process that request.",
        intent,
        category: category as 'student' | 'faculty' | 'other',
        subcategory,
        confidence,
        sources: [] // In a real implementation, this would include knowledge base sources
      };
    } catch (error) {
      console.error('Error processing message with AI:', error);
      return {
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        intent: 'error',
        category: 'other',
        confidence: 0
      };
    }
  }

  // Mock function to determine the appropriate service for a query
  // In a real implementation, this would use a more sophisticated routing mechanism
  determineService(intent: string, category: string): string {
    if (category === 'student') {
      if (intent.includes('course')) return 'student.courses';
      if (intent.includes('library') || intent.includes('kneller') || intent.includes('dolan')) 
        return 'student.campus_resources';
      if (intent.includes('clarkyou')) return 'student.credentials';
      if (intent.includes('onecard')) return 'student.onecard';
      if (intent.includes('appointment')) return 'student.appointments';
      return 'student.general';
    } else if (category === 'faculty') {
      if (intent.includes('library')) return 'faculty.campus_resources';
      if (intent.includes('schedule')) return 'faculty.schedules';
      return 'faculty.general';
    } else {
      if (intent.includes('transloc') || intent.includes('mbta') || intent.includes('wrta'))
        return 'other.commuter';
      if (intent.includes('place') || intent.includes('restaurant') || intent.includes('shop'))
        return 'other.places_near';
      return 'other.general';
    }
  }
}

export default new AIService();
