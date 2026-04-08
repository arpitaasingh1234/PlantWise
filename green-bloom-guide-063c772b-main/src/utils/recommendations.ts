import { plants, soilRecommendations, type Plant, type PollutionLevel, type SpaceType, type PlantingType, type Location, type SunlightLevel, type SoilRecommendation, type AreaSize } from '@/data/plants';
import { fetchSurvivalFromML } from './mlApi';
import { loadPollutionDataFromCSV, loadPlantsFromCSV } from '@/data/dataLoader';

export interface UserEnvironment {
  pollutionLevel: PollutionLevel;
  spaceType: SpaceType;
  plantingType: PlantingType;
  location: Location;
  sunlight: SunlightLevel;
  areaSize: AreaSize;
  weather?: 'hot-dry' | 'rainy-humid' | 'cold-frost' | 'normal';
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
  weatherOptimization?: string;
}

const areaSizeLabels: Record<AreaSize, string> = {
  'very-small': 'very small table/window sill',
  'small': 'small balcony corner',
  'medium': 'medium home garden',
  'large': 'large open ground',
};

function generateReason(plant: Plant, env: UserEnvironment, survivalScore: number): string {
  const reasons: string[] = [];
  const selectedWeather = env.weather || 'normal';

  // Focus on mandatory matches for description
  if (plant.locations.includes(env.location) && plant.sunlight.includes(env.sunlight)) {
    reasons.push(`matches your ${env.location} and ${env.sunlight} conditions`);
  } else if (plant.locations.includes(env.location)) {
    reasons.push(`matches your ${env.location} conditions`);
  } else if (plant.sunlight.includes(env.sunlight)) {
    reasons.push(`matches your ${env.sunlight} conditions`);
  }

  // Add secondary conditions if they match
  if (plant.areaSizes.includes(env.areaSize)) {
    reasons.push(`suitable for ${areaSizeLabels[env.areaSize]}`);
  }
  if (plant.plantingTypes.includes(env.plantingType)) {
    reasons.push(`works with ${env.plantingType} planting`);
  }

  // Add special attributes
  if (plant.airPurifying) {
    reasons.push('excellent air-purifying capabilities');
  }
  if (plant.difficulty === 'easy') {
    reasons.push('beginner-friendly maintenance');
  }
  if (survivalScore >= 85) {
    reasons.push(`high survival rate (${survivalScore}%)`);
  }

  // Add weather-specific reasons
  if (selectedWeather === 'hot-dry' && (plant.wateringFrequency === 'biweekly' || plant.wateringFrequency === 'monthly')) {
    reasons.push('drought-tolerant');
  }
  if (selectedWeather === 'rainy-humid' && (plant.wateringFrequency === 'weekly' || plant.wateringFrequency === 'daily')) {
    reasons.push('moisture-loving');
  }
  if (selectedWeather === 'cold-frost' && plant.locations.includes('indoor')) {
    reasons.push('cold-tolerant indoor plant');
  }

  // Add planting method for road-side/open-ground
  if ((env.spaceType === 'roadside' || env.spaceType === 'open-ground') && plant.plantingMethod) {
    if (reasons.length > 0) {
      return `Recommended because it ${reasons.slice(0, 2).join(' and ')}. Planting method: ${plant.plantingMethod}`;
    }
    return `Recommended with planting method: ${plant.plantingMethod}`;
  }

  if (reasons.length === 0) {
    return `Recommended for your ${env.spaceType} environment.`;
  }

  return `Recommended because it ${reasons.slice(0, 3).join(' and ')}.`;
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
  // Use user-selected weather or default to normal
  const selectedWeather = env.weather || 'normal';
  
  // Get weather-based criteria from selection
  let weatherCriteria;
  switch (selectedWeather) {
    case 'hot-dry':
      weatherCriteria = {
        prioritizeLowWatering: true,
        prioritizeHighPollutionTolerance: true,
        description: 'Hot & Dry weather detected - showing drought-tolerant plants'
      };
      break;
    case 'rainy-humid':
      weatherCriteria = {
        prioritizeWaterTolerant: true,
        description: 'Rainy / Humid weather detected - showing moisture-loving plants'
      };
      break;
    case 'cold-frost':
      weatherCriteria = {
        prioritizeIndoor: true,
        description: 'Cold / Frost weather detected - showing indoor plants'
      };
      break;
    case 'normal':
    default:
      weatherCriteria = {
        noSpecialPriority: true,
        description: 'Normal weather - showing all suitable plants'
      };
  }

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
      weatherOptimization: weatherCriteria.description
    };
  }

  const { noDirectPlant, reason: noDirectReason } = checkNoDirectPlantation(env);

  if (noDirectPlant) {
    return {
      recommended: [],
      avoid: [],
      soilMix: [],
      noPlantation: true,
      noPlantationReasons: [noDirectReason],
      noDirectPlantation: false,
      noDirectPlantationReason: '',
      weatherOptimization: weatherCriteria.description
    };
  }

  // STRICT MATCHING - Accuracy over quantity
  let recommendedPlants: Plant[] = [];
  
  // Load plants from CSV data
  const allPlants = await loadPlantsFromCSV();
  console.log("Using local CSV dataset for plant recommendations");

  // CONFIDENCE SCORING SYSTEM - Enhanced for diversity
  const scoredPlants = allPlants.map(plant => {
    let score = 0;
    
    // MANDATORY MATCHES (highest weight)
    if (plant.locations.includes(env.location)) score += 2; // indoorOutdoor
    if (plant.sunlight.includes(env.sunlight)) score += 2; // sunlight
    
    // SECONDARY MATCHES (lower weight)
    if (plant.plantingTypes.includes(env.plantingType)) score += 1; // soil
    if (plant.areaSizes.includes(env.areaSize)) score += 1; // area
    
    // WEATHER MATCH
    if (selectedWeather === 'hot-dry' && (plant.wateringFrequency === 'biweekly' || plant.wateringFrequency === 'monthly' || plant.difficulty === 'easy')) {
      score += 1;
    } else if (selectedWeather === 'rainy-humid' && (plant.wateringFrequency === 'weekly' || plant.wateringFrequency === 'daily')) {
      score += 1;
    } else if (selectedWeather === 'cold-frost' && plant.locations.includes('indoor')) {
      score += 1;
    } else if (selectedWeather === 'normal') {
      score += 1; // normal weather gets point by default
    }
    
    // DIVERSITY BONUS - Add small random variation to prevent same plants always winning
    score += Math.random() * 0.5; // Small random factor for variety
    
    return { plant, score };
  });

  // MINIMUM CONFIDENCE FILTER - Only score >= 4 (must have both mandatory + at least 2 secondary)
  let highConfidencePlants = scoredPlants.filter(item => item.score >= 4).map(item => item.plant);

  // STRICT MANDATORY VALIDATION - MUST match both location and sunlight
  highConfidencePlants = highConfidencePlants.filter(plant => {
    const matchesLocation = plant.locations.includes(env.location);
    const matchesSunlight = plant.sunlight.includes(env.sunlight);
    
    // ABSOLUTE REQUIREMENT: Must match both mandatory conditions
    if (!matchesLocation || !matchesSunlight) {
      return false;
    }
    
    return true;
  });

  // ADD DIVERSITY - Shuffle to prevent same plants repeating
  highConfidencePlants.sort(() => Math.random() - 0.5);

  // ALWAYS SHOW 5 RESULTS - Add plants that match mandatory conditions ONLY
  if (highConfidencePlants.length < 5) {
    // Get all matching plants and shuffle for diversity
    const allMatchingPlants = allPlants.filter(plant => {
      // STRICT REQUIREMENT: Must match both mandatory conditions
      const matchesLocation = plant.locations.includes(env.location);
      const matchesSunlight = plant.sunlight.includes(env.sunlight);
      
      // Skip if already in list
      if (highConfidencePlants.some(p => p.id === plant.id)) return false;
      
      // MUST match both location AND sunlight - no exceptions
      return matchesLocation && matchesSunlight;
    });
    
    // Shuffle for variety
    allMatchingPlants.sort(() => Math.random() - 0.5);
    
    const additionalPlants = allMatchingPlants.slice(0, 5 - highConfidencePlants.length);
    
    highConfidencePlants = [...highConfidencePlants, ...additionalPlants];
  }

  // ABSOLUTE FINAL VALIDATION - Remove any plants that don't match mandatory conditions
  highConfidencePlants = highConfidencePlants.filter(plant => {
    // MUST match both location and sunlight - no exceptions
    const matchesLocation = plant.locations.includes(env.location);
    const matchesSunlight = plant.sunlight.includes(env.sunlight);
    
    // ABSOLUTE REQUIREMENT: Both conditions must be true
    if (!matchesLocation || !matchesSunlight) {
      return false;
    }
    
    // Double-check specific mismatches
    if (env.location === 'indoor' && !plant.locations.includes('indoor')) return false;
    if (env.location === 'outdoor' && !plant.locations.includes('outdoor')) return false;
    if (env.sunlight === 'low' && !plant.sunlight.includes('low')) return false;
    if (env.sunlight === 'full' && !plant.sunlight.includes('full')) return false;
    
    return true;
  });

  recommendedPlants = highConfidencePlants.slice(0, 6);

  // AVOID LIST - Plants that fail core conditions
  const avoidCandidates = allPlants.filter(plant => {
    // Skip plants already in recommended list
    if (recommendedPlants.some(rec => rec.id === plant.id)) return false;

    // Check if fails core conditions
    const failsLocation = !plant.locations.includes(env.location);
    const failsSunlight = !plant.sunlight.includes(env.sunlight);
    const failsSpaceType = !plant.spaceTypes.includes(env.spaceType);
    
    // Add to avoid if fails any core condition
    return failsLocation || failsSunlight || failsSpaceType;
  });

  // Shuffle avoid list for variety
  avoidCandidates.sort(() => Math.random() - 0.5);
  const avoidPlants = avoidCandidates.slice(0, 3);

  // Fetch ML survival scores in parallel
  const finalPlants: RecommendedPlant[] = await Promise.all(
    recommendedPlants.slice(0, 10).map(async (plant) => {
      const survivalScore = await fetchSurvivalFromML(env, plant);
      return {
        ...plant,
        imageUrl: plant.imageUrl || `https://source.unsplash.com/featured/?plant,${encodeURIComponent(plant.name)}`,
        survivalScore,
        explanation: generateReason(plant, env, survivalScore),
        maintenanceCost: getMaintenanceCost(plant),
      };
    })
  );

  // Sort by match score, survivalScore and airPurifying priority
  finalPlants.sort((a, b) => {
    const scoreA = calculateMatchScore(a, env) * 10 + (a.airPurifying ? 10 : 0) + a.survivalScore / 10;
    const scoreB = calculateMatchScore(b, env) * 10 + (b.airPurifying ? 10 : 0) + b.survivalScore / 10;
    return scoreB - scoreA;
  });

  const soilMix = soilRecommendations.filter(s => s.bestFor.includes(env.spaceType));

  // Enhanced soil recommendations based on planting type and weather
  const enhancedSoilMix = soilMix.filter(soil => {
    // Weather-based filtering
    const selectedWeather = env.weather || 'normal';
    if (selectedWeather === 'hot-dry') {
      const soilName = soil.name.toLowerCase();
      return soilName.includes('sandy') || 
             soilName.includes('well-drained') ||
             soilName.includes('cactus') ||
             soilName.includes('succulent');
    }
    
    if (selectedWeather === 'rainy-humid') {
      const soilName = soil.name.toLowerCase();
      return soilName.includes('loamy') || 
             soilName.includes('moisture') ||
             soilName.includes('clay') ||
             soilName.includes('control');
    }
    
    if (selectedWeather === 'cold-frost') {
      const soilName = soil.name.toLowerCase();
      return soilName.includes('nutrient') || 
             soilName.includes('rich') ||
             soilName.includes('potting') ||
             soilName.includes('indoor') ||
             soilName.includes('mix');
    }
    
    // Normal weather: no special filtering
    
    // Planting type filtering
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
    recommended: finalPlants,
    avoid: avoidPlants,
    soilMix: enhancedSoilMix,
    noPlantation: false,
    noPlantationReasons: [],
    noDirectPlantation: noDirectPlant,
    noDirectPlantationReason: noDirectReason,
    weatherOptimization: weatherCriteria.description
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
