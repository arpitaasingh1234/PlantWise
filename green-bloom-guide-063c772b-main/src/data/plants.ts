// Plant Data - Load from API instead of static CSV
import { fetchPlantsFromAPI, fetchCommunityPlants, checkAPIHealth, addPlantToCommunity } from './apiService';
import { loadSoilRecommendationsFromCSV } from './dataLoader';

export type PollutionLevel = 'low' | 'medium' | 'high';
export type SpaceType = 'roadside' | 'home' | 'office' | 'balcony' | 'open-ground';
export type PlantingType = 'soil' | 'pot';
export type Location = 'indoor' | 'outdoor';
export type SunlightLevel = 'low' | 'partial' | 'full';
export type AreaSize = 'very-small' | 'small' | 'medium' | 'large';

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  emoji: string;
  description: string;
  airPurifying: boolean;
  pollutionTolerance: PollutionLevel[];
  spaceTypes: SpaceType[];
  plantingTypes: PlantingType[];
  locations: Location[];
  sunlight: SunlightLevel[];
  wateringFrequency: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  benefits: string[];
  avoidWhen?: string[];
  soilMix?: string;
  survivalRate: number; // percentage
  areaSizes: AreaSize[]; // which area sizes this plant fits
  imageUrl?: string; // Dynamic plant image URL
  plantingMethod?: string; // Planting method for road-side/open-ground
}

export interface SoilRecommendation {
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  bestFor: SpaceType[];
}

export let plants: Plant[] = [];

// Load plants from API (CSV + community plants)
async function loadPlants() {
  try {
    // Check if API is available
    const healthCheck = await checkAPIHealth();
    
    if (healthCheck.success) {
      console.log('Loading plants from API...');
      plants = await fetchPlantsFromAPI();
      console.log(`Loaded ${plants.length} plants from API (including community plants)`);
    } else {
      console.log('API not available, falling back to CSV loading...');
      // Fallback to CSV loading if API is not available
      const { loadPlantsFromCSV } = await import('./dataLoader');
      plants = await loadPlantsFromCSV();
      console.log(`Loaded ${plants.length} plants from CSV fallback`);
    }
  } catch (error) {
    console.error('Failed to load plants from API, falling back to CSV:', error);
    // Fallback to CSV loading
    try {
      const { loadPlantsFromCSV } = await import('./dataLoader');
      plants = await loadPlantsFromCSV();
      console.log(`Loaded ${plants.length} plants from CSV fallback`);
    } catch (fallbackError) {
      console.error('Failed to load plants from CSV fallback:', fallbackError);
      plants = [];
    }
  }
}

// Initialize plants data
loadPlants().catch(error => {
  console.error('Failed to initialize plants data:', error);
});

// Export function to add new plant and refresh data
export async function addNewPlant(plantData: any) {
  try {
    const result = await addPlantToCommunity(plantData);
    
    if (result.success) {
      // Refresh plants data to include the new plant
      await loadPlants();
    }
    
    return result;
  } catch (error) {
    console.error('Error adding new plant:', error);
    return {
      success: false,
      message: 'Failed to add plant'
    };
  }
}

// Export function to refresh plants data
export async function refreshPlants() {
  await loadPlants();
}

export let soilRecommendations: SoilRecommendation[] = [];

loadSoilRecommendationsFromCSV().then(data => {
  soilRecommendations = data;
}).catch(error => {
  console.error('Failed to load soil recommendations from CSV:', error);
});

export interface CommunityTip {
  id: string;
  author: string;
  avatar: string;
  location: string;
  tip: string;
  plantName: string;
  likes: number;
  date: string;
}

export const communityTips: CommunityTip[] = [
  {
    id: '1',
    author: 'Priya Sharma',
    avatar: '🧑‍🌾',
    location: 'Delhi, India',
    tip: 'Adding neem khali to my Snake Plants in Delhi helped them survive the winter smog season beautifully!',
    plantName: 'Snake Plant',
    likes: 24,
    date: '2 days ago',
  },
  {
    id: '2',
    author: 'Rahul Verma',
    avatar: '👨‍🔬',
    location: 'Mumbai, India',
    tip: 'Money plants near my window grew 2x faster when I added biochar to the soil. Great for removing toxins!',
    plantName: 'Money Plant',
    likes: 18,
    date: '1 week ago',
  },
  {
    id: '3',
    author: 'Anita Patel',
    avatar: '🌱',
    location: 'Bangalore, India',
    tip: 'Tulsi on my balcony keeps mosquitoes away AND purifies the air. I water it every morning with rice water.',
    plantName: 'Tulsi',
    likes: 31,
    date: '3 days ago',
  },
];
