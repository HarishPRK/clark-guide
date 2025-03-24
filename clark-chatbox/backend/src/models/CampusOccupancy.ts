/**
 * Models for representing real-time occupancy data for campus locations
 */

export interface ResourceAvailability {
  type: string; // 'printer', 'computer', etc.
  available: number;
  total: number;
}

export interface FloorOccupancy {
  floor: string;
  count: number;
}

export interface OccupancyData {
  locationId: string;
  currentCount: number;
  capacity: number;
  timestamp: Date;
  floorData?: FloorOccupancy[];
  resourcesAvailable?: ResourceAvailability[];
}

export interface OccupancyRecommendation {
  locationId: string;
  name: string;
  reason: string;
  occupancyPercentage: number;
}

export interface TimeRecommendation {
  hour: number;
  reason: string;
  improvementPercentage?: number;
}
