/**
 * Campus Insight Service - Handles AI interactions related to campus occupancy
 * Integrates with the campus services to provide personalized recommendations
 */

import { UserQuery, AIResponse } from './aiService';
import campusService from '../campus/campusService';
import occupancyService from '../campus/occupancyService';
import { CampusLocation } from '../../models/CampusLocation';

// Store sessions that recently received ambient insights to avoid repeating too quickly
const recentInsightSessions = new Map<string, number>();

class CampusInsightService {
  /**
   * Check if a user query is related to campus locations/occupancy
   */
  isCampusQuery(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Keywords related to occupancy
    const occupancyKeywords = [
      'busy', 'crowded', 'quiet', 'empty', 'full', 'available', 
      'packed', 'space', 'spot', 'best time', 'when to'
    ];
    
    // Keywords related to campus locations
    const locationKeywords = [
      'library', 'study', 'cafe', 'dining', 'hall', 'commons', 
      'computer', 'lab', 'printer', 'room'
    ];
    
    // Check for occupancy-related questions
    const hasOccupancyKeyword = occupancyKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    // Check for location-related questions
    const hasLocationKeyword = locationKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    // Return true if the query contains both types of keywords
    // or if it directly asks about a specific location's occupancy
    return (hasOccupancyKeyword && hasLocationKeyword) || 
           (lowerText.includes('where') && (
              lowerText.includes('study') || 
              lowerText.includes('eat') || 
              lowerText.includes('print')
           ));
  }
  
  /**
   * Main handler for campus-related queries
   */
  async handleCampusQuery(query: UserQuery): Promise<AIResponse> {
    const { text, sessionId = 'default', userType = 'student' } = query;
    const lowerText = text.toLowerCase();
    
    // Determine intent
    let intent = 'campus_occupancy';
    let confidence = 0.8;
    let response = 'I can provide information about campus occupancy and availability. What specifically would you like to know?';
    
    // Location-specific queries
    const locationTypes = [
      { type: 'library', keywords: ['library', 'book', 'study'] },
      { type: 'cafe', keywords: ['cafe', 'coffee', 'food'] },
      { type: 'lab', keywords: ['lab', 'computer'] },
      { type: 'study_area', keywords: ['study', 'quiet', 'space'] },
      { type: 'printer', keywords: ['print', 'printer', 'printing'] },
      { type: 'dining', keywords: ['eat', 'dining', 'food', 'lunch', 'dinner'] }
    ];
    
    // Get hour of day for time-based recommendations
    const hour = new Date().getHours();
    const isPrimeMealTime = (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19);
    
    // First check for specific questions about when to visit a location
    if (lowerText.includes('when') || lowerText.includes('best time') || lowerText.includes('time to')) {
      return this.handleTimeQuery(query);
    }
    
    // Next check for specific questions about resources
    if (lowerText.includes('printer') || lowerText.includes('printing')) {
      return this.handleResourceQuery(query, 'printer');
    }
    
    if (lowerText.includes('computer') || (lowerText.includes('pc') && !lowerText.includes('space'))) {
      return this.handleResourceQuery(query, 'computer');
    }
    
    // Look for location-specific queries
    for (const locationType of locationTypes) {
      if (locationType.keywords.some(keyword => lowerText.includes(keyword))) {
        // This is a query about a specific location type
        const recommendation = occupancyService.getRecommendedLocation(locationType.type);
        
        // Generate appropriate response based on location type
        if (locationType.type === 'library' || locationType.type === 'study_area') {
          response = `Based on my campus sensors, ${recommendation.name} is currently the best place to study. It's at ${recommendation.occupancyPercentage}% capacity. ${recommendation.reason}`;
          
          // Add time recommendation if it's busy
          if (recommendation.occupancyPercentage > 70) {
            const timeRec = occupancyService.getRecommendedTime(recommendation.locationId);
            if (timeRec.improvementPercentage && timeRec.improvementPercentage > 20) {
              response += ` If you can wait, coming back at ${this.formatHour(timeRec.hour)} would be ${timeRec.improvementPercentage}% less crowded.`;
            }
          }
          
          // If it's a library, add detail about specific floors
          const location = campusService.getLocation(recommendation.locationId);
          if (location && (location.type === 'library' || location.floors)) {
            const occupancy = occupancyService.getOccupancyData(recommendation.locationId);
            if (occupancy && occupancy.floorData && occupancy.floorData.length > 0) {
              // Find the least busy floor
              const floorData = [...occupancy.floorData].sort((a, b) => a.count - b.count);
              response += ` The ${floorData[0].floor} is the quietest area with only about ${floorData[0].count} people right now.`;
            }
          }
        } 
        else if (locationType.type === 'cafe' || locationType.type === 'dining') {
          if (isPrimeMealTime) {
            response = `It's peak hours, but ${recommendation.name} currently has the shortest lines (${recommendation.occupancyPercentage}% capacity). ${recommendation.reason}`;
            
            // Add time recommendation if it's very busy
            if (recommendation.occupancyPercentage > 80) {
              const timeRec = occupancyService.getRecommendedTime(recommendation.locationId);
              if (timeRec.improvementPercentage && timeRec.improvementPercentage > 20) {
                response += ` If you can wait, coming back at ${this.formatHour(timeRec.hour)} would be ${timeRec.improvementPercentage}% less crowded.`;
              }
            }
          } else {
            response = `Good timing! ${recommendation.name} is not very busy right now (${recommendation.occupancyPercentage}% capacity). ${recommendation.reason}`;
          }
        } 
        else if (locationType.type === 'lab') {
          const computerAvailability = occupancyService.getResourceAvailability('computer')
            .find(r => r.locationId === recommendation.locationId);
            
          if (computerAvailability) {
            response = `${recommendation.name} is your best option with ${computerAvailability.available} computers available out of ${computerAvailability.total}. It's at ${recommendation.occupancyPercentage}% capacity overall. ${recommendation.reason}`;
          } else {
            response = `${recommendation.name} is currently at ${recommendation.occupancyPercentage}% capacity. ${recommendation.reason}`;
          }
        }
        
        intent = `campus_${locationType.type}_recommendation`;
        confidence = 0.9;
        break;
      }
    }
    
    // If no specific location type was found, give a general response
    if (!response) {
      // Get the three least busy study spaces
      const studyLocations = campusService.getLocationsByType('study_area')
        .concat(campusService.getLocationsByType('library'));
      
      const openLocations = studyLocations.filter(loc => 
        campusService.isLocationOpenAt(loc.id)
      );
      
      if (openLocations.length === 0) {
        response = "I don't see any open study locations right now. Most campus facilities are closed at this hour.";
      } else {
        // Get occupancy data for open locations
        const locationsWithOccupancy = openLocations
          .map(loc => {
            const occData = occupancyService.getOccupancyData(loc.id);
            return {
              location: loc,
              occupancyRatio: occData ? occData.currentCount / occData.capacity : 1
            };
          })
          .sort((a, b) => a.occupancyRatio - b.occupancyRatio); // Sort by occupancy (lowest first)
        
        // Take top 3
        const bestLocations = locationsWithOccupancy.slice(0, 3);
        
        response = "Here are the least crowded study spaces on campus right now:\n\n";
        
        bestLocations.forEach((item, index) => {
          const occupancyPercent = Math.round(item.occupancyRatio * 100);
          response += `${index + 1}. ${item.location.name}: ${occupancyPercent}% capacity`;
          
          // Add special features
          if (item.location.features) {
            const features = [];
            if (item.location.features.includes('quiet_zones')) features.push('quiet zones');
            if (item.location.features.includes('outlets')) features.push('outlets');
            if (item.location.features.includes('wifi')) features.push('WiFi');
            if (item.location.features.includes('computers')) features.push('computers');
            if (item.location.features.includes('group_study')) features.push('group study rooms');
            
            if (features.length > 0) {
              response += ` (${features.join(', ')})`;
            }
          }
          
          response += '\n';
        });
        
        intent = 'campus_general_occupancy';
      }
    }
    
    return {
      text: response,
      intent,
      category: userType as 'student' | 'faculty' | 'other',
      confidence,
      sources: ['Campus Ambient Intelligence System']
    };
  }
  
  /**
   * Handle queries about the best time to visit a location
   */
  private handleTimeQuery(query: UserQuery): AIResponse {
    const { text, userType = 'student' } = query;
    const lowerText = text.toLowerCase();
    
    // Try to determine which location they're asking about
    let locationId = 'goddard-library'; // Default to library
    
    const locationKeywords = [
      { id: 'goddard-library', keywords: ['library', 'goddard'] },
      { id: 'academic-commons-cafe', keywords: ['cafe', 'coffee', 'academic commons'] },
      { id: 'university-center-dining', keywords: ['dining', 'dining hall', 'food', 'eat'] },
      { id: 'computer-lab-main', keywords: ['lab', 'computer lab', 'computer'] }
    ];
    
    // Find the location they're asking about
    for (const loc of locationKeywords) {
      if (loc.keywords.some(keyword => lowerText.includes(keyword))) {
        locationId = loc.id;
        break;
      }
    }
    
    // Get the location and recommendation
    const location = campusService.getLocation(locationId);
    if (!location) {
      return {
        text: "I'm not sure which location you're asking about. Could you specify a campus location like the library, cafe, or dining hall?",
        intent: 'campus_time_recommendation_error',
        category: userType as 'student' | 'faculty' | 'other',
        confidence: 0.5,
        sources: ['Campus Ambient Intelligence System']
      };
    }
    
    const recommendation = occupancyService.getRecommendedTime(locationId);
    
    // Generate response
    let response: string;
    
    if (recommendation.improvementPercentage && recommendation.improvementPercentage > 0) {
      response = `Based on typical daily patterns, the best time to visit ${location.name} today would be around ${this.formatHour(recommendation.hour)}. It should be ${recommendation.improvementPercentage}% less crowded than right now.`;
      
      // Add current occupancy for context
      const occupancyData = occupancyService.getOccupancyData(locationId);
      if (occupancyData) {
        const currentOccupancy = Math.round((occupancyData.currentCount / occupancyData.capacity) * 100);
        response += ` Currently, it's at ${currentOccupancy}% capacity.`;
      }
    } else {
      response = `${recommendation.reason} The current occupancy level at ${location.name} is already optimal.`;
    }
    
    return {
      text: response,
      intent: 'campus_time_recommendation',
      category: userType as 'student' | 'faculty' | 'other',
      confidence: 0.9,
      sources: ['Campus Time Pattern Analysis']
    };
  }
  
  /**
   * Handle queries about resource availability (computers, printers)
   */
  private handleResourceQuery(query: UserQuery, resourceType: string): AIResponse {
    const { userType = 'student' } = query;
    
    // Get resource availability across locations
    const availableResources = occupancyService.getResourceAvailability(resourceType);
    
    if (availableResources.length === 0) {
      return {
        text: `I don't have information about ${resourceType} availability right now.`,
        intent: `campus_${resourceType}_availability`,
        category: userType as 'student' | 'faculty' | 'other',
        confidence: 0.7,
        sources: ['Campus Resource Monitoring']
      };
    }
    
    // Generate response based on available resources
    let response: string = ""; // Initialize with empty string
    
    if (resourceType === 'printer') {
      // For printers, just list the top locations
      response = "Here's where you can find available printers right now:\n\n";
      
      availableResources.slice(0, 3).forEach((item, index) => {
        response += `${index + 1}. ${item.name}: ${item.available} out of ${item.total} printers available\n`;
      });
      
      // Add tip about quiet times
      response += "\nPro tip: Printers are usually less busy early in the morning (before 9AM) or in the evening after 7PM.";
    } else if (resourceType === 'computer') {
      // For computers, focus on the best location
      const bestLocation = availableResources[0];
      
      response = `${bestLocation.name} has the most computers available right now (${bestLocation.available} out of ${bestLocation.total}).`;
      
      // If there are multiple good options, mention them
      if (availableResources.length > 1 && availableResources[1].available > 3) {
        response += ` Alternatively, ${availableResources[1].name} has ${availableResources[1].available} computers available.`;
      }
      
      // Add tips about occupancy
      const occupancyData = occupancyService.getOccupancyData(bestLocation.locationId);
      if (occupancyData) {
        const occupancyPercent = Math.round((occupancyData.currentCount / occupancyData.capacity) * 100);
        response += ` The overall space is at ${occupancyPercent}% capacity.`;
      }
      
      // Add time recommendation if appropriate
      if (bestLocation.available < 5) {
        const location = campusService.getLocation(bestLocation.locationId);
        if (location) {
          const timeRec = occupancyService.getRecommendedTime(bestLocation.locationId);
          if (timeRec.improvementPercentage && timeRec.improvementPercentage > 20) {
            response += ` If you can wait, coming at ${this.formatHour(timeRec.hour)} typically has ${timeRec.improvementPercentage}% better computer availability.`;
          }
        }
      }
    } else {
      // Default response for any other resource type
      response = `I have information about ${availableResources.length} ${resourceType} locations.`;
      
      availableResources.slice(0, 3).forEach((item, index) => {
        response += `\n${index + 1}. ${item.name}: ${item.available} out of ${item.total} available`;
      });
    }
    
    return {
      text: response,
      intent: `campus_${resourceType}_availability`,
      category: userType as 'student' | 'faculty' | 'other',
      confidence: 0.95,
      sources: ['Campus Resource Monitoring']
    };
  }
  
  /**
   * Format hour as 12-hour with AM/PM
   */
  private formatHour(hour: number): string {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h}${ampm}`;
  }
  
  /**
   * Generate a random ambient insight for proactive messaging
   * Only if it's been a while since the last insight for this session
   */
  getProactiveInsight(sessionId: string = 'default'): string | null {
    // Check if we've sent an insight to this session recently
    const lastInsightTime = recentInsightSessions.get(sessionId);
    const now = Date.now();
    
    if (lastInsightTime && now - lastInsightTime < 5 * 60 * 1000) {
      // Don't send more than one insight every 5 minutes
      return null;
    }
    
    // Get insight from occupancy service
    const insight = occupancyService.getRandomInsight(sessionId);
    
    if (insight) {
      // Remember when we sent this insight
      recentInsightSessions.set(sessionId, now);
      
      // Clean up old sessions occasionally
      if (recentInsightSessions.size > 100) {
        // Remove sessions older than 30 minutes
        const cutoff = now - 30 * 60 * 1000;
        for (const [session, time] of recentInsightSessions.entries()) {
          if (time < cutoff) {
            recentInsightSessions.delete(session);
          }
        }
      }
    }
    
    return insight;
  }
}

export default new CampusInsightService();
