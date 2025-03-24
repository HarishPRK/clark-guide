import { Message, AIResponse, UserQuery } from './aiService';
import roomBookingService from './roomBookingService';

/**
 * MockAIService - A fallback service that simulates AI responses
 * when the actual OpenAI service is unavailable or for demo purposes
 */
export class MockAIService {
  private responses: Map<string, string>;

  constructor() {
    // Predefined responses for common questions
    this.responses = new Map([
      // Student-related responses
      ['course', 'To register for courses at Clark, you need to log into your ClarkYou portal and navigate to "Student Center". From there, select "Enroll" and follow the instructions to search for and add courses to your cart. Make sure to check for any prerequisites before finalizing your registration.'],
      ['library', 'The Goddard Library is open Monday-Friday 8am-10pm, Saturday 10am-8pm, and Sunday 10am-10pm. It offers study spaces, research materials, computer labs, and assistance from librarians. You can access online resources through your Clark credentials even when off-campus.'],
      ['clarkyou', 'ClarkYou is Clark University\'s online portal where you can register for classes, view your academic record, pay bills, access email, and find campus resources. If you\'re having trouble with your credentials, contact the IT Help Desk at helpdesk@clarku.edu or (508) 793-7745.'],
      ['onecard', 'Your OneCard is Clark\'s official ID card that provides access to buildings, dining services, and campus facilities. You can add funds to your OneCard for purchases on and off campus. If you\'ve lost your card, visit the OneCard Office in the University Center to request a replacement (fee may apply).'],
      ['appointment', 'To schedule an appointment with academic advisors, career services, or other departments, use the online scheduling system through ClarkYou, or contact the specific office directly. Academic advising appointments can be made through the LEEP Center.'],
      
      // Faculty-related responses
      ['schedule', 'Faculty course schedules are managed through the Registrar\'s Office. You can view and request changes to your teaching schedule through ClarkYou. For assistance with scheduling conflicts or room changes, please contact the Registrar at registrar@clarku.edu.'],
      
      // Other services
      ['transloc', 'The TransLoc app provides real-time tracking for Clark\'s shuttle service. Download the app or visit clarku.transloc.com to see shuttle locations and estimated arrival times. The shuttle service runs on a regular schedule during the academic year with more limited service during breaks.'],
      ['mbta', 'The MBTA provides public transportation in the Worcester area. The nearest bus stops to Clark are on Main Street and Park Avenue. You can plan your trip using the MBTA website or Google Maps. Most buses run every 30 minutes on weekdays.'],
      ['wrta', 'The Worcester Regional Transit Authority (WRTA) has multiple bus routes that connect Clark University to downtown Worcester and surrounding areas. The fare is $1.75 per ride, or you can purchase a monthly pass. Clark students get discounted rates with a valid ID.'],
      ['restaurant', 'Near Clark University, you can find a variety of restaurants including:  • Acoustic Java (coffee shop)  • Shawarma Palace (Middle Eastern)  • Birch Tree Bread Company (cafe and bakery)  • Da Lat (Vietnamese)  • The Sole Proprietor (seafood)  • El Patron (Mexican)  • Baba Sushi (Japanese)'],
      ['shop', 'Shopping options near Clark include:  • Clark Convenience Store (on campus)  • Price Chopper (groceries)  • Gala Foods Supermarket (groceries)  • University Pizza (small convenience items)  • Target (approximately 2 miles away)  • Worcester Public Market (local vendors, food)'],
    ]);
  }

  /**
   * Processes a user message and generates a mock AI response
   */
  async processMessage(query: UserQuery): Promise<AIResponse> {
    const text = query.text.toLowerCase();
    const sessionId = query.sessionId || 'default';
    let responseText = '';
    let intent = 'general_inquiry';
    let confidence = 0.8;
    
    // Default category based on user type or fallback to student
    const category = query.userType || 'student';
    
    // Direct check for exact test phrase for debugging
    if (text === "i need to book a study room") {
      console.log("EXACT MATCH: 'I need to book a study room' detected");
      console.log("Calling roomBookingService.handleBookingRequest with:", JSON.stringify(query));
      try {
        // Directly start the room booking flow with explicit confirmation
        const response = await roomBookingService.handleBookingRequest(query);
        console.log("Room booking service response:", JSON.stringify(response));
        return response;
      } catch (error) {
        console.error("Error from room booking service:", error);
        return {
          text: "I encountered an error while trying to book a room. Please try again.",
          intent: 'booking_error',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.9,
          sources: ['Mock AI Service']
        };
      }
    }
    
    // General pattern match for room booking requests
    else if ((text.includes('book') || text.includes('reserve') || text.includes('need') || 
         text.includes('want') || text.includes('looking for')) && 
        (text.includes('study room') || text.includes('room') || text.includes('study space') || 
         text.includes('place to study'))) {
      console.log("PATTERN MATCH: Study room booking request detected");
      try {
        // Delegate to the room booking service
        return await roomBookingService.handleBookingRequest(query);
      } catch (error) {
        console.error("Error from room booking service (pattern match):", error);
        return {
          text: "I encountered an error with the booking system. Please try again.",
          intent: 'booking_error',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.9,
          sources: ['Mock AI Service']
        };
      }
    }
    
    // If this session has an active booking conversation, delegate to booking service
    if (roomBookingService.hasActiveBookingConversation(sessionId)) {
      return roomBookingService.handleBookingRequest(query);
    }
    
    // Check for greetings
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      responseText = `Hello! I'm Clark AI, your ${category} assistant. How can I help you today?`;
      intent = 'greeting';
    }
    // Check for thanks
    else if (text.includes('thank') || text.includes('thanks')) {
      responseText = `You're welcome! Let me know if you need anything else.`;
      intent = 'gratitude';
    }
    // Check for OneCard balance specifically
    else if ((text.includes('onecard') || text.includes('one card')) && 
             (text.includes('balance') || text.includes('amount'))) {
      // Add a 3-second delay before responding
      await new Promise(resolve => setTimeout(resolve, 3000));
      responseText = `Your OneCard balance is $157.28.`;
      intent = `${category}_onecard_balance`;
      confidence = 0.95;
    }
    // Check for course schedule specifically
    else if ((text.includes('course') || text.includes('class') || text.includes('schedule') || text.includes('timetable')) && 
             (text.includes('my') || text.includes('schedule') || text.includes('when'))) {
      // Add a 3-second delay before responding
      await new Promise(resolve => setTimeout(resolve, 3000));
      responseText = `Here is your course schedule, Harish:

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
   • Location: Lasry Center, Room 124`;
      intent = `${category}_course_schedule`;
      confidence = 0.95;
    }
    // Check predefined responses
    else {
      // Find matching keywords
      let found = false;
      for (const [keyword, response] of this.responses.entries()) {
        if (text.includes(keyword)) {
          responseText = response;
          intent = `${category}_${keyword}`;
          found = true;
          break;
        }
      }
      
      // Fallback response if no keywords match
      if (!found) {
        responseText = `I understand you're asking about something important. As a mockup AI for the Clark University Hackathon demo, I have limited responses. In a real implementation, I would connect to OpenAI to provide more accurate answers to questions like: "${query.text}"`;
        intent = 'fallback';
        confidence = 0.4;
      }
    }
    
    // Add a slight delay to simulate processing time (this is already happening naturally in a production environment)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      text: responseText,
      intent,
      confidence,
      category: category as 'student' | 'faculty' | 'other',
      subcategory: intent.includes('_') ? intent.split('_')[1] : undefined,
      sources: ['Mock AI Service']
    };
  }
}

export default new MockAIService();
