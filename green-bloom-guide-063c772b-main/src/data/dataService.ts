// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Generic API fetch function
async function fetchAPI(endpoint: string, params?: Record<string, string>) {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

// Load datasets from backend API
export async function loadPlantData() {
  return await fetchAPI('/plants');
}

export async function loadPollutionData() {
  return await fetchAPI('/pollution', { limit: '10' });
}

export async function loadSoilData() {
  return await fetchAPI('/soil');
}

// Get plant recommendations from backend
export async function getPlantRecommendations(criteria: {
  pollution?: string;
  spaceType?: string;
  soil?: string;
}) {
  return await fetchAPI('/recommendations', criteria);
}

// Get pollution level from AQI class
export function getPollutionLevel(aqiClass: string): 'low' | 'medium' | 'high' {
  const normalized = aqiClass.toLowerCase();
  if (normalized.includes('good') || normalized.includes('moderate')) {
    return 'low';
  } else if (normalized.includes('unhealthy for sensitive') || normalized.includes('unhealthy')) {
    return 'medium';
  } else {
    return 'high';
  }
}

// Filter plants based on pollution tolerance (for backward compatibility)
export function filterPlantsByPollution(plants: any[], pollutionLevel: string) {
  return plants.filter(plant => {
    const tolerance = plant.Pollution_Tolerance?.toLowerCase();
    if (!tolerance) return false;
    
    switch (pollutionLevel) {
      case 'low':
        return tolerance === 'low' || tolerance === 'medium';
      case 'medium':
        return tolerance === 'high' || tolerance === 'medium';
      case 'high':
        return tolerance === 'high';
      default:
        return true;
    }
  });
}

// Get soil improvement suggestions
export async function getSoilSuggestions(soilType: string) {
  const soilData = await loadSoilData();
  const soil = soilData.find((s: any) => 
    s.Soil_Type?.toLowerCase() === soilType.toLowerCase()
  );
  
  return soil ? {
    suitablePlants: soil.Suitable_Plants?.split(';').map((p: string) => p.trim()) || [],
    suggestion: soil.Improvement_Suggestion || ''
  } : null;
}
