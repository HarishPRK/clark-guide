import { Message, UserQuery, AIResponse } from './aiService';
import Anthropic from '@anthropic-ai/sdk';
import roomBookingService from './roomBookingService';
import campusInsightService from './campusInsightService';

// Initialize Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.OPENAI_API_KEY, // Using the environment variable for Claude API key
});

// Log initialization
console.log('Anthropic client initialized');

export class ClaudeService {
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

  // Process user message using Claude API
  async processMessage(query: UserQuery): Promise<AIResponse> {
    try {
      console.log('Using Claude for query:', query.text);
      
      const lowerCaseText = query.text.toLowerCase();
      const sessionId = query.sessionId || 'default';
      
      // Check if this is a study room booking request
      if ((lowerCaseText.includes('book') || lowerCaseText.includes('reserve') || 
           lowerCaseText.includes('need') || lowerCaseText.includes('want') || 
           lowerCaseText.includes('looking for')) && 
          (lowerCaseText.includes('study room') || lowerCaseText.includes('room') || 
           lowerCaseText.includes('study space') || lowerCaseText.includes('place to study'))) {
        console.log("Claude detected study room booking request, delegating to room booking service");
        return roomBookingService.handleBookingRequest(query);
      }
      
      // If this session has an active booking conversation, delegate to booking service
      if (roomBookingService.hasActiveBookingConversation(sessionId)) {
        console.log("Claude detected ongoing booking conversation, delegating to room booking service");
        return roomBookingService.handleBookingRequest(query);
      }
      
      // Check if this is a campus occupancy related query
      if (campusInsightService.isCampusQuery(lowerCaseText)) {
        console.log("Claude detected campus occupancy query, delegating to campus insight service");
        return campusInsightService.handleCampusQuery(query);
      }
      
      // Check specifically for OneCard balance queries
      if ((lowerCaseText.includes('onecard') || lowerCaseText.includes('one card')) && 
          (lowerCaseText.includes('balance') || lowerCaseText.includes('amount'))) {
        // Add a 3-second delay before responding
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Return hardcoded response for OneCard balance
        return {
          text: "Your OneCard balance is $157.28.",
          intent: 'onecard_balance_inquiry',
          category: query.userType as 'student' | 'faculty' | 'other' || 'student',
          subcategory: 'onecard',
          confidence: 0.98,
          sources: ['Claude AI']
        };
      }
      
      // Check for course schedule specifically
      if ((lowerCaseText.includes('course') || lowerCaseText.includes('class') || 
           lowerCaseText.includes('schedule') || lowerCaseText.includes('timetable')) && 
          (lowerCaseText.includes('my') || lowerCaseText.includes('schedule') || lowerCaseText.includes('when'))) {
        // Add a 3-second delay before responding
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Return hardcoded course schedule
        return {
          text: `Here is your course schedule, Harish:

1. Advanced Software Engineering (CS 546)
   • Day: Monday
   • Time: 6:30 PM - 9:30 PM
   • Location: Jonas Clark Hall, Room 218

2. Data Privacy and Security (CS 538)
   • Day: Wednesday
   • Time: 6:30 PM - 9:30 PM
   • Location: Sackler Sciences Center, Room 302

3. Mobile App Development (CS 559)
   • Day: Friday
   • Time: 6:30 PM - 9:30 PM
   • Location: Lasry Center, Room 124`,
          intent: 'course_schedule_inquiry',
          category: query.userType as 'student' | 'faculty' | 'other' || 'student',
          subcategory: 'courses',
          confidence: 0.98,
          sources: ['Claude AI']
        };
      }
      
      // Create a message with Claude for all other queries
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Using Claude 3 Haiku
        max_tokens: 500,
        temperature: 0.7,
        system: this.systemPrompt,
        messages: [
          { role: 'user', content: query.text }
        ]
      });

      // Extract the response
      let responseText = "I'm sorry, I couldn't process that request.";
      
      if (completion.content && completion.content.length > 0) {
        const contentBlock = completion.content[0];
        if (contentBlock.type === 'text') {
          responseText = contentBlock.text;
        }
      }
      
      // Since Claude doesn't have built-in function calling like OpenAI,
      // we'll make a best guess at intent and category based on user type and keywords
      let intent = 'general_inquiry';
      let category = query.userType || 'student';
      let subcategory: string | undefined = undefined;
      let confidence = 0.7;
      
      // Basic intent detection (can be made more sophisticated)
      if (lowerCaseText.includes('course') || lowerCaseText.includes('class')) {
        intent = 'course_inquiry';
        subcategory = 'courses';
      } else if (lowerCaseText.includes('library')) {
        intent = 'library_inquiry';
        subcategory = 'campus_resources';
      } else if (lowerCaseText.includes('clarkyou') || lowerCaseText.includes('portal') || lowerCaseText.includes('login')) {
        intent = 'credentials_inquiry';
        subcategory = 'credentials';
      } else if (lowerCaseText.includes('onecard') || lowerCaseText.includes('id card')) {
        intent = 'onecard_inquiry';
        subcategory = 'onecard';
      } else if (lowerCaseText.includes('appointment') || lowerCaseText.includes('schedule')) {
        intent = 'appointment_inquiry';
        subcategory = 'appointments';
      } else if (lowerCaseText.includes('transloc') || lowerCaseText.includes('mbta') || lowerCaseText.includes('wrta') || lowerCaseText.includes('bus')) {
        intent = 'transportation_inquiry';
        subcategory = 'commuter';
        category = 'other';
      } else if (lowerCaseText.includes('restaurant') || lowerCaseText.includes('eat') || lowerCaseText.includes('food') || 
                lowerCaseText.includes('shop') || lowerCaseText.includes('store')) {
        intent = 'places_inquiry';
        subcategory = 'places_near';
        category = 'other';
      }

      // Return the response and metadata
      return {
        text: responseText,
        intent,
        category: category as 'student' | 'faculty' | 'other',
        subcategory,
        confidence,
        sources: ['Claude AI']
      };
    } catch (error) {
      console.error('Error processing message with Claude:', error);
      throw error; // Let the main service handle fallback
    }
  }
}

export default new ClaudeService();
