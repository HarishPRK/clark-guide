/**
 * Campus Location Service - Provides information about Clark University campus locations
 */

import { CampusLocation, campusLocations } from '../../models/CampusLocation';

class CampusService {
  private locations: CampusLocation[] = campusLocations;
  
  /**
   * Get a location by ID
   */
  getLocation(id: string): CampusLocation | undefined {
    return this.locations.find(loc => loc.id === id);
  }
  
  /**
   * Get all campus locations
   */
  getAllLocations(): CampusLocation[] {
    return [...this.locations];
  }
  
  /**
   * Get locations by type
   */
  getLocationsByType(type: string): CampusLocation[] {
    return this.locations.filter(loc => loc.type === type);
  }
  
  /**
   * Get locations by feature
   */
  getLocationsByFeature(feature: string): CampusLocation[] {
    return this.locations.filter(loc => 
      loc.features && loc.features.includes(feature)
    );
  }
  
  /**
   * Get locations by building
   */
  getLocationsByBuilding(building: string): CampusLocation[] {
    return this.locations.filter(loc => 
      loc.location && loc.location.building.toLowerCase().includes(building.toLowerCase())
    );
  }
  
  /**
   * Check if location is open at a specific time
   */
  isLocationOpenAt(locationId: string, time: Date = new Date()): boolean {
    const location = this.getLocation(locationId);
    if (!location) return false;
    
    const hours = location.openHours;
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    
    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();
    
    // Convert to minutes for easier comparison
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    const currentTime = currentHour * 60 + currentMinute;
    
    // Handle special case where close time is 24:00 or later
    if (closeHour >= 24 || (closeHour === 0 && closeMinute === 0)) {
      return currentTime >= openTime || currentTime < (closeHour % 24) * 60 + closeMinute;
    }
    
    return currentTime >= openTime && currentTime < closeTime;
  }
  
  /**
   * Get all open locations at the current time
   */
  getOpenLocations(time: Date = new Date()): CampusLocation[] {
    return this.locations.filter(loc => this.isLocationOpenAt(loc.id, time));
  }
}

export default new CampusService();
