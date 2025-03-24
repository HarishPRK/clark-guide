/**
 * Campus Occupancy Service - Simulates real-time occupancy data for campus locations
 */

import { 
  OccupancyData, 
  FloorOccupancy, 
  ResourceAvailability,
  OccupancyRecommendation,
  TimeRecommendation
} from '../../models/CampusOccupancy';
import campusService from './campusService';

class OccupancyService {
  private data: Map<string, OccupancyData> = new Map();
  private lastUpdateTime: number = Date.now();
  
  // Simulated hourly occupancy patterns for each day of week (0-6, 0=Sunday)
  // Values are occupancy percentages (0.0-1.0)
  private patterns: Map<string, number[][]> = new Map();
  
  constructor() {
    // Initialize with simulated data
    this.initializeSimulatedData();
    this.initializePatterns();
    
    // Update simulated data every minute to create realistic changes
    setInterval(() => this.updateSimulatedData(), 60000);
    
    console.log('Campus Occupancy Service initialized with simulated data.');
  }
  
  /**
   * Initialize simulated occupancy data for all campus locations
   */
  private initializeSimulatedData(): void {
    const locations = campusService.getAllLocations();
    const now = new Date();
    
    locations.forEach(location => {
      // Get base occupancy by time of day and location type
      const baseOccupancy = this.getBaseOccupancyForTimeOfDay(location.id, now);
      
      // Add randomness to make it feel real (±10%)
      const randomFactor = 1 + (Math.random() * 0.2 - 0.1);
      let currentCount = Math.floor(location.capacity * baseOccupancy * randomFactor);
      
      // Ensure count is within valid bounds
      currentCount = Math.min(location.capacity, Math.max(0, currentCount));
      
      const occupancyData: OccupancyData = {
        locationId: location.id,
        currentCount,
        capacity: location.capacity,
        timestamp: new Date(),
        floorData: this.generateFloorData(location.id, currentCount),
        resourcesAvailable: this.generateResourceData(location.id)
      };
      
      this.data.set(location.id, occupancyData);
    });
  }
  
  /**
   * Initialize occupancy patterns for time-based recommendations
   */
  private initializePatterns(): void {
    const locations = campusService.getAllLocations();
    
    locations.forEach(location => {
      // Create a 7x24 array (days x hours) of occupancy patterns
      const weekPattern: number[][] = [];
      
      for (let day = 0; day < 7; day++) {
        const dayPattern: number[] = [];
        
        for (let hour = 0; hour < 24; hour++) {
          let baseOccupancy = 0;
          
          // Library patterns
          if (location.type === 'library' || location.type === 'study_area') {
            if (hour < 7) baseOccupancy = 0; // Closed or very empty
            else if (hour < 9) baseOccupancy = 0.1; // Early morning
            else if (hour < 11) baseOccupancy = 0.3; // Morning
            else if (hour < 14) baseOccupancy = 0.5; // Lunch hours
            else if (hour < 17) baseOccupancy = 0.7; // Afternoon
            else if (hour < 20) baseOccupancy = 0.8; // Evening - peak
            else if (hour < 23) baseOccupancy = 0.6; // Night
            else baseOccupancy = 0.3; // Late night
            
            // Weekend adjustments
            if (day === 0 || day === 6) {
              baseOccupancy *= 0.7; // Less busy on weekends
            }
          }
          // Cafe patterns
          else if (location.type === 'cafe') {
            if (hour < 7 || hour >= 19) baseOccupancy = 0; // Closed
            else if (hour >= 7 && hour < 9) baseOccupancy = 0.6; // Morning coffee rush
            else if (hour >= 11 && hour < 14) baseOccupancy = 0.9; // Lunch rush
            else if (hour >= 15 && hour < 17) baseOccupancy = 0.7; // Afternoon coffee
            else baseOccupancy = 0.4; // Normal hours
            
            // Weekend adjustments
            if (day === 0 || day === 6) {
              baseOccupancy *= 0.5; // Much less busy on weekends
            }
          }
          // Computer lab patterns
          else if (location.type === 'lab') {
            if (hour < 8 || hour >= 22) baseOccupancy = 0; // Closed
            else if (hour >= 9 && hour < 12) baseOccupancy = 0.5; // Morning
            else if (hour >= 12 && hour < 14) baseOccupancy = 0.3; // Lunch (less busy)
            else if (hour >= 14 && hour < 17) baseOccupancy = 0.7; // Afternoon
            else if (hour >= 19 && hour < 22) baseOccupancy = 0.9; // Evening - peak
            else baseOccupancy = 0.4; // Other times
            
            // Weekend adjustments
            if (day === 0) {
              baseOccupancy *= 0.3; // Very quiet on Sundays
            } else if (day === 6) {
              baseOccupancy *= 0.5; // Quiet on Saturdays
            }
          }
          // Dining patterns
          else if (location.type === 'dining') {
            if (hour < 7 || hour >= 21) baseOccupancy = 0; // Closed
            else if (hour >= 7 && hour < 9) baseOccupancy = 0.7; // Breakfast
            else if (hour >= 11 && hour < 14) baseOccupancy = 0.9; // Lunch - peak
            else if (hour >= 17 && hour < 19) baseOccupancy = 0.8; // Dinner
            else baseOccupancy = 0.2; // Off-hours
          }
          // Default pattern
          else {
            if (hour < 8 || hour >= 20) baseOccupancy = 0.1; // Early/late
            else if (hour >= 10 && hour < 16) baseOccupancy = 0.6; // Business hours
            else baseOccupancy = 0.3; // Other times
          }
          
          // Add some randomness (±10%)
          const randomFactor = 1 + (Math.random() * 0.2 - 0.1);
          dayPattern.push(Math.min(1, Math.max(0, baseOccupancy * randomFactor)));
        }
        
        weekPattern.push(dayPattern);
      }
      
      this.patterns.set(location.id, weekPattern);
    });
  }
  
  /**
   * Update simulated data to create realistic changes
   */
  private updateSimulatedData(): void {
    const locations = campusService.getAllLocations();
    const now = new Date();
    const timeDiff = (Date.now() - this.lastUpdateTime) / 60000; // Minutes since last update
    
    locations.forEach(location => {
      const currentData = this.data.get(location.id);
      if (!currentData) return;
      
      // Get target occupancy based on time of day
      const targetOccupancy = this.getBaseOccupancyForTimeOfDay(location.id, now) * location.capacity;
      
      // Calculate a realistic change rate based on time difference
      // Move 10% toward the target per minute
      const changeRate = 0.1 * timeDiff;
      const change = (targetOccupancy - currentData.currentCount) * changeRate;
      
      // Add some randomness (±5 people)
      const randomChange = Math.floor(Math.random() * 10) - 5;
      
      // Calculate new count
      let newCount = Math.floor(currentData.currentCount + change + randomChange);
      
      // Ensure count is within valid bounds
      newCount = Math.min(location.capacity, Math.max(0, newCount));
      
      // Update data
      this.data.set(location.id, {
        ...currentData,
        currentCount: newCount,
        timestamp: new Date(),
        floorData: this.generateFloorData(location.id, newCount),
        resourcesAvailable: this.generateResourceData(location.id)
      });
    });
    
    this.lastUpdateTime = Date.now();
  }
  
  /**
   * Generate realistic floor-by-floor occupancy data
   */
  private generateFloorData(locationId: string, totalCount: number): FloorOccupancy[] | undefined {
    const location = campusService.getLocation(locationId);
    if (!location || !location.floors || location.floors.length === 0) return undefined;
    
    const floors = location.floors;
    const result: FloorOccupancy[] = [];
    let remainingCount = totalCount;
    
    // Distribute people across floors with some randomness
    for (let i = 0; i < floors.length - 1; i++) {
      // Allocate a portion of the remaining count to this floor
      const portion = Math.random() * 0.7 + 0.3; // 30-100% of even distribution
      const floorCapacity = Math.floor(location.capacity / floors.length);
      const targetCount = Math.floor(remainingCount * portion);
      
      // Ensure count doesn't exceed this floor's capacity
      const floorCount = Math.min(targetCount, floorCapacity);
      
      result.push({
        floor: floors[i],
        count: floorCount
      });
      
      remainingCount -= floorCount;
    }
    
    // Assign remaining count to the last floor
    result.push({
      floor: floors[floors.length - 1],
      count: Math.max(0, remainingCount)
    });
    
    return result;
  }
  
  /**
   * Generate resource availability data (computers, printers, etc.)
   */
  private generateResourceData(locationId: string): ResourceAvailability[] | undefined {
    const location = campusService.getLocation(locationId);
    if (!location || !location.features) return undefined;
    
    const result: ResourceAvailability[] = [];
    
    // Add computers if this location has them
    if (location.features.includes('computers')) {
      // Determine computer count based on location type and capacity
      const totalComputers = location.type === 'lab' 
        ? Math.floor(location.capacity * 0.8) // Labs are mostly computers
        : location.type === 'library' || location.type === 'study_area'
          ? Math.floor(location.capacity * 0.2) // Some library seats have computers
          : Math.floor(location.capacity * 0.05); // Other locations have few computers
      
      // Calculate availability based on current occupancy
      const occupancy = this.data.get(locationId);
      const occupancyRatio = occupancy 
        ? occupancy.currentCount / location.capacity 
        : 0.5; // Default to 50% if no data
      
      // Available computers decreases as occupancy increases, with some randomness
      const baseAvailable = Math.floor(totalComputers * (1 - occupancyRatio * 1.2));
      const randomFactor = Math.floor(Math.random() * 5) - 2; // ±2 computers
      
      const availableComputers = Math.max(0, Math.min(totalComputers, baseAvailable + randomFactor));
      
      result.push({
        type: 'computer',
        available: availableComputers,
        total: totalComputers
      });
    }
    
    // Add printers if this location has them
    if (location.features.includes('printers')) {
      // Determine printer count based on location type
      const totalPrinters = location.type === 'lab' || location.type === 'printer'
        ? Math.floor(location.capacity / 10) // More printers in labs
        : Math.min(3, Math.floor(location.capacity / 50)); // Fewer printers elsewhere
      
      // Available printers is usually high but occasionally has a queue
      const printerQueueChance = Math.random();
      let availablePrinters = totalPrinters;
      
      if (printerQueueChance > 0.7) {
        // 30% chance of some printers being busy
        availablePrinters = Math.max(0, totalPrinters - Math.floor(Math.random() * 3));
      }
      
      result.push({
        type: 'printer',
        available: availablePrinters,
        total: totalPrinters
      });
    }
    
    // Add study rooms if this location has them
    if (location.features && location.features.includes('group_study')) {
      const totalRooms = Math.floor(location.capacity / 30); // Rough estimate
      
      // Group study rooms availability varies throughout the day
      const now = new Date();
      const hour = now.getHours();
      
      // Study rooms are busier in afternoons and evenings
      let baseAvailability: number;
      if (hour < 9) baseAvailability = 0.9; // Early morning, most available
      else if (hour < 12) baseAvailability = 0.6; // Morning
      else if (hour < 17) baseAvailability = 0.3; // Afternoon, busy
      else if (hour < 21) baseAvailability = 0.2; // Evening, very busy
      else baseAvailability = 0.7; // Late night, more available
      
      const randomFactor = Math.random() * 0.2 - 0.1; // ±10%
      const availabilityRatio = Math.max(0, Math.min(1, baseAvailability + randomFactor));
      
      const availableRooms = Math.floor(totalRooms * availabilityRatio);
      
      result.push({
        type: 'study_room',
        available: availableRooms,
        total: totalRooms
      });
    }
    
    return result.length > 0 ? result : undefined;
  }
  
  /**
   * Get the base occupancy percentage for a location by time of day
   */
  private getBaseOccupancyForTimeOfDay(locationId: string, time: Date = new Date()): number {
    const location = campusService.getLocation(locationId);
    if (!location) return 0;
    
    // Check if location is open
    if (!campusService.isLocationOpenAt(locationId, time)) return 0;
    
    const day = time.getDay(); // 0 = Sunday
    const hour = time.getHours();
    
    // Use historical pattern if available
    if (this.patterns.has(locationId)) {
      const pattern = this.patterns.get(locationId)!;
      if (pattern[day] && pattern[day][hour] !== undefined) {
        return pattern[day][hour];
      }
    }
    
    // Fallback to general patterns if specific pattern isn't available
    switch (location.type) {
      case 'library':
      case 'study_area':
        if (hour < 8) return 0.05; // Early morning
        if (hour < 10) return 0.2; // Morning
        if (hour < 14) return 0.5; // Late morning/early afternoon
        if (hour < 19) return 0.7; // Afternoon/early evening
        if (hour < 22) return 0.6; // Evening
        return 0.3; // Late night
        
      case 'cafe':
        if (hour < 7 || hour >= 19) return 0; // Closed
        if (hour < 9) return 0.6; // Morning coffee rush
        if (hour < 11) return 0.3; // Mid-morning
        if (hour < 14) return 0.8; // Lunch rush
        if (hour < 16) return 0.4; // Afternoon
        return 0.2; // Evening
        
      case 'lab':
        if (hour < 8 || hour >= 22) return 0; // Closed
        if (hour < 12) return 0.4; // Morning
        if (hour < 14) return 0.3; // Lunch (quieter)
        if (hour < 17) return 0.6; // Afternoon
        if (hour < 21) return 0.8; // Evening
        return 0.4; // Late evening
        
      case 'dining':
        if (hour < 7 || hour >= 21) return 0; // Closed
        if (hour < 9) return 0.6; // Breakfast
        if (hour < 11) return 0.1; // Mid-morning
        if (hour < 14) return 0.9; // Lunch
        if (hour < 16) return 0.2; // Afternoon
        if (hour < 19) return 0.8; // Dinner
        return 0.3; // Evening
        
      default:
        if (hour < 8 || hour >= 20) return 0.1; // Early/late
        if (hour < 17) return 0.6; // Business hours
        return 0.3; // Evening
    }
  }
  
  // PUBLIC METHODS
  
  /**
   * Get occupancy data for a specific location
   */
  getOccupancyData(locationId: string): OccupancyData | null {
    return this.data.get(locationId) || null;
  }
  
  /**
   * Get occupancy data for all locations
   */
  getAllOccupancyData(): OccupancyData[] {
    return Array.from(this.data.values());
  }
  
  /**
   * Get heatmap data for display
   */
  getHeatmapData(): { locationId: string; name: string; occupancy: number }[] {
    return Array.from(this.data.entries()).map(([locationId, data]) => {
      const location = campusService.getLocation(locationId);
      return {
        locationId,
        name: location?.name || locationId,
        occupancy: data.currentCount / data.capacity
      };
    }).sort((a, b) => b.occupancy - a.occupancy); // Sort by occupancy (highest first)
  }
  
  /**
   * Get a recommended location based on type and current occupancy
   */
  getRecommendedLocation(type: string): OccupancyRecommendation {
    const locations = campusService.getLocationsByType(type);
    const openLocations = locations.filter(loc => campusService.isLocationOpenAt(loc.id));
    
    if (openLocations.length === 0) {
      // No open locations of this type
      const fallbackLocation = locations[0];
      return {
        locationId: fallbackLocation.id,
        name: fallbackLocation.name,
        reason: 'All locations are currently closed.',
        occupancyPercentage: 0
      };
    }
    
    // Get occupancy data for open locations
    const locationsWithOccupancy = openLocations
      .map(loc => {
        const occData = this.getOccupancyData(loc.id);
        return {
          location: loc,
          occupancyData: occData,
          occupancyRatio: occData ? occData.currentCount / occData.capacity : 1 // Default to full if no data
        };
      })
      .filter(item => item.occupancyData !== null);
    
    // Sort by occupancy (lowest first)
    locationsWithOccupancy.sort((a, b) => a.occupancyRatio - b.occupancyRatio);
    
    // Get the least busy location
    const bestLocation = locationsWithOccupancy[0];
    if (!bestLocation) {
      // Fallback if no occupancy data
      return {
        locationId: openLocations[0].id,
        name: openLocations[0].name,
        reason: 'Recommended based on availability.',
        occupancyPercentage: 0
      };
    }
    
    // Generate a reason based on occupancy
    let reason = '';
    const occupancyPercentage = Math.round(bestLocation.occupancyRatio * 100);
    
    if (occupancyPercentage < 20) {
      reason = 'Nearly empty right now.';
    } else if (occupancyPercentage < 50) {
      reason = 'Plenty of space available.';
    } else if (occupancyPercentage < 70) {
      reason = 'Moderately busy but space available.';
    } else {
      reason = 'The least busy option currently.';
    }
    
    // Add special features if available
    if (bestLocation.location.features) {
      if (bestLocation.location.features.includes('quiet_zones')) {
        reason += ' Has quiet study zones.';
      }
      if (bestLocation.location.features.includes('wifi') && bestLocation.location.features.includes('outlets')) {
        reason += ' Good WiFi and plenty of outlets.';
      }
    }
    
    return {
      locationId: bestLocation.location.id,
      name: bestLocation.location.name,
      reason,
      occupancyPercentage
    };
  }
  
  /**
   * Get recommended time to visit a location based on hourly patterns
   */
  getRecommendedTime(locationId: string): TimeRecommendation {
    const location = campusService.getLocation(locationId);
    if (!location) {
      return { hour: 12, reason: 'Location not found.', improvementPercentage: 0 };
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Get occupancy pattern for this location and day
    const pattern = this.patterns.get(locationId)?.[dayOfWeek];
    if (!pattern) {
      return { hour: 12, reason: 'No pattern data available.', improvementPercentage: 0 };
    }
    
    // Get current occupancy
    const currentOccupancy = pattern[currentHour];
    if (currentOccupancy === undefined) {
      return { hour: 12, reason: 'No occupancy data for current hour.', improvementPercentage: 0 };
    }
    
    // Find hours after current time with lower occupancy
    const betterHours = [];
    for (let hour = currentHour + 1; hour < Math.min(24, currentHour + 12); hour++) {
      const hourToCheck = hour % 24;
      if (pattern[hourToCheck] !== undefined && pattern[hourToCheck] < currentOccupancy * 0.75) {
        betterHours.push({
          hour: hourToCheck,
          occupancy: pattern[hourToCheck],
          improvement: Math.round((1 - pattern[hourToCheck] / currentOccupancy) * 100)
        });
      }
    }
    
    // No better hours found
    if (betterHours.length === 0) {
      // Check if we're already at a good time
      if (currentOccupancy < 0.3) {
        return { 
          hour: currentHour, 
          reason: 'Now is already a great time to visit!', 
          improvementPercentage: 0 
        };
      }
      
      // Look for any hour that's better, even if not 25% better
      for (let hour = currentHour + 1; hour < Math.min(24, currentHour + 12); hour++) {
        const hourToCheck = hour % 24;
        if (pattern[hourToCheck] !== undefined && pattern[hourToCheck] < currentOccupancy) {
          betterHours.push({
            hour: hourToCheck,
            occupancy: pattern[hourToCheck],
            improvement: Math.round((1 - pattern[hourToCheck] / currentOccupancy) * 100)
          });
        }
      }
      
      // Still no better hours
      if (betterHours.length === 0) {
        return { 
          hour: currentHour, 
          reason: 'Current occupancy levels are expected to continue throughout the day.', 
          improvementPercentage: 0 
        };
      }
    }
    
    // Sort by improvement (highest first)
    betterHours.sort((a, b) => b.improvement - a.improvement);
    
    // Format the hour in 12-hour format
    const bestHour = betterHours[0].hour;
    const hour12 = bestHour % 12 === 0 ? 12 : bestHour % 12;
    const ampm = bestHour >= 12 ? 'PM' : 'AM';
    
    return {
      hour: bestHour,
      reason: `${hour12}${ampm} would be ${betterHours[0].improvement}% less crowded than right now.`,
      improvementPercentage: betterHours[0].improvement
    };
  }
  
  /**
   * Get resource availability for a specific resource type across all locations
   */
  getResourceAvailability(resourceType: string): { 
    locationId: string; 
    name: string; 
    available: number; 
    total: number;
  }[] {
    const result = [];
    
    for (const [locationId, data] of this.data.entries()) {
      if (data.resourcesAvailable) {
        const resourceData = data.resourcesAvailable.find(r => r.type === resourceType);
        if (resourceData) {
          const location = campusService.getLocation(locationId);
          result.push({
            locationId,
            name: location?.name || locationId,
            available: resourceData.available,
            total: resourceData.total
          });
        }
      }
    }
    
    // Sort by availability (highest first)
    return result.sort((a, b) => b.available - a.available);
  }
  
  /**
   * Generate a random ambient insight for proactive messaging
   */
  getRandomInsight(sessionId: string = 'default'): string | null {
    // Only provide insights during reasonable hours (8am-10pm)
    const now = new Date();
    const hour = now.getHours();
    if (hour < 8 || hour > 22) return null;
    
    // Don't provide too many insights - 15% chance
    if (Math.random() > 0.15) return null;
    
    const insights: string[] = [];
    
    // 1. Check for unusually empty popular spots
    const popularLocations = ['goddard-library', 'academic-commons', 'university-center-dining'];
    for (const locId of popularLocations) {
      const data = this.getOccupancyData(locId);
      const location = campusService.getLocation(locId);
      if (data && location && data.currentCount / data.capacity < 0.3) {
        insights.push(`💡 Insider tip: ${location.name} is unusually empty right now (${Math.round(data.currentCount / data.capacity * 100)}% capacity). Perfect time to grab a spot!`);
        break; // Just find one
      }
    }
    
    // 2. Check for available resources (computers, printers)
    const availableComputers = this.getResourceAvailability('computer')
      .filter(item => item.available > 5);
    
    if (availableComputers.length > 0) {
      const bestLocation = availableComputers[0];
      insights.push(`💡 Computer tip: ${bestLocation.name} has ${bestLocation.available} open computers right now. Most students don't realize this.`);
    }
    
    const availablePrinters = this.getResourceAvailability('printer')
      .filter(item => item.available > 0);
    
    if (availablePrinters.length > 0) {
      const bestLocation = availablePrinters[0];
      insights.push(`💡 Printing tip: ${bestLocation.name} has ${bestLocation.available} available printers with no waiting. Quick trip there could save you time!`);
    }
    
    // 3. Check for unusually busy spots and suggest alternatives
    const busyLocations = Array.from(this.data.entries())
      .filter(([_, data]) => data.currentCount / data.capacity > 0.8)
      .map(([locId, _]) => locId);
    
    if (busyLocations.length > 0) {
      const busyLocId = busyLocations[0];
      const busyLocation = campusService.getLocation(busyLocId);
      if (busyLocation) {
        // Find an alternative of the same type
        const alternatives = Array.from(this.data.entries())
          .filter(([locId, data]) => {
            const loc = campusService.getLocation(locId);
            return loc && 
              loc.type === busyLocation.type && 
              locId !== busyLocId && 
              data.currentCount / data.capacity < 0.5;
          })
          .map(([locId, _]) => campusService.getLocation(locId));
        
        if (alternatives.length > 0) {
          insights.push(`💡 FYI: ${busyLocation.name} is very crowded right now. ${alternatives[0]!.name} is a great alternative with plenty of space.`);
        }
      }
    }
    
    // 4. Add time-based insights
    const now12 = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
    const nowAmPm = now.getHours() >= 12 ? 'PM' : 'AM';
    
    if (hour >= 11 && hour < 13) {
      // Lunch time insights
      const diningLocations = this.getHeatmapData()
        .filter(item => {
          const loc = campusService.getLocation(item.locationId);
          return loc && (loc.type === 'dining' || loc.type === 'cafe');
        })
        .sort((a, b) => a.occupancy - b.occupancy); // Sort by occupancy (lowest first)
      
      if (diningLocations.length > 0) {
        const bestDining = diningLocations[0];
        const location = campusService.getLocation(bestDining.locationId);
        if (location) {
          insights.push(`💡 Lunch tip: At ${now12}${nowAmPm}, ${location.name} has the shortest lines right now (${Math.round(bestDining.occupancy * 100)}% capacity).`);
        }
      }
    }
    
    if (hour >= 16 && hour < 20) {
      // Evening study insights
      const studyLocations = this.getHeatmapData()
        .filter(item => {
          const loc = campusService.getLocation(item.locationId);
          return loc && (loc.type === 'library' || loc.type === 'study_area');
        })
        .sort((a, b) => a.occupancy - b.occupancy); // Sort by occupancy (lowest first)
      
      if (studyLocations.length > 0) {
        const bestStudy = studyLocations[0];
        const location = campusService.getLocation(bestStudy.locationId);
        if (location) {
          insights.push(`💡 Evening study tip: ${location.name} is the least crowded study space right now (${Math.round(bestStudy.occupancy * 100)}% capacity).`);
        }
      }
    }
    
    // Add a special tip about basement locations
    const basementLocations = campusService.getAllLocations()
      .filter(loc => loc.location && loc.location.floor.toLowerCase().includes('basement'));
    
    if (basementLocations.length > 0) {
      const randomBasement = basementLocations[Math.floor(Math.random() * basementLocations.length)];
      if (Math.random() < 0.3) { // 30% chance to show this tip
        insights.push(`💡 Hidden gem: Most students don't know about the study spaces in ${randomBasement.name}. It's usually much quieter than main areas.`);
      }
    }
    
    // If we found insights, return a random one
    if (insights.length > 0) {
      return insights[Math.floor(Math.random() * insights.length)];
    }
    
    return null;
  }
}

export default new OccupancyService();
