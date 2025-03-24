// In-memory implementation to avoid database issues

// Define interfaces for our in-memory data
export interface StudyRoom {
  id: number;
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  features: string[];
  isActive: boolean;
  getFeatures: () => string[];
}

export interface RoomBooking {
  id: number;
  roomId: number;
  userId: string;
  userEmail?: string;
  bookingDate: string; // ISO date string YYYY-MM-DD
  startTime: string;   // 24-hour format: "14:00"
  endTime: string;
  purpose?: string;
  attendees?: number;
  confirmationCode: string;
  status: 'confirmed' | 'cancelled' | 'pending';
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// Mock data for rooms
const inMemoryRooms: StudyRoom[] = [
  {
    id: 1,
    roomNumber: '101',
    building: 'Library',
    floor: 1,
    capacity: 4,
    features: ['whiteboard', 'power outlets'],
    isActive: true,
    getFeatures: function() { return this.features; }
  },
  {
    id: 2,
    roomNumber: '102',
    building: 'Library',
    floor: 1,
    capacity: 8,
    features: ['whiteboard', 'projector', 'power outlets'],
    isActive: true,
    getFeatures: function() { return this.features; }
  },
  {
    id: 3,
    roomNumber: '201',
    building: 'Library',
    floor: 2,
    capacity: 2,
    features: ['power outlets'],
    isActive: true,
    getFeatures: function() { return this.features; }
  },
  {
    id: 4,
    roomNumber: '202',
    building: 'Library',
    floor: 2,
    capacity: 6,
    features: ['whiteboard', 'power outlets', 'monitors'],
    isActive: true,
    getFeatures: function() { return this.features; }
  },
  {
    id: 5,
    roomNumber: '301',
    building: 'Science Center',
    floor: 3,
    capacity: 4,
    features: ['whiteboard', 'power outlets'],
    isActive: true,
    getFeatures: function() { return this.features; }
  }
];

// In-memory bookings store
const inMemoryBookings: RoomBooking[] = [];

export class RoomService {
  /**
   * Get all active study rooms
   */
  async getAllRooms(): Promise<StudyRoom[]> {
    return Promise.resolve(
      inMemoryRooms
        .filter(room => room.isActive)
        .sort((a, b) => {
          if (a.building !== b.building) return a.building.localeCompare(b.building);
          if (a.floor !== b.floor) return a.floor - b.floor;
          return a.roomNumber.localeCompare(b.roomNumber);
        })
    );
  }
  
  /**
   * Get details for a specific room
   */
  async getRoomById(id: number): Promise<StudyRoom | null> {
    const room = inMemoryRooms.find(r => r.id === id);
    return Promise.resolve(room || null);
  }
  
  /**
   * Check if a room is available during the specified date and time
   */
  async isRoomAvailable(roomId: number, date: Date, startTime: string, endTime: string): Promise<boolean> {
    // Format date to YYYY-MM-DD for comparison
    const formattedDate = date.toISOString().split('T')[0];
    
    // Find conflicting bookings
    const conflictingBookings = inMemoryBookings.filter(booking => {
      if (booking.roomId !== roomId) return false;
      if (booking.bookingDate !== formattedDate) return false;
      if (booking.status !== 'confirmed') return false;
      
      // Check time conflicts
      // 1. New booking starts during an existing booking
      const startsInExisting = 
        booking.startTime <= startTime && 
        booking.endTime > startTime;
      
      // 2. New booking ends during an existing booking
      const endsInExisting = 
        booking.startTime < endTime && 
        booking.endTime >= endTime;
      
      // 3. New booking completely contains an existing booking
      const containsExisting = 
        booking.startTime >= startTime && 
        booking.endTime <= endTime;
      
      return startsInExisting || endsInExisting || containsExisting;
    });
    
    return conflictingBookings.length === 0;
  }
  
  /**
   * Find available rooms based on capacity and time
   */
  async findAvailableRooms(
    date: Date, 
    startTime: string, 
    endTime: string, 
    minCapacity: number = 1
  ): Promise<StudyRoom[]> {
    // Get all active rooms with sufficient capacity
    const eligibleRooms = inMemoryRooms.filter(room => 
      room.isActive && room.capacity >= minCapacity
    );
    
    // Filter to only available rooms at the requested time
    const availableRooms: StudyRoom[] = [];
    
    for (const room of eligibleRooms) {
      const isAvailable = await this.isRoomAvailable(room.id, date, startTime, endTime);
      if (isAvailable) {
        availableRooms.push(room);
      }
    }
    
    return availableRooms;
  }
  
  /**
   * Get available time slots for a room on a specific date
   */
  async getAvailableTimeSlots(roomId: number, date: Date): Promise<TimeSlot[]> {
    // For simplicity, we'll return predefined time slots (9am-9pm in 1-hour blocks)
    const allTimeSlots: TimeSlot[] = [];
    
    // Generate time slots from 9am to 9pm
    for (let hour = 9; hour < 21; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = (hour + 1).toString().padStart(2, '0');
      
      allTimeSlots.push({
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`
      });
    }
    
    // Check each slot for availability
    const availableSlots: TimeSlot[] = [];
    for (const slot of allTimeSlots) {
      const isAvailable = await this.isRoomAvailable(roomId, date, slot.startTime, slot.endTime);
      if (isAvailable) {
        availableSlots.push(slot);
      }
    }
    
    return availableSlots;
  }
  
  /**
   * Format a time string for display (24h to 12h format)
   */
  formatTimeForDisplay(time24h: string): string {
    const [hours, minutes] = time24h.split(':').map(num => parseInt(num, 10));
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

export default new RoomService();
