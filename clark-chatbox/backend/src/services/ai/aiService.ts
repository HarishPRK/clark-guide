import mockAiService from './mockAiService';
import claudeService from './claudeService';

// Determine which AI service to use
let useClaude = false;

try {
  // Check if we should use Claude
  if (process.env.OPENAI_API_KEY) {
    console.log('Claude API initialized with API key');
    useClaude = true;
  } else {
    console.warn('No API key found, using Mock AI Service as fallback');
  }
} catch (error) {
  console.error('Error initializing AI services:', error);
  console.warn('Using Mock AI Service as fallback');
}

// Log which service is active for clarity
if (useClaude) {
  console.log('PRIMARY AI SERVICE: Claude');
} else {
  console.log('PRIMARY AI SERVICE: Mock Service (fallback)');
}

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
  userEmail?: string;
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
    console.log(`Received query: "${query.text}" from ${query.userType || 'unknown'} user`);
    
    try {
      // Try Claude if enabled - with proper error handling
      if (useClaude) {
        console.log('Using Claude AI Service for query');
        try {
          const claudeResponse = await claudeService.processMessage(query);
          console.log('Claude response successful');
          return claudeResponse;
        } catch (claudeError) {
          console.error('Claude API error:', claudeError);
          console.log('Falling back to mock service after Claude error');
          // Fall through to mock service below
        }
      }
    } catch (error) {
      console.error('Error processing message with Claude:', error);
    }
    
    // Fallback to mock service
    console.log('Using Mock AI Service (fallback) for query');
    try {
      return await mockAiService.processMessage(query);
    } catch (mockError) {
      console.error('Even mock service failed:', mockError);
      // Return a basic error response as absolute fallback
      return {
        text: "I'm sorry, I encountered a server error. Please try again later.",
        intent: 'error',
        category: query.userType as 'student' | 'faculty' | 'other' || 'student',
        confidence: 0,
        sources: ['Error Handler']
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
