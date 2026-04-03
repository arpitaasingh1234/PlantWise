// API Service - Fetch plants from backend API
import type { Plant, SoilRecommendation } from '@/data/plants';
import { loadPlantsFromCSV } from './dataLoader';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  communityCount?: number;
  error?: string;
}

// Fetch all plants from API (CSV + community plants)
export async function fetchPlantsFromAPI(): Promise<Plant[]> {
  // Check if backend is available and we're online
  if (!navigator.onLine) {
    console.log("Offline mode - using CSV fallback data");
    return await loadPlantsFromCSV();
  }

  try {
    const response = await fetch('http://localhost:3001/api/plants');
    
    // Check if response is ok
    if (!response.ok) {
      console.log("Backend not available - using CSV fallback data");
      return await loadPlantsFromCSV();
    }
    
    const result: ApiResponse<any[]> = await response.json();
    
    if (!result.success) {
      console.log("API error - using CSV fallback data");
      return await loadPlantsFromCSV();
    }
    
    // Convert API data to Plant interface format
    return result.data.map((plant, index) => ({
      id: plant.id || String(index + 1),
      name: plant.name || 'Unknown Plant',
      scientificName: plant.scientificName || '',
      emoji: '🌿',
      description: plant.description || `${plant.name} with ${plant.pollutionTolerance?.toLowerCase()} pollution tolerance.`,
      airPurifying: true,
      pollutionTolerance: mapPollutionTolerance(plant.pollutionTolerance),
      spaceTypes: mapSpaceType(plant.place),
      plantingTypes: mapPlantingType(plant.plantingMethod, plant.soil),
      locations: mapLocation(plant.indoorOutdoor),
      sunlight: mapSunlight(plant.sunlight),
      wateringFrequency: plant.watering || 'weekly',
      difficulty: mapDifficulty(plant.maintenance),
      benefits: [
        `Pollution Tolerance: ${plant.pollutionTolerance}`,
        `Maintenance: ${plant.maintenance}`,
        `Best for ${plant.place} areas`
      ],
      soilMix: plant.soil,
      survivalRate: 85,
      areaSizes: mapAreaSize(plant.area),
      imageUrl: `https://source.unsplash.com/featured/?plant,${encodeURIComponent(plant.name)}`,
      plantingMethod: plant.plantingMethod
    }));
  } catch (error) {
    console.log("API fetch failed - using CSV fallback data");
    return await loadPlantsFromCSV();
  }
}

// Add a new plant to the community collection
export async function addPlantToCommunity(plantData: any): Promise<{ success: boolean; message: string; plant?: any }> {
  // Check if we're online
  if (!navigator.onLine) {
    return {
      success: false,
      message: 'Offline - cannot add plant to community'
    };
  }

  try {
    const response = await fetch('http://localhost:3001/api/add-plant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantData),
    });
    
    // Check if response is ok
    if (!response.ok) {
      console.log("Backend not available - cannot add plant");
      return {
        success: false,
        message: 'Backend not available - please try again later'
      };
    }
    
    const result = await response.json();
    
    if (!result.success) {
      console.log("API error adding plant");
      return {
        success: false,
        message: result.error || 'Failed to add plant'
      };
    }
    
    return {
      success: true,
      message: result.message,
      plant: result.plant
    };
  } catch (error) {
    console.log("Failed to add plant to community");
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add plant'
    };
  }
}

// Get community plants only
export async function fetchCommunityPlants(): Promise<any[]> {
  // Check if we're online
  if (!navigator.onLine) {
    console.log("Offline mode - cannot fetch community plants");
    return [];
  }

  try {
    const response = await fetch('http://localhost:3001/api/community-plants');
    
    // Check if response is ok
    if (!response.ok) {
      console.log("Backend not available - cannot fetch community plants");
      return [];
    }
    
    const result: ApiResponse<any[]> = await response.json();
    
    if (!result.success) {
      console.log("API error fetching community plants");
      return [];
    }
    
    return result.data;
  } catch (error) {
    console.log("Failed to fetch community plants");
    return [];
  }
}

// Check API health
export async function checkAPIHealth(): Promise<{ success: boolean; data?: any }> {
  // Check if we're online
  if (!navigator.onLine) {
    console.log("Offline mode - API health check skipped");
    return {
      success: false
    };
  }

  try {
    const response = await fetch('http://localhost:3001/api/health');
    
    // Check if response is ok
    if (!response.ok) {
      console.log("Backend not available - health check failed");
      return {
        success: false
      };
    }
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: result
    };
  } catch (error) {
    console.log("API health check failed");
    return {
      success: false
    };
  }
}

// Helper functions to map API data to existing interface
function mapPollutionTolerance(tolerance: string): ('low' | 'medium' | 'high')[] {
  if (!tolerance || typeof tolerance !== 'string') return ['medium'];
  
  const normalized = tolerance.toLowerCase().trim();
  switch (normalized) {
    case 'low':
      return ['low'];
    case 'medium':
      return ['medium'];
    case 'high':
      return ['high'];
    default:
      return ['medium'];
  }
}

function mapSpaceType(place: string): ('roadside' | 'home' | 'office' | 'balcony' | 'open-ground')[] {
  if (!place || typeof place !== 'string') return ['home'];
  
  const normalized = place.toLowerCase().trim();
  const places = normalized.split('|').map(p => p.trim()).filter(p => p);
  const result: ('roadside' | 'home' | 'office' | 'balcony' | 'open-ground')[] = [];
  
  places.forEach(p => {
    switch (p) {
      case 'home':
        result.push('home');
        break;
      case 'office':
        result.push('office');
        break;
      case 'balcony':
        result.push('balcony');
        break;
      case 'open_ground':
      case 'open-ground':
        result.push('open-ground');
        break;
      case 'roadside':
        result.push('roadside');
        break;
    }
  });
  
  return result.length > 0 ? result : ['home'];
}

function mapPlantingType(plantingMethod: string, soil: string): ('soil' | 'pot')[] {
  const normalizedSoil = soil ? soil.toLowerCase().trim() : '';
  const normalizedMethod = plantingMethod ? plantingMethod.toLowerCase().trim() : '';
  
  if (normalizedSoil === 'pot') {
    return ['pot'];
  }
  if (normalizedSoil === 'soil') {
    return ['soil'];
  }
  
  return ['soil', 'pot'];
}

function mapLocation(indoorOutdoor: string): ('indoor' | 'outdoor')[] {
  if (!indoorOutdoor || typeof indoorOutdoor !== 'string') return ['indoor', 'outdoor'];
  
  const normalized = indoorOutdoor.toLowerCase().trim();
  switch (normalized) {
    case 'indoor':
      return ['indoor'];
    case 'outdoor':
      return ['outdoor'];
    default:
      return ['indoor', 'outdoor'];
  }
}

function mapSunlight(sunlight: string): ('low' | 'partial' | 'full')[] {
  if (!sunlight || typeof sunlight !== 'string') return ['partial'];
  
  const normalized = sunlight.toLowerCase().trim();
  switch (normalized) {
    case 'low':
      return ['low'];
    case 'partial':
      return ['partial'];
    case 'full':
      return ['full'];
    default:
      return ['partial'];
  }
}

function mapDifficulty(maintenance: string): 'easy' | 'moderate' | 'hard' {
  if (!maintenance || typeof maintenance !== 'string') return 'moderate';
  
  const normalized = maintenance.toLowerCase().trim();
  switch (normalized) {
    case 'low':
      return 'easy';
    case 'medium':
      return 'moderate';
    case 'high':
      return 'hard';
    default:
      return 'moderate';
  }
}

function mapAreaSize(area: string): ('very-small' | 'small' | 'medium' | 'large')[] {
  if (!area || typeof area !== 'string') return ['medium'];
  
  const normalized = area.toLowerCase().trim();
  switch (normalized) {
    case 'very_small':
    case 'very-small':
      return ['very-small'];
    case 'small':
      return ['small'];
    case 'medium':
      return ['medium'];
    case 'large':
      return ['large'];
    default:
      return ['medium'];
  }
}
