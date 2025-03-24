import { format, parse, isValid, addDays, isBefore, isAfter, startOfDay, addMinutes, isSameDay } from 'date-fns';
import { UserQuery, AIResponse } from './aiService';
import roomService, { StudyRoom } from '../room/roomService';
import bookingService from '../room/bookingService';

// State management for booking conversation flow
interface BookingState {
  stage: BookingStage;
  date?: Date;
  startTime?: string;
  endTime?: string;
  duration?: number;
  capacity?: number;
  selectedRoomId?: number;
  purpose?: string;
  preferredLocation?: string;  // New field for preferred building/location
  availableRooms?: StudyRoom[];
}

type BookingStage = 
  'initial' | 
  'awaiting_purpose' |      // Start by asking about the purpose
  'awaiting_attendees' |    // Then ask about attendees (renamed from capacity for clarity)
  'awaiting_location' |     // Then ask about preferred location
  'awaiting_date' | 
  'awaiting_time' | 
  'awaiting_duration' | 
  'awaiting_room_selection' | 
  'awaiting_confirmation' | 
  'completed' | 
  'cancelled';

export class RoomBookingService {
  // Isolated state for booking conversations
  private bookingStates: Map<string, BookingState> = new Map();
  
  /**
   * Main entry point for handling booking requests
   */
  async handleBookingRequest(query: UserQuery): Promise<AIResponse> {
    try {
      const sessionId = query.sessionId || 'default';
      const text = query.text.toLowerCase();
      
      // Handle cancellation intent at any point
      if (text.includes('cancel') || text.includes('stop') || text.includes('nevermind')) {
        return this.cancelBookingFlow(sessionId);
      }
      
      // Get or initialize booking state
      let state = this.bookingStates.get(sessionId);
      if (!state) {
        state = { stage: 'initial' };
        this.bookingStates.set(sessionId, state);
      }
      
      // Process based on current stage
      switch (state.stage) {
        case 'initial':
          return this.startBookingFlow(sessionId);
          
        case 'awaiting_purpose':
          return await this.processPurposeInput(query, sessionId);
          
        case 'awaiting_attendees':
          return await this.processAttendeesInput(query, sessionId);
          
        case 'awaiting_location':
          return await this.processLocationInput(query, sessionId);
          
        case 'awaiting_date':
          return await this.processDateInput(query, sessionId);
          
        case 'awaiting_time':
          return await this.processTimeInput(query, sessionId);
          
        case 'awaiting_duration':
          return await this.processDurationInput(query, sessionId);
          
        case 'awaiting_room_selection':
          return await this.processRoomSelection(query, sessionId);
          
        case 'awaiting_confirmation':
          return await this.processConfirmation(query, sessionId);
          
        default:
          // If somehow in an unknown state, restart
          return this.startBookingFlow(sessionId);
      }
    } catch (error) {
      console.error('Error in room booking flow:', error);
      
      // Provide graceful error response
      return {
        text: "I'm sorry, I encountered an issue with the room booking system. Let's start over. When would you like to book a study room?",
        intent: 'booking_error',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
  }
  
  /**
   * Check if a booking conversation is active for this session
   */
  public hasActiveBookingConversation(sessionId: string): boolean {
    const state = this.bookingStates.get(sessionId);
    return !!state && state.stage !== 'completed' && state.stage !== 'cancelled';
  }
  
  /**
   * Start the booking flow
   */
  private startBookingFlow(sessionId: string): AIResponse {
    // Set state to awaiting purpose first
    this.bookingStates.set(sessionId, {
      stage: 'awaiting_purpose'
    });
    
    return {
      text: "I'd be happy to help you book a study room. What is the purpose of your booking? (e.g., group project, individual study, meeting)",
      intent: 'room_booking_purpose',
      category: 'student',
      subcategory: 'study_rooms',
      confidence: 0.98,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process purpose input
   */
  private async processPurposeInput(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text;
    
    // Update state with purpose
    const state = this.bookingStates.get(sessionId)!;
    state.purpose = text;
    state.stage = 'awaiting_attendees';
    this.bookingStates.set(sessionId, state);
    
    return {
      text: `Great! Your booking is for "${text}". How many people will be using the room?`,
      intent: 'room_booking_attendees',
      category: query.userType as 'student' | 'faculty' | 'other',
      subcategory: 'study_rooms',
      confidence: 0.95,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process attendees input
   */
  private async processAttendeesInput(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text.toLowerCase();
    
    // Try to extract a number from the text
    const capacityMatch = text.match(/(\d+)/);
    
    if (!capacityMatch) {
      return {
        text: "I need to know how many people will be using the room. Please provide a number, like '3' or '4 people'.",
        intent: 'room_booking_attendees_clarification',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    const capacity = parseInt(capacityMatch[1]);
    
    // Validate capacity
    if (capacity < 1 || capacity > 20) {
      return {
        text: "Please specify a reasonable number of people (1-20).",
        intent: 'room_booking_attendees_validation',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Update state
    const state = this.bookingStates.get(sessionId)!;
    state.capacity = capacity;
    state.stage = 'awaiting_location';
    this.bookingStates.set(sessionId, state);
    
    return {
      text: `Got it, ${capacity} people will be attending. Do you have a preferred location on campus? (e.g., Library, University Center, Science Center)`,
      intent: 'room_booking_location',
      category: query.userType as 'student' | 'faculty' | 'other',
      subcategory: 'study_rooms',
      confidence: 0.95,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process location input
   */
  private async processLocationInput(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text;
    
    // Update state with preferred location
    const state = this.bookingStates.get(sessionId)!;
    state.preferredLocation = text;
    state.stage = 'awaiting_date';
    this.bookingStates.set(sessionId, state);
    
    return {
      text: `Perfect! I'll note your location preference for "${text}". What date would you like to book? (e.g., tomorrow, next Friday, March 30)`,
      intent: 'room_booking_date',
      category: query.userType as 'student' | 'faculty' | 'other',
      subcategory: 'study_rooms',
      confidence: 0.95,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process date input
   */
  private async processDateInput(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text;
    const dateInfo = this.extractDate(text);
    
    if (!dateInfo) {
      return {
        text: "I'm having trouble understanding that date. Please provide a date like 'tomorrow', 'next Friday', or 'March 30'.",
        intent: 'room_booking_date_clarification',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Validate the date (must be today or in the future)
    if (!this.validateDate(dateInfo)) {
      return {
        text: "I can only book rooms for today or future dates. Please provide a valid date.",
        intent: 'room_booking_date_validation',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Update state with date
    const state = this.bookingStates.get(sessionId)!;
    state.date = dateInfo;
    state.stage = 'awaiting_time';
    this.bookingStates.set(sessionId, state);
    
    // Format date for display
    const formattedDate = format(dateInfo, 'EEEE, MMMM d, yyyy');
    
    return {
      text: `Great! You want to book a room on ${formattedDate}. What time would you like to start? (e.g., 2pm, 14:00)`,
      intent: 'room_booking_time',
      category: query.userType as 'student' | 'faculty' | 'other',
      subcategory: 'study_rooms',
      confidence: 0.95,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process time input
   */
  private async processTimeInput(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text;
    const timeInfo = this.extractTime(text);
    
    if (!timeInfo) {
      return {
        text: "I'm having trouble understanding that time. Please provide a time like '2pm' or '14:00'.",
        intent: 'room_booking_time_clarification',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    const state = this.bookingStates.get(sessionId)!;
    
    // Validate the time (if booking is for today, time must be in the future)
    if (state.date && !this.validateTime(state.date, timeInfo.startTime)) {
      return {
        text: "For same-day bookings, the start time must be at least 15 minutes from now. Please choose a later time.",
        intent: 'room_booking_time_validation',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Update state with the start time
    state.startTime = timeInfo.startTime;
    
    // If end time was also provided
    if (timeInfo.endTime) {
      state.endTime = timeInfo.endTime;
      state.stage = 'awaiting_room_selection';
      
      const formattedStart = roomService.formatTimeForDisplay(timeInfo.startTime);
      const formattedEnd = roomService.formatTimeForDisplay(timeInfo.endTime);
      
      this.bookingStates.set(sessionId, state);
      
      return {
        text: `I've got you scheduled from ${formattedStart} to ${formattedEnd}. Let me find available rooms for you...`,
        intent: 'room_booking_finding_rooms',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.95,
        sources: ['Room Booking Service']
      };
    }
    
    // If only start time was provided, ask for duration
    state.stage = 'awaiting_duration';
    this.bookingStates.set(sessionId, state);
    
    // Format time for display
    const formattedTime = roomService.formatTimeForDisplay(timeInfo.startTime);
    
    return {
      text: `Got it, starting at ${formattedTime}. How long do you need the room for? (e.g., 2 hours, 90 minutes)`,
      intent: 'room_booking_duration',
      category: query.userType as 'student' | 'faculty' | 'other',
      subcategory: 'study_rooms',
      confidence: 0.95,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process duration input
   */
  private async processDurationInput(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text.toLowerCase();
    const durationHours = this.extractDuration(text);
    
    if (!durationHours) {
      return {
        text: "I'm having trouble understanding that duration. Please specify how long you need the room, like '2 hours' or '90 minutes'.",
        intent: 'room_booking_duration_clarification',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Validate duration (between 30 minutes and 4 hours)
    if (durationHours < 0.5 || durationHours > 4) {
      return {
        text: "Room bookings must be between 30 minutes and 4 hours. Please specify a valid duration.",
        intent: 'room_booking_duration_validation',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Update state
    const state = this.bookingStates.get(sessionId)!;
    state.duration = durationHours;
    
    // Calculate end time based on start time and duration
    if (state.startTime) {
      const [startHours, startMinutes] = state.startTime.split(':').map(Number);
      
      // Calculate total minutes
      const durationMinutes = Math.floor(durationHours * 60);
      const totalMinutes = startHours * 60 + startMinutes + durationMinutes;
      
      // Convert back to hours:minutes
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      
      state.endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }
    
    // We already have capacity from earlier in the conversation flow
    state.stage = 'awaiting_room_selection';
    this.bookingStates.set(sessionId, state);
    
    // Format times for display
    const formattedStart = roomService.formatTimeForDisplay(state.startTime!);
    const formattedEnd = roomService.formatTimeForDisplay(state.endTime!);
    
    return {
      text: `Great! I have you scheduled from ${formattedStart} to ${formattedEnd}. Let me find available rooms for you...`,
      intent: 'room_booking_finding_rooms',
      category: query.userType as 'student' | 'faculty' | 'other',
      subcategory: 'study_rooms',
      confidence: 0.95,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process capacity input
   */
  private async processCapacityInput(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text.toLowerCase();
    
    // Try to extract a number from the text
    const capacityMatch = text.match(/(\d+)/);
    
    if (!capacityMatch) {
      return {
        text: "I need to know how many people will be using the room. Please provide a number, like '3' or '4 people'.",
        intent: 'room_booking_capacity_clarification',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    const capacity = parseInt(capacityMatch[1]);
    
    // Validate capacity
    if (capacity < 1 || capacity > 20) {
      return {
        text: "Please specify a reasonable number of people (1-20).",
        intent: 'room_booking_capacity_validation',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Update state
    const state = this.bookingStates.get(sessionId)!;
    state.capacity = capacity;
    
    // Find available rooms for the specified criteria
    if (state.date && state.startTime && state.endTime && state.capacity) {
      try {
        const availableRooms = await roomService.findAvailableRooms(
          state.date,
          state.startTime,
          state.endTime,
          state.capacity
        );
        
        // If no rooms available, inform the user
        if (availableRooms.length === 0) {
          return {
            text: `I'm sorry, there are no rooms available that can accommodate ${state.capacity} people on the date and time you requested. Would you like to try a different date or time?`,
            intent: 'room_booking_no_availability',
            category: query.userType as 'student' | 'faculty' | 'other',
            subcategory: 'study_rooms',
            confidence: 0.95,
            sources: ['Room Booking Service']
          };
        }
        
        // Store available rooms in state
        state.availableRooms = availableRooms;
        state.stage = 'awaiting_room_selection';
        this.bookingStates.set(sessionId, state);
        
        // Format date and time for display
        const formattedDate = format(state.date, 'EEEE, MMMM d, yyyy');
        const formattedStart = roomService.formatTimeForDisplay(state.startTime);
        const formattedEnd = roomService.formatTimeForDisplay(state.endTime);
        
        // Present room options to the user
        let responseText = `I found ${availableRooms.length} rooms available on ${formattedDate} from ${formattedStart} to ${formattedEnd}:\n\n`;
        
        availableRooms.forEach((room, index) => {
          const features = room.getFeatures().join(', ');
          responseText += `${index + 1}. ${room.building} Room ${room.roomNumber} (Floor ${room.floor}) - Capacity: ${room.capacity}, Features: ${features}\n`;
        });
        
        responseText += '\nWhich room would you like to book? (Please respond with the room number or the option number)';
        
        return {
          text: responseText,
          intent: 'room_booking_options',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.95,
          sources: ['Room Booking Service']
        };
      } catch (error) {
        console.error('Error finding available rooms:', error);
        return {
          text: "I'm sorry, I encountered an error while searching for available rooms. Please try again later.",
          intent: 'room_booking_error',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.9,
          sources: ['Room Booking Service']
        };
      }
    } else {
      // This shouldn't happen if the flow is working correctly
      return this.startBookingFlow(sessionId);
    }
  }
  
  /**
   * Process room selection
   */
  private async processRoomSelection(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const state = this.bookingStates.get(sessionId)!;
    
    // If we don't have available rooms yet, find them first
    if (!state.availableRooms || state.availableRooms.length === 0) {
      // Check if we have all the data needed to search for rooms
      if (!state.date || !state.startTime || !state.endTime || !state.capacity) {
        return {
          text: "I'm missing some information needed to find available rooms. Let's start over.",
          intent: 'room_booking_error',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.9,
          sources: ['Room Booking Service']
        };
      }
      
      try {
        // Find available rooms based on provided criteria
        const availableRooms = await roomService.findAvailableRooms(
          state.date,
          state.startTime,
          state.endTime,
          state.capacity
        );
        
        // If no rooms available, inform the user
        if (availableRooms.length === 0) {
          return {
            text: `I'm sorry, there are no rooms available that can accommodate ${state.capacity} people on the date and time you requested. Would you like to try a different date or time?`,
            intent: 'room_booking_no_availability',
            category: query.userType as 'student' | 'faculty' | 'other',
            subcategory: 'study_rooms',
            confidence: 0.95,
            sources: ['Room Booking Service']
          };
        }
        
        // Store available rooms in state
        state.availableRooms = availableRooms;
        this.bookingStates.set(sessionId, state);
        
        // Format date and time for display
        const formattedDate = format(state.date, 'EEEE, MMMM d, yyyy');
        const formattedStart = roomService.formatTimeForDisplay(state.startTime);
        const formattedEnd = roomService.formatTimeForDisplay(state.endTime);
        
        // Present room options to the user
        let responseText = `I found ${availableRooms.length} rooms available on ${formattedDate} from ${formattedStart} to ${formattedEnd}:\n\n`;
        
        availableRooms.forEach((room, index) => {
          const features = room.getFeatures().join(', ');
          responseText += `${index + 1}. ${room.building} Room ${room.roomNumber} (Floor ${room.floor}) - Capacity: ${room.capacity}, Features: ${features}\n`;
        });
        
        responseText += '\nWhich room would you like to book? (Please respond with the room number or the option number)';
        
        return {
          text: responseText,
          intent: 'room_booking_options',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.95,
          sources: ['Room Booking Service']
        };
      } catch (error) {
        console.error('Error finding available rooms:', error);
        return {
          text: "I'm sorry, I encountered an error while searching for available rooms. Please try again later.",
          intent: 'room_booking_error',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.9,
          sources: ['Room Booking Service']
        };
      }
    }
    
    // If we have available rooms and user has entered a room selection
    const text = query.text.toLowerCase();
    
    let selectedRoom: StudyRoom | undefined;
    
    // Check if user selected by option number
    const optionMatch = text.match(/^(?:option\s*)?(\d+)$/i);
    if (optionMatch) {
      const optionNum = parseInt(optionMatch[1]) - 1; // Convert to 0-based index
      
      if (optionNum >= 0 && optionNum < state.availableRooms.length) {
        selectedRoom = state.availableRooms[optionNum];
      }
    }
    
    // If no match by option number, try by room number
    if (!selectedRoom) {
      const roomNumMatch = text.match(/(?:room\s*)?(\d+)/i);
      if (roomNumMatch) {
        const roomNumber = roomNumMatch[1];
        selectedRoom = state.availableRooms.find(r => r.roomNumber === roomNumber);
      }
    }
    
    // If neither matched, try by sequential keywords in the text
    if (!selectedRoom) {
      for (const room of state.availableRooms) {
        const buildingAndRoom = `${room.building.toLowerCase()} room ${room.roomNumber}`;
        if (text.includes(buildingAndRoom) || text.includes(room.building.toLowerCase())) {
          selectedRoom = room;
          break;
        }
      }
    }
    
    if (!selectedRoom) {
      // If still no match, ask for clarification
      return {
        text: "I couldn't identify which room you'd like to book. Please select one of the options by number (e.g., '1' for the first option) or specify the room number (e.g., 'Room 101').",
        intent: 'room_booking_selection_clarification',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    // Update state with selected room
    state.selectedRoomId = selectedRoom.id;
    state.stage = 'awaiting_confirmation';
    this.bookingStates.set(sessionId, state);
    
    // Format booking details for confirmation
    const formattedDate = format(state.date!, 'EEEE, MMMM d, yyyy');
    const formattedStart = roomService.formatTimeForDisplay(state.startTime!);
    const formattedEnd = roomService.formatTimeForDisplay(state.endTime!);
    const features = selectedRoom.getFeatures().join(', ');
    
    const bookingDetails = `
Room: ${selectedRoom.building} Room ${selectedRoom.roomNumber} (Floor ${selectedRoom.floor})
Date: ${formattedDate}
Time: ${formattedStart} to ${formattedEnd}
Capacity: ${selectedRoom.capacity} people
Features: ${features}
    `.trim();
    
    return {
      text: `Great choice! Here are your booking details:\n\n${bookingDetails}\n\nWould you like to confirm this booking? (yes/no)`,
      intent: 'room_booking_confirmation',
      category: query.userType as 'student' | 'faculty' | 'other',
      subcategory: 'study_rooms',
      confidence: 0.95,
      sources: ['Room Booking Service']
    };
  }
  
  /**
   * Process booking confirmation
   */
  private async processConfirmation(query: UserQuery, sessionId: string): Promise<AIResponse> {
    const text = query.text.toLowerCase();
    
    // Check for affirmative response
    const isConfirming = text.includes('yes') || text.includes('confirm') || 
                         text.includes('book it') || text.includes('looks good');
                         
    if (!isConfirming) {
      // If user doesn't confirm, cancel the booking flow
      return this.cancelBookingFlow(sessionId);
    }
    
    const state = this.bookingStates.get(sessionId)!;
    
    // Ensure we have all required data
    if (!state.date || !state.startTime || !state.endTime || !state.selectedRoomId) {
      return {
        text: "I'm sorry, some of the booking information is missing. Let's start over. When would you like to book a study room?",
        intent: 'room_booking_error',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
    
    try {
      // Create the booking
      const booking = await bookingService.createBooking({
        userId: query.userId || sessionId,
        userEmail: query.userEmail,
        roomId: state.selectedRoomId,
        bookingDate: state.date,
        startTime: state.startTime,
        endTime: state.endTime,
        attendees: state.capacity,
        purpose: state.purpose
      });
      
      if (!booking) {
        throw new Error('Failed to create booking');
      }
      
      // Get room details
      const room = await roomService.getRoomById(state.selectedRoomId);
      
      if (!room) {
        throw new Error('Room not found');
      }
      
      // Format booking details for response
      const bookingDetails = await bookingService.formatBookingDetails(booking);
      
      // Mark booking as completed
      state.stage = 'completed';
      this.bookingStates.set(sessionId, state);
      
      // Return success response
      return {
        text: `Your room has been successfully booked!\n\n${bookingDetails}\n\nYour booking is confirmed. You'll receive a confirmation at your email if you've provided one.`,
        intent: 'room_booking_success',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.98,
        sources: ['Room Booking Service']
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // If error is related to room availability
      if (error instanceof Error && error.message.includes('not available')) {
        return {
          text: "I'm sorry, it looks like this room was just booked by someone else while we were talking. Would you like to see other available rooms?",
          intent: 'room_booking_availability_error',
          category: query.userType as 'student' | 'faculty' | 'other',
          subcategory: 'study_rooms',
          confidence: 0.9,
          sources: ['Room Booking Service']
        };
      }
      
      // General error response
      return {
        text: "I'm sorry, there was an error while creating your booking. Please try again later.",
        intent: 'room_booking_error',
        category: query.userType as 'student' | 'faculty' | 'other',
        subcategory: 'study_rooms',
        confidence: 0.9,
        sources: ['Room Booking Service']
      };
    }
  }
  
  /**
   * Cancel the booking flow
   */
  private cancelBookingFlow(sessionId: string): AIResponse {
    // Clean up state
    this.bookingStates.delete(sessionId);
    
    return {
      text: "I've cancelled the room booking process. Is there something else I can help you with?",
      intent: 'room_booking_cancelled',
      category: 'student',
      subcategory: 'study_rooms',
      confidence: 0.98,
      sources: ['Room Booking Service']
    };
  }
  
  /* === Helper methods for parsing user input === */
  
  /**
   * Extract date from natural language input
   */
  private extractDate(text: string): Date | null {
    const today = new Date();
    const lowerText = text.toLowerCase();
    
    // Handle common relative dates
    if (lowerText.includes('today')) {
      return today;
    }
    
    if (lowerText.includes('tomorrow')) {
      return addDays(today, 1);
    }
    
    // Handle "next" + day name (e.g., "next Friday")
    const nextDayMatch = lowerText.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i);
    if (nextDayMatch) {
      const dayName = nextDayMatch[1].toLowerCase();
      const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName);
      
      let daysToAdd = dayIndex - today.getDay();
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
      }
      daysToAdd += 7; // "Next" implies the week after next
      
      return addDays(today, daysToAdd);
    }
    
    // Handle day name alone (e.g., "Friday")
    const dayMatch = lowerText.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i);
    if (dayMatch) {
      const dayName = dayMatch[1].toLowerCase();
      const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName);
      
      let daysToAdd = dayIndex - today.getDay();
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
      }
      
      return addDays(today, daysToAdd);
    }
    
    // Handle month/day formats: MM/DD, MM-DD, etc.
    const dateMatch = text.match(/(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?/);
    if (dateMatch) {
      let [_, month, day, year] = dateMatch;
      if (!year) {
        year = today.getFullYear().toString();
      } else if (year.length === 2) {
        year = `20${year}`;
      }
      
      const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
    
    // Handle month name + day: "March 15", "Mar 15th"
    const monthNameMatch = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
    if (monthNameMatch) {
      const monthName = monthNameMatch[1].toLowerCase();
      const day = parseInt(monthNameMatch[2]);
      
      const monthIndex = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun', 
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
      ].findIndex(m => monthName.startsWith(m));
      
      if (monthIndex !== -1 && day >= 1 && day <= 31) {
        const year = today.getFullYear();
        const parsedDate = new Date(year, monthIndex, day);
        
        // If the date is in the past, assume next year
        if (parsedDate < today) {
          parsedDate.setFullYear(year + 1);
        }
        
        return parsedDate;
      }
    }
    
    // If no date formats matched
    return null;
  }
  
  /**
   * Extract time from natural language input
   */
  /**
   * Validate the date (must be today or in the future)
   */
  private validateDate(date: Date): boolean {
    const today = startOfDay(new Date());
    const maxFutureDate = addDays(today, 30); // Limit bookings to 30 days in advance
    
    // Check if date is today or in the future (but not too far)
    return date >= today && date <= maxFutureDate;
  }

  /**
   * Validate the time (for same-day bookings)
   */
  private validateTime(date: Date, timeString: string): boolean {
    // If booking is for today, make sure the time hasn't passed
    const isToday = isSameDay(date, new Date());
    
    if (isToday) {
      const now = new Date();
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Create a date object for the requested time
      const requestedTime = new Date();
      requestedTime.setHours(hours, minutes, 0, 0);
      
      // Allow bookings at least 15 minutes in the future
      const minimumTime = addMinutes(now, 15);
      
      return requestedTime >= minimumTime;
    }
    
    return true; // No time restriction for future dates
  }

  /**
   * Extract duration from text
   */
  private extractDuration(text: string): number | null {
    const lowerText = text.toLowerCase();
    
    // Handle hours format (e.g., "2 hours", "2hr")
    const hoursMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)s?/);
    if (hoursMatch) {
      return parseFloat(hoursMatch[1]);
    }
    
    // Handle minutes format (e.g., "30 minutes", "30min")
    const minutesMatch = lowerText.match(/(\d+)\s*(?:minute|min|m)s?/);
    if (minutesMatch) {
      return parseFloat(minutesMatch[1]) / 60; // Convert to hours
    }
    
    // Handle combined format (e.g., "1 hour and 30 minutes")
    const combinedMatch = lowerText.match(/(\d+)\s*(?:hour|hr|h)s?(?:\s*and)?\s*(\d+)\s*(?:minute|min|m)s?/);
    if (combinedMatch) {
      const hours = parseInt(combinedMatch[1]);
      const minutes = parseInt(combinedMatch[2]);
      return hours + (minutes / 60);
    }
    
    // Try to extract a simple number (assume hours)
    const simpleNumberMatch = lowerText.match(/^(\d+(?:\.\d+)?)$/);
    if (simpleNumberMatch) {
      return parseFloat(simpleNumberMatch[1]);
    }
    
    return null;
  }

  /**
   * Extract time from natural language input
   */
  private extractTime(text: string): { startTime: string; endTime?: string } | null {
    const lowerText = text.toLowerCase();
    
    // Handle time ranges (e.g., "from 2pm to 4pm")
    const timeRangeMatch = lowerText.match(/from\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+to\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeRangeMatch) {
      let [_, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod] = timeRangeMatch;
      startMinute = startMinute || '00';
      endMinute = endMinute || '00';
      
      // Convert to 24-hour format
      let startHourNum = parseInt(startHour);
      let endHourNum = parseInt(endHour);
      
      // Handle AM/PM conversion
      if (startPeriod && startPeriod.toLowerCase() === 'pm' && startHourNum < 12) {
        startHourNum += 12;
      } else if (startPeriod && startPeriod.toLowerCase() === 'am' && startHourNum === 12) {
        startHourNum = 0;
      }
      
      if (endPeriod.toLowerCase() === 'pm' && endHourNum < 12) {
        endHourNum += 12;
      } else if (endPeriod.toLowerCase() === 'am' && endHourNum === 12) {
        endHourNum = 0;
      }
      
      // If no start period but end period exists, infer the start period
      if (!startPeriod && endPeriod) {
        if (startHourNum > endHourNum && endPeriod.toLowerCase() === 'pm') {
          // Assume start is also PM if it makes sense time-wise
          startHourNum += 12;
        }
      }
      
      const startTime = `${startHourNum.toString().padStart(2, '0')}:${startMinute}`;
      const endTime = `${endHourNum.toString().padStart(2, '0')}:${endMinute}`;
      
      return { startTime, endTime };
    }
    
    // 1. Handle 12-hour format (e.g., "3pm", "3:30 pm")
    const twelveHourMatch = lowerText.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (twelveHourMatch) {
      let [_, hours, minutes, period] = twelveHourMatch;
      minutes = minutes || '00';
      
      // Convert to 24-hour format
      let hour = parseInt(hours);
      if (period.toLowerCase() === 'pm' && hour < 12) {
        hour += 12;
      } else if (period.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      
      const startTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
      return { startTime };
    }
    
    // 2. Handle 24-hour format (e.g., "15:00", "15")
    const twentyFourHourMatch = lowerText.match(/(\d{1,2})(?::(\d{2}))?(?:\s*hours?)?/);
    if (twentyFourHourMatch) {
      const [_, hours, minutes] = twentyFourHourMatch;
      const hour = parseInt(hours);
      
      // Validate hours
      if (hour >= 0 && hour <= 23) {
        const startTime = `${hour.toString().padStart(2, '0')}:${(minutes || '00')}`;
        return { startTime };
      }
    }
    
    // If no time formats matched
    return null;
  }
}

export default new RoomBookingService();
