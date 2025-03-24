import { v4 as uuidv4 } from 'uuid';
import roomService, { StudyRoom, RoomBooking } from './roomService';

// In-memory bookings store - we'll use the same reference as in roomService
const inMemoryBookings: RoomBooking[] = [];

export interface BookingRequest {
  userId: string;
  userEmail?: string;
  roomId: number;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  purpose?: string;
  attendees?: number;
}

export class BookingService {
  /**
   * Create a new room booking
   */
  async createBooking(request: BookingRequest): Promise<RoomBooking | null> {
    // Validate booking request
    const room = await roomService.getRoomById(request.roomId);
    if (!room || !room.isActive) {
      throw new Error('Room not found or inactive');
    }
    
    // Check if the room is available
    const isAvailable = await roomService.isRoomAvailable(
      request.roomId,
      request.bookingDate,
      request.startTime,
      request.endTime
    );
    
    if (!isAvailable) {
      throw new Error('Room is not available for the requested time');
    }
    
    // Generate confirmation code
    const confirmationCode = this.generateConfirmationCode();
    
    // Create a new booking ID (max id + 1)
    const newId = inMemoryBookings.length > 0 
      ? Math.max(...inMemoryBookings.map(b => b.id)) + 1 
      : 1;
      
    // Format date to YYYY-MM-DD string for storage
    const formattedDate = request.bookingDate.toISOString().split('T')[0];
    
    // Create the booking object
    const booking: RoomBooking = {
      id: newId,
      roomId: request.roomId,
      userId: request.userId,
      userEmail: request.userEmail,
      bookingDate: formattedDate,
      startTime: request.startTime,
      endTime: request.endTime,
      purpose: request.purpose,
      attendees: request.attendees,
      confirmationCode: confirmationCode,
      status: 'confirmed'
    };
    
    // Add to our in-memory store
    inMemoryBookings.push(booking);
    
    return booking;
  }
  
  /**
   * Get booking by confirmation code
   */
  async getBookingByCode(confirmationCode: string): Promise<RoomBooking | null> {
    const booking = inMemoryBookings.find(b => 
      b.confirmationCode === confirmationCode
    );
    
    return booking || null;
  }
  
  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string): Promise<RoomBooking[]> {
    return inMemoryBookings
      .filter(b => b.userId === userId && b.status === 'confirmed')
      .sort((a, b) => {
        // Sort by date first
        if (a.bookingDate !== b.bookingDate) {
          return a.bookingDate.localeCompare(b.bookingDate);
        }
        // Then by start time
        return a.startTime.localeCompare(b.startTime);
      });
  }
  
  /**
   * Cancel a booking
   */
  async cancelBooking(confirmationCode: string, userId: string): Promise<boolean> {
    const bookingIndex = inMemoryBookings.findIndex(b => 
      b.confirmationCode === confirmationCode && b.userId === userId
    );
    
    if (bookingIndex === -1) {
      return false;
    }
    
    // Update the booking status
    inMemoryBookings[bookingIndex].status = 'cancelled';
    return true;
  }
  
  /**
   * Generate a unique confirmation code
   */
  private generateConfirmationCode(): string {
    // Generate a UUID and take the first 8 characters
    return `BK-${uuidv4().substring(0, 8).toUpperCase()}`;
  }
  
  /**
   * Format booking details for display
   */
  async formatBookingDetails(booking: RoomBooking): Promise<string> {
    const room = await roomService.getRoomById(booking.roomId);
    if (!room) {
      return 'Booking details not available';
    }
    
    const date = new Date(booking.bookingDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const startTime = roomService.formatTimeForDisplay(booking.startTime);
    const endTime = roomService.formatTimeForDisplay(booking.endTime);
    
    return `
Room: ${room.building} ${room.roomNumber} (Floor ${room.floor})
Date: ${formattedDate}
Time: ${startTime} - ${endTime}
Capacity: ${room.capacity} people
Features: ${room.getFeatures().join(', ')}
Confirmation Code: ${booking.confirmationCode}
    `.trim();
  }
}

export default new BookingService();
