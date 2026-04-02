import { plants, soilRecommendations, type Plant, type PollutionLevel, type SpaceType, type PlantingType, type Location, type SunlightLevel, type SoilRecommendation, type AreaSize } from '@/data/plants';
import { fetchSurvivalFromML } from './mlApi';
import { loadPollutionDataFromCSV } from '@/data/dataLoader';
import { getWeatherData, getWeatherBasedCriteria, type WeatherData } from '@/services/weatherService';

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

  // Only include reasons for conditions that actually match
  if (plant.sunlight.includes(env.sunlight)) {
    reasons.push(`matches your ${env.sunlight} sunlight`);
  }
  if (plant.locations.includes(env.location)) {
    reasons.push(`fits your ${env.location} space`);
  }
  if (plant.areaSizes.includes(env.areaSize)) {
    reasons.push(`suitable for ${areaSizeLabels[env.areaSize]}`);
  }
  if (plant.spaceTypes.includes(env.spaceType)) {
    reasons.push(`ideal for ${env.spaceType} environments`);
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
  if (env.weather === 'hot-dry' && (plant.wateringFrequency === 'biweekly' || plant.wateringFrequency === 'monthly')) {
    reasons.push('drought-tolerant');
  }
  if (env.weather === 'rainy-humid' && (plant.wateringFrequency === 'weekly' || plant.wateringFrequency === 'daily')) {
    reasons.push('moisture-loving');
  }
  if (env.weather === 'cold-frost' && plant.locations.includes('indoor')) {
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

  // STRICT MATCHING - Accuracy over quantity
  let recommendedPlants: Plant[] = [];

  // HARD FILTER - MUST match ALL core conditions
  recommendedPlants = plants.filter(plant => {
    // Core conditions that MUST match
    const matchesLocation = plant.locations.includes(env.location); // indoorOutdoor
    const matchesSunlight = plant.sunlight.includes(env.sunlight);
    const matchesSpaceType = plant.spaceTypes.includes(env.spaceType); // place
    
    // ALL core conditions must match - if ANY fails, remove plant
    return matchesLocation && matchesSunlight && matchesSpaceType;
  });

  // SECONDARY FILTER - Match additional conditions if possible
  if (recommendedPlants.length >= 5) {
    // Only apply secondary filters if we have enough plants
    recommendedPlants = recommendedPlants.filter(plant => {
      const matchesArea = plant.areaSizes.includes(env.areaSize);
      const matchesPlantingType = plant.plantingTypes.includes(env.plantingType);
      const toleratesPollution = plant.pollutionTolerance.includes(env.pollutionLevel);
      
      return matchesArea && matchesPlantingType && toleratesPollution;
    });
  }

  // WEATHER FILTER - Apply after main filtering
  if (selectedWeather === 'hot-dry') {
    recommendedPlants = recommendedPlants.filter(plant => 
      plant.wateringFrequency === 'biweekly' || 
      plant.wateringFrequency === 'monthly' ||
      plant.difficulty === 'easy'
    );
  } else if (selectedWeather === 'rainy-humid') {
    recommendedPlants = recommendedPlants.filter(plant => 
      plant.wateringFrequency === 'weekly' || 
      plant.wateringFrequency === 'daily'
    );
  } else if (selectedWeather === 'cold-frost') {
    recommendedPlants = recommendedPlants.filter(plant => 
      plant.locations.includes('indoor')
    );
  }

  // SAFE FALLBACK - If less than 5, relax ONLY secondary conditions
  if (recommendedPlants.length < 5) {
    // Relax area OR place (one at a time)
    recommendedPlants = plants.filter(plant => {
      // Core conditions MUST still match
      const matchesLocation = plant.locations.includes(env.location);
      const matchesSunlight = plant.sunlight.includes(env.sunlight);
      
      if (!matchesLocation || !matchesSunlight) return false; // Never relax core conditions
      
      // Try relaxing area first
      const matchesSpaceType = plant.spaceTypes.includes(env.spaceType);
      const matchesPlantingType = plant.plantingTypes.includes(env.plantingType);
      const toleratesPollution = plant.pollutionTolerance.includes(env.pollutionLevel);
      
      return matchesSpaceType && matchesPlantingType && toleratesPollution;
    });

    // Re-apply weather filter to relaxed results
    if (selectedWeather === 'hot-dry') {
      recommendedPlants = recommendedPlants.filter(plant => 
        plant.wateringFrequency === 'biweekly' || 
        plant.wateringFrequency === 'monthly' ||
        plant.difficulty === 'easy'
      );
    } else if (selectedWeather === 'rainy-humid') {
      recommendedPlants = recommendedPlants.filter(plant => 
        plant.wateringFrequency === 'weekly' || 
        plant.wateringFrequency === 'daily'
      );
    } else if (selectedWeather === 'cold-frost') {
      recommendedPlants = recommendedPlants.filter(plant => 
        plant.locations.includes('indoor')
      );
    }

    // If still less than 5, try relaxing place instead of area
    if (recommendedPlants.length < 5) {
      recommendedPlants = plants.filter(plant => {
        // Core conditions MUST still match
        const matchesLocation = plant.locations.includes(env.location);
        const matchesSunlight = plant.sunlight.includes(env.sunlight);
        
        if (!matchesLocation || !matchesSunlight) return false; // Never relax core conditions
        
        // Relax place condition
        const matchesArea = plant.areaSizes.includes(env.areaSize);
        const matchesPlantingType = plant.plantingTypes.includes(env.plantingType);
        const toleratesPollution = plant.pollutionTolerance.includes(env.pollutionLevel);
        
        return matchesArea && matchesPlantingType && toleratesPollution;
      });

      // Re-apply weather filter
      if (selectedWeather === 'hot-dry') {
        recommendedPlants = recommendedPlants.filter(plant => 
          plant.wateringFrequency === 'biweekly' || 
          plant.wateringFrequency === 'monthly' ||
          plant.difficulty === 'easy'
        );
      } else if (selectedWeather === 'rainy-humid') {
        recommendedPlants = recommendedPlants.filter(plant => 
          plant.wateringFrequency === 'weekly' || 
          plant.wateringFrequency === 'daily'
        );
      } else if (selectedWeather === 'cold-frost') {
        recommendedPlants = recommendedPlants.filter(plant => 
          plant.locations.includes('indoor')
        );
      }
    }
  }

  // FINAL VERIFICATION - Remove wrong results before showing
  recommendedPlants = recommendedPlants.filter(plant => {
    // Double-check core conditions match
    const matchesLocation = plant.locations.includes(env.location);
    const matchesSunlight = plant.sunlight.includes(env.sunlight);
    
    // If not matching, remove
    return matchesLocation && matchesSunlight;
  });

  // AVOID LIST - Plants that fail core conditions
  const avoidPlants = plants.filter(plant => {
    // Skip plants already in recommended list
    if (recommendedPlants.some(rec => rec.id === plant.id)) return false;

    // Check if fails core conditions
    const failsLocation = !plant.locations.includes(env.location);
    const failsSunlight = !plant.sunlight.includes(env.sunlight);
    const failsSpaceType = !plant.spaceTypes.includes(env.spaceType);
    
    // Add to avoid if fails any core condition
    return failsLocation || failsSunlight || failsSpaceType;
  }).slice(0, 3);

  // Fetch ML survival scores in parallel
  const scoredPlants: RecommendedPlant[] = await Promise.all(
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
  scoredPlants.sort((a, b) => {
    const scoreA = calculateMatchScore(a, env) * 10 + (a.airPurifying ? 10 : 0) + a.survivalScore / 10;
    const scoreB = calculateMatchScore(b, env) * 10 + (b.airPurifying ? 10 : 0) + b.survivalScore / 10;
    return scoreB - scoreA;
  });

  const soilMix = soilRecommendations.filter(s => s.bestFor.includes(env.spaceType));

  // Enhanced soil recommendations based on planting type and weather
  const enhancedSoilMix = soilMix.filter(soil => {
    // Weather-based filtering
    if (env.weather === 'hot-dry') {
      const soilName = soil.name.toLowerCase();
      return soilName.includes('sandy') || 
             soilName.includes('well-drained') ||
             soilName.includes('cactus') ||
             soilName.includes('succulent');
    }
    
    if (env.weather === 'rainy-humid') {
      const soilName = soil.name.toLowerCase();
      return soilName.includes('loamy') || 
             soilName.includes('moisture') ||
             soilName.includes('clay') ||
             soilName.includes('control');
    }
    
    if (env.weather === 'cold-frost') {
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
    recommended: scoredPlants,
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
