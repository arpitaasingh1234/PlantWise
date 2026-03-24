const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Load datasets
let plantsData = [];
let pollutionData = [];
let soilData = [];
let communityPlants = []; // Store community-added plants

// Initialize data on server start
async function initializeData() {
  try {
    const csvPath = path.join(__dirname, '..');
    
    plantsData = await readCSV(path.join(csvPath, 'plants_pollution_dataset_200.csv'));
    pollutionData = await readCSV(path.join(csvPath, 'Global_Air_Pollution_Data_2025_2026.csv'));
    soilData = await readCSV(path.join(csvPath, 'soil_improvement_dataset.csv'));
    
    // Load community plants from JSON file if it exists
    const communityPlantsPath = path.join(__dirname, 'community-plants.json');
    if (fs.existsSync(communityPlantsPath)) {
      const communityData = fs.readFileSync(communityPlantsPath, 'utf8');
      communityPlants = JSON.parse(communityData);
    }
    
    console.log(`Loaded ${plantsData.length} plants`);
    console.log(`Loaded ${pollutionData.length} pollution records`);
    console.log(`Loaded ${soilData.length} soil types`);
    console.log(`Loaded ${communityPlants.length} community plants`);
  } catch (error) {
    console.error('Error loading CSV files:', error);
  }
}

// API Endpoints

// GET /api/plants - Get all plants with optional filtering
app.get('/api/plants', (req, res) => {
  try {
    // Merge CSV plants and community plants
    let allPlants = [...plantsData, ...communityPlants];
    
    let filteredPlants = [...allPlants];
    
    // Filter by pollution tolerance
    if (req.query.pollution) {
      const pollution = req.query.pollution.toLowerCase();
      filteredPlants = filteredPlants.filter(plant => 
        plant.pollutionTolerance && plant.pollutionTolerance.toLowerCase() === pollution
      );
    }
    
    // Filter by place
    if (req.query.place) {
      const place = req.query.place.toLowerCase();
      filteredPlants = filteredPlants.filter(plant => 
        plant.place && plant.place.toLowerCase().includes(place)
      );
    }
    
    // Filter by indoor/outdoor
    if (req.query.indoorOutdoor) {
      const indoorOutdoor = req.query.indoorOutdoor.toLowerCase();
      filteredPlants = filteredPlants.filter(plant => 
        plant.indoorOutdoor && plant.indoorOutdoor.toLowerCase() === indoorOutdoor
      );
    }
    
    // Filter by soil type
    if (req.query.soil) {
      const soil = req.query.soil.toLowerCase();
      filteredPlants = filteredPlants.filter(plant => 
        plant.soil && plant.soil.toLowerCase() === soil
      );
    }
    
    // Limit results
    const limit = req.query.limit ? parseInt(req.query.limit) : filteredPlants.length;
    filteredPlants = filteredPlants.slice(0, limit);
    
    res.json({
      success: true,
      data: filteredPlants,
      total: filteredPlants.length,
      communityCount: communityPlants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plants data'
    });
  }
});

// POST /api/add-plant - Add a new plant to the community collection
app.post('/api/add-plant', (req, res) => {
  try {
    const plantData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'place', 'indoorOutdoor', 'sunlight', 'soil', 'area', 'pollutionTolerance', 'maintenance', 'watering'];
    const missingFields = requiredFields.filter(field => !plantData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }
    
    // Check for duplicate plants
    const isDuplicate = communityPlants.some(plant => 
      plant.name.toLowerCase() === plantData.name.toLowerCase()
    ) || plantsData.some(plant => 
      plant.name.toLowerCase() === plantData.name.toLowerCase()
    );
    
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        error: 'Plant already exists'
      });
    }
    
    // Add metadata
    const newPlant = {
      ...plantData,
      id: `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date().toISOString(),
      source: 'community'
    };
    
    // Add to community plants array
    communityPlants.push(newPlant);
    
    // Save to JSON file
    const communityPlantsPath = path.join(__dirname, 'community-plants.json');
    fs.writeFileSync(communityPlantsPath, JSON.stringify(communityPlants, null, 2));
    
    console.log(`Added new community plant: ${newPlant.name}`);
    
    res.json({
      success: true,
      message: 'Plant added successfully',
      plant: newPlant,
      totalCommunityPlants: communityPlants.length
    });
    
  } catch (error) {
    console.error('Error adding plant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add plant'
    });
  }
});

// GET /api/community-plants - Get only community-added plants
app.get('/api/community-plants', (req, res) => {
  try {
    res.json({
      success: true,
      data: communityPlants,
      total: communityPlants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community plants'
    });
  }
});

// GET /api/pollution - Get pollution data with optional filtering
app.get('/api/pollution', (req, res) => {
  try {
    let filteredData = [...pollutionData];
    
    // Filter by city
    if (req.query.city) {
      const city = req.query.city.toLowerCase();
      filteredData = filteredData.filter(record => 
        record.City && record.City.toLowerCase().includes(city)
      );
    }
    
    // Filter by AQI class
    if (req.query.aqi) {
      const aqi = req.query.aqi.toLowerCase();
      filteredData = filteredData.filter(record => 
        record.AQI_Class && record.AQI_Class.toLowerCase().includes(aqi)
      );
    }
    
    // Limit results
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    filteredData = filteredData.slice(0, limit);
    
    res.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pollution data'
    });
  }
});

// GET /api/soil - Get soil data with optional filtering
app.get('/api/soil', (req, res) => {
  try {
    let filteredData = [...soilData];
    
    // Filter by soil type
    if (req.query.type) {
      const type = req.query.type.toLowerCase();
      filteredData = filteredData.filter(record => 
        record.Soil_Type && record.Soil_Type.toLowerCase() === type
      );
    }
    
    res.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch soil data'
    });
  }
});

// GET /api/recommendations - Get plant recommendations based on criteria
app.get('/api/recommendations', (req, res) => {
  try {
    const { pollution, spaceType, soil } = req.query;
    
    let recommendations = [...plantsData];
    
    // Filter by pollution tolerance
    if (pollution) {
      const pollutionLevel = pollution.toLowerCase();
      recommendations = recommendations.filter(plant => {
        const tolerance = plant.Pollution_Tolerance.toLowerCase();
        switch (pollutionLevel) {
          case 'low':
            return tolerance === 'low' || tolerance === 'medium';
          case 'medium':
            return tolerance === 'medium' || tolerance === 'high';
          case 'high':
            return tolerance === 'high';
          default:
            return true;
        }
      });
    }
    
    // Filter by space type
    if (spaceType) {
      const space = spaceType.toLowerCase();
      recommendations = recommendations.filter(plant => {
        const plantType = plant.Plant_Type.toLowerCase();
        switch (space) {
          case 'indoor':
            return plantType === 'shrub' || plantType === 'herb';
          case 'balcony':
            return plantType === 'shrub' || plantType === 'tree';
          case 'garden':
            return plantType === 'tree' || plantType === 'shrub';
          default:
            return true;
        }
      });
    }
    
    // Filter by soil type
    if (soil) {
      const soilType = soil.toLowerCase();
      recommendations = recommendations.filter(plant => 
        plant.Soil_Type && plant.Soil_Type.toLowerCase() === soilType
      );
    }
    
    // Return top 3 recommendations
    recommendations = recommendations.slice(0, 3);
    
    res.json({
      success: true,
      data: recommendations,
      criteria: { pollution, spaceType, soil }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PlantWise API is running',
    datasets: {
      plants: plantsData.length,
      community: communityPlants.length,
      total: plantsData.length + communityPlants.length,
      pollution: pollutionData.length,
      soil: soilData.length
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PlantWise API server running on http://localhost:${PORT}`);
  initializeData();
});

module.exports = app;
