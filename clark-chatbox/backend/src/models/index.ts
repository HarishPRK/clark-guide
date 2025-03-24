import Message from './Message';
import StudyRoom from './StudyRoom';
import RoomBooking from './RoomBooking';
import { CampusLocation, campusLocations } from './CampusLocation';
import { 
  OccupancyData, 
  FloorOccupancy, 
  ResourceAvailability,
  OccupancyRecommendation,
  TimeRecommendation
} from './CampusOccupancy';

// Set up associations
StudyRoom.hasMany(RoomBooking, { foreignKey: 'roomId', as: 'bookings' });
RoomBooking.belongsTo(StudyRoom, { foreignKey: 'roomId', as: 'room' });

export {
  Message,
  StudyRoom,
  RoomBooking,
  CampusLocation,
  campusLocations,
  OccupancyData,
  FloorOccupancy,
  ResourceAvailability,
  OccupancyRecommendation,
  TimeRecommendation
};
