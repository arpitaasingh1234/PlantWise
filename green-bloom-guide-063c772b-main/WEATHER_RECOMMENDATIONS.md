# Weather-Based Plant Recommendation Feature

## Overview

Added weather-based plant recommendation system that gets user location, fetches weather data, and optimizes plant suggestions based on temperature conditions.

## Files Created/Modified

### 1. `src/services/weatherService.ts` - NEW FILE

**Weather Service Functions:**
```typescript
export interface WeatherData {
  temperature: number;
  condition: 'hot' | 'cold' | 'moderate';
  location: string;
  description: string;
}

// Get user location using browser geolocation
export async function getUserLocation(): Promise<{ lat: number; lon: number; city: string }>

// Fetch weather from OpenWeather API
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData>

// Get weather with location detection
export async function getWeatherData(): Promise<WeatherData>

// Get weather-based filtering criteria
export function getWeatherBasedCriteria(weather: WeatherData)
```

**Temperature Classification:**
- `temp >= 30°C` → "hot"
- `temp <= 15°C` → "cold"  
- `else` → "moderate"

**Weather-Based Plant Priorities:**
- **Hot weather**: Prioritize low watering + high pollutionTolerance plants
- **Cold weather**: Prioritize indoor plants
- **Moderate weather**: No special priority

### 2. `src/utils/recommendations.ts` - ENHANCED

**Added Weather Integration:**
```typescript
import { getWeatherData, getWeatherBasedCriteria, type WeatherData } from '@/services/weatherService';

export interface RecommendationResult {
  // ... existing fields
  weather?: WeatherData;
  weatherOptimization?: string;
}
```

**Enhanced getRecommendations Function:**
```typescript
export async function getRecommendations(env: UserEnvironment): Promise<RecommendationResult> {
  // Get weather data
  const weather = await getWeatherData();
  const weatherCriteria = getWeatherBasedCriteria(weather);

  // Apply weather-based filtering
  if (weatherCriteria.prioritizeLowWatering) {
    matchingPlants = matchingPlants.filter(plant => 
      plant.wateringFrequency === 'biweekly' || 
      plant.wateringFrequency === 'monthly' ||
      plant.difficulty === 'easy'
    );
  }

  if (weatherCriteria.prioritizeIndoor) {
    matchingPlants = matchingPlants.filter(plant => 
      plant.locations.includes('indoor')
    );
  }

  if (weatherCriteria.prioritizeHighPollutionTolerance) {
    matchingPlants = matchingPlants.filter(plant => 
      plant.pollutionTolerance.includes('high')
    );
  }

  // Return weather data in results
  return {
    // ... existing fields
    weather,
    weatherOptimization: weatherCriteria.description
  };
}
```

### 3. `src/pages/Dashboard.tsx` - ENHANCED

**Added Weather Display in Recommendations Header:**
```typescript
<div className="flex items-center gap-4 text-xs text-muted-foreground">
  <span>{results.recommended.length} plants matched • sorted by AI confidence</span>
  {results.weather && (
    <span className="flex items-center gap-1">
      • Weather: {results.weather.temperature}°C ({results.weather.condition.charAt(0).toUpperCase() + results.weather.condition.slice(1)})
    </span>
  )}
</div>

{results.weatherOptimization && (
  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
    {results.weatherOptimization}
  </p>
)}
```

### 4. `src/components/PlantGuideWizard.tsx` - ENHANCED

**Added Weather Display in Wizard:**
```typescript
import { getWeatherData, type WeatherData } from '@/services/weatherService';

const [weather, setWeather] = useState<WeatherData | null>(null);

// Fetch weather data on component mount
useEffect(() => {
  const fetchWeather = async () => {
    try {
      const weatherData = await getWeatherData();
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  };
  
  fetchWeather();
}, []);
```

**Enhanced Welcome Step:**
```typescript
{/* Show weather and AQI badges if available */}
{(aqi !== null && aqi !== undefined) || weather ? (
  <div className="flex flex-wrap gap-2 justify-center">
    {aqi !== null && aqi !== undefined && (
      // AQI badge
    )}
    {weather && (
      <motion.div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        <CloudSun className="w-3.5 h-3.5" />
        Weather: {weather.temperature}°C ({weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)})
      </motion.div>
    )}
  </div>
)}
```

## Key Features Implemented

### ✅ **Geolocation Support**
- Browser geolocation API integration
- Fallback to default location (New Delhi)
- City name detection via reverse geocoding
- Error handling with graceful fallbacks

### ✅ **OpenWeather API Integration**
- Temperature in Celsius
- Weather condition detection
- API key configuration (user needs to add their key)
- Error handling with fallback to moderate weather

### ✅ **Weather-Based Plant Filtering**
- **Hot weather** (≥30°C): Low watering + high pollution tolerance
- **Cold weather** (≤15°C): Indoor plants prioritized
- **Moderate weather**: Standard filtering
- Combined with existing filters (place, sunlight, soil, area, indoorOutdoor)

### ✅ **UI Weather Display**
- **Plant Wizard**: Weather badge with temperature and condition
- **Dashboard**: Weather info in recommendation header
- **Optimization messages**: "Hot weather detected - showing drought-tolerant plants"
- Clean, professional weather badges

### ✅ **Plant Image Support**
- All plants get dynamic Unsplash images
- URL format: `https://source.unsplash.com/featured/?plant,{plant.name}`
- Fallback to emoji if image fails

### ✅ **Minimum 5 Plants Guarantee**
- Step-by-step filtering with progressive relaxation
- Weather-based prioritization
- Default plant fallbacks
- Final fallback to any plants

## Weather Logic Flow

1. **Get Location** → Browser geolocation or fallback
2. **Fetch Weather** → OpenWeather API with coordinates
3. **Classify Temperature** → Hot/Cold/Moderate
4. **Apply Filters** → Weather-based plant prioritization
5. **Combine Filters** → With existing user preferences
6. **Display Results** → With weather context and optimization message

## API Configuration

**Required Setup:**
```typescript
// In src/services/weatherService.ts
const OPENWEATHER_API_KEY = 'YOUR_API_KEY'; // Replace with actual API key
```

**Free API Key Required:**
- Sign up at OpenWeatherMap.org
- Get free API key
- Replace 'YOUR_API_KEY' with actual key

## Error Handling & Fallbacks

- **Geolocation fails** → Default to New Delhi
- **Weather API fails** → Default to 25°C moderate weather
- **No plants found** → Default plant recommendations
- **Image loading fails** → Plant emoji fallback

## Result

- ✅ **Weather-aware plant recommendations**
- ✅ **Temperature-based filtering**  
- ✅ **Always minimum 5 plants**
- ✅ **Dynamic plant images**
- ✅ **UI layout unchanged**
- ✅ **Both places show weather info**

The system now provides intelligent, weather-optimized plant recommendations while maintaining the existing UI structure and ensuring no empty results.
