import { StudyRoom } from '../models';
import sequelize from '../config/database';

/**
 * Initialize study rooms in the database
 */
async function initStudyRooms() {
  try {
    // Ensure the database is ready
    await sequelize.sync();
    
    // Check if rooms already exist
    const count = await StudyRoom.count();
    if (count > 0) {
      console.log(`Database already contains ${count} study rooms. Skipping initialization.`);
      return;
    }
    
    // Sample room data
    const rooms = [
      {
        roomNumber: '101',
        building: 'Library',
        floor: 1,
        capacity: 4,
        features: JSON.stringify(['whiteboard', 'power outlets']),
        isActive: true
      },
      {
        roomNumber: '102',
        building: 'Library',
        floor: 1,
        capacity: 8,
        features: JSON.stringify(['whiteboard', 'projector', 'power outlets']),
        isActive: true
      },
      {
        roomNumber: '201',
        building: 'Library',
        floor: 2,
        capacity: 2,
        features: JSON.stringify(['power outlets']),
        isActive: true
      },
      {
        roomNumber: '202',
        building: 'Library',
        floor: 2,
        capacity: 6,
        features: JSON.stringify(['whiteboard', 'power outlets', 'monitors']),
        isActive: true
      },
      {
        roomNumber: '301',
        building: 'Science Center',
        floor: 3,
        capacity: 4,
        features: JSON.stringify(['whiteboard', 'power outlets']),
        isActive: true
      },
      {
        roomNumber: '302',
        building: 'Science Center',
        floor: 3,
        capacity: 10,
        features: JSON.stringify(['whiteboard', 'projector', 'video conferencing']),
        isActive: true
      },
      {
        roomNumber: '401',
        building: 'University Center',
        floor: 4,
        capacity: 6,
        features: JSON.stringify(['whiteboard', 'power outlets', 'large tables']),
        isActive: true
      }
    ];
    
    // Insert sample rooms
    await StudyRoom.bulkCreate(rooms);
    
    console.log(`Successfully added ${rooms.length} study rooms to the database.`);
  } catch (error) {
    console.error('Error initializing study rooms:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initStudyRooms()
    .then(() => {
      console.log('Study room initialization complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during study room initialization:', err);
      process.exit(1);
    });
}

export default initStudyRooms;
