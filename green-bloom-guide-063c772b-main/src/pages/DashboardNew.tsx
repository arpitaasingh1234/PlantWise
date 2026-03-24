import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PollutionData from '../components/PollutionData';
import SoilRecommendations from '../components/SoilRecommendations';
import { loadPlantData, getPlantRecommendations } from '../data/dataService';

function Dashboard() {
  const [pollutionLevel, setPollutionLevel] = useState('');
  const [spaceType, setSpaceType] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [plantData, setPlantData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  useEffect(() => {
    // Load plant data from backend API
    loadPlantData().then(data => {
      setPlantData(data);
      setLoading(false);
    });
  }, []);

  const getRecommendations = async () => {
    if (!pollutionLevel || !spaceType) {
      alert('Please fill in all fields');
      return;
    }

    setRecommendationLoading(true);
    try {
      const criteria = { pollution: pollutionLevel, spaceType };
      const data = await getPlantRecommendations(criteria);
      setRecommendations(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Failed to get recommendations. Please try again.');
    } finally {
      setRecommendationLoading(false);
    }
  };

  const getPollutionColor = (level) => {
    switch(level) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="section">
        <div className="container">
          <h1 className="section-title">Plant Recommendations</h1>
          <p className="text-center text-gray-600 mb-8">
            Get personalized plant suggestions based on your environment
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="mb-6">Tell us about your space</h2>
                
                <div className="mb-6">
                  <label className="block mb-2 font-medium">Pollution Level in Your Area</label>
                  <select 
                    className="input"
                    value={pollutionLevel}
                    onChange={(e) => setPollutionLevel(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select pollution level</option>
                    <option value="low">Low (Good air quality)</option>
                    <option value="medium">Medium (Moderate pollution)</option>
                    <option value="high">High (Unhealthy air)</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block mb-2 font-medium">Where will you grow plants?</label>
                  <select 
                    className="input"
                    value={spaceType}
                    onChange={(e) => setSpaceType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select space type</option>
                    <option value="indoor">Indoor</option>
                    <option value="balcony">Balcony</option>
                    <option value="garden">Garden/Yard</option>
                    <option value="office">Office</option>
                  </select>
                </div>

                <button 
                  className="btn btn-primary w-full"
                  onClick={getRecommendations}
                  disabled={loading || recommendationLoading}
                >
                  {recommendationLoading ? 'Getting Recommendations...' : 'Get Plant Recommendations'}
                </button>
              </div>
            </div>
            <div className="lg:col-span-1">
              <PollutionData />
            </div>
          </div>

          {showResults && (
            <div className="mt-8 fade-in">
              <h2 className="mb-6 text-center">Recommended Plants for You</h2>
              <div className="grid grid-cols-3 gap-6">
                {recommendations.map((plant, index) => (
                  <div key={index} className="card">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">🌿</div>
                      <h3 className="font-semibold">{plant.Plant_Name}</h3>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: getPollutionColor(pollutionLevel) + '20',
                          color: getPollutionColor(pollutionLevel)
                        }}
                      >
                        {plant.Pollution_Tolerance?.toUpperCase()} TOLERANCE
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Scientific name: {plant.Scientific_Name}
                    </p>
                    <div className="mb-4">
                      <p className="text-sm"><strong>Type:</strong> {plant.Plant_Type}</p>
                      <p className="text-sm"><strong>Maintenance:</strong> {plant.Maintenance}</p>
                      <p className="text-sm"><strong>APTI Score:</strong> {plant.APTI}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Best for:</p>
                      <p className="text-sm text-gray-600">{plant.Soil_Type} soil</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Additional Resources</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <SoilRecommendations />
            <div className="card">
              <h3 className="mb-4">📊 Dataset Information</h3>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>Plant Database:</strong> {plantData.length} species</p>
                <p className="mb-2"><strong>Pollution Data:</strong> Real-time AQI monitoring</p>
                <p className="mb-2"><strong>Soil Types:</strong> 9 different soil categories</p>
                <p><strong>Data Sources:</strong> Environmental monitoring stations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Dashboard;
