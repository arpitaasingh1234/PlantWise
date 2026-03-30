// CSV Data Loader - Converts CSV datasets to match existing Plant interface
import type { Plant, SoilRecommendation } from './plants';

// Helper function to parse CSV text
function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  console.log('CSV Headers:', headers); // Debug log
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    
    headers.forEach((header, headerIndex) => {
      obj[header] = values[headerIndex] || '';
    });
    
    // Debug log for first few rows
    if (index < 3) {
      console.log(`Row ${index + 1}:`, obj);
    }
    
    return obj;
  });
}

// Load and convert plants CSV to Plant interface
export async function loadPlantsFromCSV(): Promise<Plant[]> {
  try {
    const response = await fetch('/plants_pollution_dataset_200.csv');
    const csvText = await response.text();
    const csvData = parseCSV(csvText);
    
    return csvData.map((row, index) => {
      // Robust field access with fallbacks
      const name = row.name || row.Name || row.plant_name || `Plant ${index + 1}`;
      const place = row.place || row.Place || row.location || 'home';
      const indoorOutdoor = row.indoorOutdoor || row.indoor_outdoor || row.location || 'indoor';
      const sunlight = row.sunlight || row.Sunlight || row.light || 'partial';
      const soil = row.soil || row.Soil || row.soil_type || 'soil';
      const area = row.area || row.Area || row.size || 'medium';
      const pollutionTolerance = row.pollutionTolerance || row.pollution_tolerance || row.tolerance || 'medium';
      const maintenance = row.maintenance || row.Maintenance || row.care || 'medium';
      const watering = row.watering || row.Watering || row.water || 'weekly';
      const plantingMethod = row.plantingMethod || row.planting_method || row.method || '';
      
      return {
        id: String(index + 1),
        name: name,
        scientificName: '',
        emoji: '🌿',
        description: `${name} with ${pollutionTolerance?.toLowerCase()} pollution tolerance and ${maintenance} maintenance.`,
        airPurifying: true,
        pollutionTolerance: mapPollutionTolerance(pollutionTolerance),
        spaceTypes: mapSpaceType(place),
        plantingTypes: mapPlantingType(plantingMethod, soil),
        locations: mapLocation(indoorOutdoor),
        sunlight: mapSunlight(sunlight),
        wateringFrequency: watering || 'weekly',
        difficulty: mapDifficulty(maintenance),
        benefits: [
          `Pollution Tolerance: ${pollutionTolerance}`,
          `Maintenance: ${maintenance}`,
          `Best for ${place} areas`
        ],
        soilMix: soil,
        survivalRate: 85,
        areaSizes: mapAreaSize(area),
        imageUrl: `https://source.unsplash.com/featured/?plant,${encodeURIComponent(name)}`,
        plantingMethod: plantingMethod
      };
    });
  } catch (error) {
    console.error('Error loading plants CSV:', error);
    return [];
  }
}

// Load soil recommendations from CSV
export async function loadSoilRecommendationsFromCSV(): Promise<SoilRecommendation[]> {
  try {
    const response = await fetch('/soil_improvement_dataset.csv');
    const csvText = await response.text();
    const csvData = parseCSV(csvText);
    
    return csvData.map((row, index) => {
      // Exact column names from soil CSV
      const soilType = row.soilType || row.Soil_Type || row.name || `Soil ${index + 1}`;
      const suitablePlants = row.suitablePlants || row.Suitable_Plants || row.plants || '';
      const improvementTips = row.improvementTips || row.Improvement_Tips || row.suggestion || 'Good for plants';
      
      return {
        name: soilType,
        emoji: '🌱',
        description: `${soilType}. ${improvementTips}`,
        ingredients: suitablePlants.split('|').map(p => p.trim()).filter(p => p),
        bestFor: mapSoilBestFor(soilType)
      };
    });
  } catch (error) {
    console.error('Error loading soil CSV:', error);
    return [];
  }
}

// Helper function to map soil types to best locations
function mapSoilBestFor(soilType: string): ('roadside' | 'home' | 'office' | 'balcony' | 'open-ground')[] {
  const normalized = soilType?.toLowerCase();
  
  if (normalized?.includes('potting') || normalized?.includes('container')) {
    return ['home', 'office', 'balcony'];
  }
  if (normalized?.includes('garden') || normalized?.includes('loam')) {
    return ['home', 'balcony', 'open-ground'];
  }
  if (normalized?.includes('sandy') || normalized?.includes('clay')) {
    return ['roadside', 'open-ground'];
  }
  
  return ['home', 'balcony']; // Default fallback
}

// Helper functions to map CSV values to existing enum types
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

// Load pollution data (for reference, not used in Plant interface)
export async function loadPollutionDataFromCSV() {
  try {
    const response = await fetch('/Global_Air_Pollution_Data_2025_2026.csv');
    const csvText = await response.text();
    const csvData = parseCSV(csvText);
    
    return csvData.map((row, index) => {
      // Exact column names from pollution CSV
      const city = row.city || row.City || row.location || `Location ${index + 1}`;
      const aqi = row.AQI || row.aqi || '100';
      const pollutionLevel = row.pollutionLevel || row.pollution_level || row.level || 'medium';
      
      return {
        city: city,
        AQI: aqi,
        pollutionLevel: pollutionLevel,
        // Add any other fields as needed
      };
    });
  } catch (error) {
    console.error('Error loading pollution CSV:', error);
    return [];
  }
}
