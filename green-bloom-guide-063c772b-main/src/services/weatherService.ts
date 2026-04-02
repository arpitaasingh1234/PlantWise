// Weather Service - Get weather data for plant recommendations
export interface WeatherData {
  temperature: number;
  condition: 'hot' | 'cold' | 'moderate';
  location: string;
  description: string;
}

// OpenWeather API configuration
const OPENWEATHER_API_KEY = 'YOUR_API_KEY'; // User should replace this with their actual API key
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get user location using browser geolocation
export async function getUserLocation(): Promise<{ lat: number; lon: number; city: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to default location
      resolve({ lat: 28.6139, lon: 77.2090, city: 'New Delhi' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get city name using reverse geocoding (simplified)
        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`)
          .then(response => response.json())
          .then(data => {
            const city = data[0]?.name || 'Unknown Location';
            resolve({ lat: latitude, lon: longitude, city });
          })
          .catch(() => {
            resolve({ lat: latitude, lon: longitude, city: 'Unknown Location' });
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to default location
        resolve({ lat: 28.6139, lon: 77.2090, city: 'New Delhi' });
      }
    );
  });
}

// Fetch weather data from OpenWeather API
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    const temperature = Math.round(data.main.temp);
    
    // Convert temperature to condition
    let condition: 'hot' | 'cold' | 'moderate';
    if (temperature >= 30) {
      condition = 'hot';
    } else if (temperature <= 15) {
      condition = 'cold';
    } else {
      condition = 'moderate';
    }
    
    return {
      temperature,
      condition,
      location: data.name || 'Unknown Location',
      description: data.weather[0]?.description || 'Unknown weather'
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Fallback to moderate weather
    return {
      temperature: 25,
      condition: 'moderate',
      location: 'Unknown Location',
      description: 'Unable to fetch weather'
    };
  }
}

// Get weather data with location detection
export async function getWeatherData(): Promise<WeatherData> {
  try {
    const location = await getUserLocation();
    return await fetchWeatherData(location.lat, location.lon);
  } catch (error) {
    console.error('Error getting weather data:', error);
    // Fallback to moderate weather
    return {
      temperature: 25,
      condition: 'moderate',
      location: 'Unknown Location',
      description: 'Unable to fetch weather'
    };
  }
}

// Get weather-based plant filtering criteria
export function getWeatherBasedCriteria(weather: WeatherData) {
  switch (weather.condition) {
    case 'hot':
      return {
        prioritizeLowWatering: true,
        prioritizeHighPollutionTolerance: true,
        description: 'Hot weather detected - showing drought-tolerant plants'
      };
    case 'cold':
      return {
        prioritizeIndoor: true,
        prioritizeColdTolerant: true,
        description: 'Cold weather detected - showing indoor and cold-tolerant plants'
      };
    case 'moderate':
    default:
      return {
        noSpecialPriority: true,
        description: 'Moderate weather - showing all suitable plants'
      };
  }
}
