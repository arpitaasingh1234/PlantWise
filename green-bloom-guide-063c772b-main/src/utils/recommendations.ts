import { plants, soilRecommendations, type Plant, type PollutionLevel, type SpaceType, type PlantingType, type Location, type SunlightLevel, type SoilRecommendation, type AreaSize } from '@/data/plants';
import { fetchSurvivalFromML } from './mlApi';
import { loadPollutionDataFromCSV } from '@/data/dataLoader';

export interface UserEnvironment {
  pollutionLevel: PollutionLevel;
  spaceType: SpaceType;
  plantingType: PlantingType;
  location: Location;
  sunlight: SunlightLevel;
  areaSize: AreaSize;
}

export interface RecommendedPlant extends Plant {
  survivalScore: number;
  explanation: string;
  maintenanceCost: 'Low' | 'Medium' | 'High';
}

export interface RecommendationResult {
  recommended: RecommendedPlant[];
  avoid: Plant[];
  soilMix: SoilRecommendation[];
  noPlantation: boolean;
  noPlantationReasons: string[];
  noDirectPlantation: boolean;
  noDirectPlantationReason: string;
}

const areaSizeLabels: Record<AreaSize, string> = {
  'very-small': 'very small table/window sill',
  'small': 'small balcony corner',
  'medium': 'medium home garden',
  'large': 'large open ground',
};

function generateReason(plant: Plant, env: UserEnvironment, survivalScore: number): string {
  const reasons: string[] = [];

  if (plant.airPurifying) {
    reasons.push('excellent air-purifying capabilities');
  }
  if (survivalScore >= 85) {
    reasons.push(`high predicted survival rate (${survivalScore}%)`);
  }
  if (plant.pollutionTolerance.includes('high') && env.pollutionLevel === 'high') {
    reasons.push('strong pollution resistance');
  }
  if (plant.difficulty === 'easy') {
    reasons.push('beginner-friendly maintenance');
  }
  if (plant.sunlight.includes(env.sunlight)) {
    reasons.push(`thrives in ${env.sunlight} sunlight`);
  }
  if (plant.areaSizes.includes(env.areaSize)) {
    reasons.push(`fits ${areaSizeLabels[env.areaSize]} spaces`);
  }
  if (plant.locations.includes(env.location)) {
    reasons.push(`suitable for ${env.location} placement`);
  }

  if (reasons.length === 0) {
    return `Suitable for your ${env.spaceType} environment.`;
  }

  return `Recommended because it has ${reasons.slice(0, 3).join(', ')}.`;
}

function getMaintenanceCost(plant: Plant): 'Low' | 'Medium' | 'High' {
  if (plant.difficulty === 'easy') return 'Low';
  if (plant.difficulty === 'moderate') return 'Medium';
  return 'High';
}

function checkNoPlantation(env: UserEnvironment): { impossible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (env.spaceType === 'roadside' && env.location === 'indoor') {
    reasons.push('Roadside environments cannot be indoors');
  }
  if (env.spaceType === 'open-ground' && env.plantingType === 'pot') {
    reasons.push('Open-ground spaces are not suited for pot planting');
  }

  return { impossible: reasons.length > 0, reasons };
}

function checkNoDirectPlantation(env: UserEnvironment): { noDirectPlant: boolean; reason: string } {
  // Detect situations where ground planting isn't possible
  if (env.spaceType === 'roadside' && env.plantingType === 'soil' && env.areaSize === 'very-small') {
    return { noDirectPlant: true, reason: 'Roadside dividers and concrete surfaces have no soil access for direct plantation.' };
  }
  if (env.spaceType === 'office' && env.plantingType === 'soil') {
    return { noDirectPlant: true, reason: 'Indoor offices typically lack soil access for direct plantation.' };
  }
  if (env.location === 'indoor' && env.plantingType === 'soil' && env.areaSize === 'very-small') {
    return { noDirectPlant: true, reason: 'Very small indoor spaces may not support direct soil plantation.' };
  }
  return { noDirectPlant: false, reason: '' };
}

export async function getRecommendations(env: UserEnvironment): Promise<RecommendationResult> {
  const { impossible, reasons } = checkNoPlantation(env);

  if (impossible) {
    return {
      recommended: [],
      avoid: [],
      soilMix: [],
      noPlantation: true,
      noPlantationReasons: reasons,
      noDirectPlantation: false,
      noDirectPlantationReason: '',
    };
  }

  const { noDirectPlant, reason: noDirectReason } = checkNoDirectPlantation(env);

  // Enhanced filtering with partial match support
  const exactMatches = plants.filter(plant => {
    const toleratesPollution = plant.pollutionTolerance.includes(env.pollutionLevel);
    const fitsSpace = plant.spaceTypes.includes(env.spaceType);
    const fitsPlanting = plant.plantingTypes.includes(env.plantingType);
    const fitsLocation = plant.locations.includes(env.location);
    const fitsSunlight = plant.sunlight.includes(env.sunlight);
    const fitsArea = plant.areaSizes.includes(env.areaSize);
    return toleratesPollution && fitsSpace && fitsPlanting && fitsLocation && fitsSunlight && fitsArea;
  });

  // If no exact matches, find partial matches
  let matchingPlants = exactMatches;
  if (exactMatches.length === 0) {
    matchingPlants = plants.filter(plant => {
      const score = calculateMatchScore(plant, env);
      return score >= 3; // At least 3 out of 6 criteria should match
    });
  }

  // Fetch ML survival scores in parallel
  const scoredPlants: RecommendedPlant[] = await Promise.all(
    matchingPlants.map(async (plant) => {
      const survivalScore = await fetchSurvivalFromML(env, plant);
      return {
        ...plant,
        survivalScore,
        explanation: generateReason(plant, env, survivalScore),
        maintenanceCost: getMaintenanceCost(plant),
      };
    })
  );

  // Sort by match score, survivalScore and airPurifying priority
  scoredPlants.sort((a, b) => {
    const scoreA = calculateMatchScore(a, env) * 10 + (a.airPurifying ? 10 : 0) + a.survivalScore / 10;
    const scoreB = calculateMatchScore(b, env) * 10 + (b.airPurifying ? 10 : 0) + b.survivalScore / 10;
    return scoreB - scoreA;
  });

  const avoid = plants.filter(plant => {
    const cantToleratePollution = !plant.pollutionTolerance.includes(env.pollutionLevel);
    const doesntFitLocation = !plant.locations.includes(env.location);
    return cantToleratePollution || (doesntFitLocation && plant.avoidWhen && plant.avoidWhen.length > 0);
  }).slice(0, 3);

  const soilMix = soilRecommendations.filter(s => s.bestFor.includes(env.spaceType));

  // Enhanced soil recommendations based on planting type
  const enhancedSoilMix = soilMix.filter(soil => {
    // If user wants pot planting, prioritize potting soils
    if (env.plantingType === 'pot') {
      return soil.name.toLowerCase().includes('potting') || 
             soil.name.toLowerCase().includes('container') ||
             soil.name.toLowerCase().includes('mix');
    }
    // If user wants soil planting, prioritize garden soils
    if (env.plantingType === 'soil') {
      return !soil.name.toLowerCase().includes('potting') && 
             !soil.name.toLowerCase().includes('container');
    }
    return true; // Show all for mixed planting types
  });

  return {
    recommended: scoredPlants,
    avoid,
    soilMix: enhancedSoilMix,
    noPlantation: false,
    noPlantationReasons: [],
    noDirectPlantation: noDirectPlant,
    noDirectPlantationReason: noDirectReason,
  };
}

// Helper function to calculate match score for partial matches
function calculateMatchScore(plant: Plant, env: UserEnvironment): number {
  let score = 0;
  
  if (plant.pollutionTolerance.includes(env.pollutionLevel)) score++;
  if (plant.spaceTypes.includes(env.spaceType)) score++;
  if (plant.plantingTypes.includes(env.plantingType)) score++;
  if (plant.locations.includes(env.location)) score++;
  if (plant.sunlight.includes(env.sunlight)) score++;
  if (plant.areaSizes.includes(env.areaSize)) score++;
  
  return score;
}

export function classifyAQI(aqi: number): PollutionLevel {
  if (aqi <= 50) return 'low';
  if (aqi <= 150) return 'medium';
  return 'high';
}

export function getPollutionMessage(level: PollutionLevel): { text: string; icon: string; color: string } {
  switch (level) {
    case 'low':
      return { text: 'Air quality is great! 🌿', icon: '😊', color: 'eco-badge-low' };
    case 'medium':
      return { text: 'Moderate pollution — choose hardy plants', icon: '😐', color: 'eco-badge-medium' };
    case 'high':
      return { text: 'High pollution — pollution-resistant plants recommended', icon: '😷', color: 'eco-badge-high' };
  }
}

// Load pollution data for location-based recommendations
export async function loadPollutionData() {
  try {
    const pollutionData = await loadPollutionDataFromCSV();
    return pollutionData;
  } catch (error) {
    console.error('Error loading pollution data:', error);
    return [];
  }
}

// Get pollution level for a specific city/location
export function getPollutionLevelForLocation(pollutionData: any[], city: string): PollutionLevel {
  const locationData = pollutionData.find(row => 
    row.city?.toLowerCase() === city.toLowerCase() || 
    row.City?.toLowerCase() === city.toLowerCase()
  );
  
  if (locationData && (locationData.pollutionLevel || locationData.pollution_level)) {
    const level = locationData.pollutionLevel || locationData.pollution_level;
    if (typeof level === 'string') {
      const normalized = level.toLowerCase();
      if (normalized === 'low') return 'low';
      if (normalized === 'medium') return 'medium';
      if (normalized === 'high') return 'high';
    }
  }
  
  // Fallback to AQI if available
  if (locationData && locationData.AQI) {
    return classifyAQI(parseInt(locationData.AQI));
  }
  
  return 'medium'; // Default fallback
}
