/**
 * CampusLocation - Model representing a physical location on the Clark University campus
 */
export interface CampusLocation {
  id: string;
  name: string;
  type: 'library' | 'cafe' | 'lab' | 'study_area' | 'printer' | 'dining';
  capacity: number;
  floors?: string[];
  openHours: {
    open: string; // "08:00"
    close: string; // "22:00"
  };
  features?: string[]; // ['wifi', 'outlets', 'quiet']
  location?: {
    building: string;
    floor: string;
  };
}

// Pre-populated Clark University locations
export const campusLocations: CampusLocation[] = [
  {
    id: 'goddard-library',
    name: 'Goddard Library',
    type: 'library',
    capacity: 500,
    floors: ['Main Floor', 'Upper Level', 'Basement'],
    openHours: { open: '08:00', close: '24:00' },
    features: ['wifi', 'outlets', 'quiet_zones', 'group_study'],
    location: {
      building: 'Goddard Library',
      floor: 'All Floors'
    }
  },
  {
    id: 'goddard-library-basement',
    name: 'Goddard Library Basement',
    type: 'study_area',
    capacity: 120,
    openHours: { open: '08:00', close: '24:00' },
    features: ['wifi', 'outlets', 'quiet_zones', 'private_carrels'],
    location: {
      building: 'Goddard Library',
      floor: 'Basement'
    }
  },
  {
    id: 'academic-commons',
    name: 'Academic Commons',
    type: 'study_area',
    capacity: 200,
    openHours: { open: '08:00', close: '22:00' },
    features: ['wifi', 'outlets', 'group_study'],
    location: {
      building: 'Academic Commons',
      floor: 'Main Floor'
    }
  },
  {
    id: 'academic-commons-cafe',
    name: 'Academic Commons Café',
    type: 'cafe',
    capacity: 75,
    openHours: { open: '07:30', close: '19:00' },
    features: ['wifi', 'food', 'coffee'],
    location: {
      building: 'Academic Commons',
      floor: 'Main Floor'
    }
  },
  {
    id: 'kneller-athletic-center',
    name: 'Kneller Athletic Center',
    type: 'study_area',
    capacity: 60,
    openHours: { open: '08:00', close: '21:00' },
    features: ['wifi', 'quiet_zones'],
    location: {
      building: 'Kneller Athletic Center',
      floor: 'Main Floor'
    }
  },
  {
    id: 'computer-lab-main',
    name: 'Main Computer Lab',
    type: 'lab',
    capacity: 50,
    openHours: { open: '08:00', close: '22:00' },
    features: ['computers', 'printers', 'scanners', 'specialized_software'],
    location: {
      building: 'Science Building',
      floor: '2nd Floor'
    }
  },
  {
    id: 'computer-lab-basement',
    name: 'Basement Computer Lab',
    type: 'lab',
    capacity: 30,
    openHours: { open: '08:00', close: '20:00' },
    features: ['computers', 'printers', 'quiet'],
    location: {
      building: 'Science Building',
      floor: 'Basement'
    }
  },
  {
    id: 'university-center-dining',
    name: 'University Center Dining Hall',
    type: 'dining',
    capacity: 300,
    openHours: { open: '07:00', close: '21:00' },
    features: ['food', 'wifi'],
    location: {
      building: 'University Center',
      floor: 'Main Floor'
    }
  },
  {
    id: 'science-building-cafe',
    name: 'Science Building Café',
    type: 'cafe',
    capacity: 40,
    openHours: { open: '08:00', close: '17:00' },
    features: ['coffee', 'snacks', 'wifi'],
    location: {
      building: 'Science Building',
      floor: '1st Floor'
    }
  },
  {
    id: 'printing-center',
    name: 'Printing Center',
    type: 'printer',
    capacity: 25,
    openHours: { open: '08:00', close: '20:00' },
    features: ['printers', 'copiers', 'scanners'],
    location: {
      building: 'University Center',
      floor: '2nd Floor'
    }
  }
];
