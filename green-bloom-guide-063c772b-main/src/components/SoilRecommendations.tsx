import { useState, useEffect } from 'react';
import { loadSoilData } from '../data/dataService';

function SoilRecommendations() {
  const [soilData, setSoilData] = useState([]);
  const [selectedSoil, setSelectedSoil] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load soil data from backend API
    loadSoilData().then(data => {
      setSoilData(data);
      setLoading(false);
    });
  }, []);

  const selectedSoilData = soilData.find(s => s.Soil_Type === selectedSoil);

  if (loading) {
    return (
      <div className="card">
        <h3 className="mb-4">🌱 Soil Recommendations</h3>
        <div className="text-center py-4">
          <div className="loading inline-block"></div>
          <p className="text-sm text-gray-600 mt-2">Loading soil data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4">🌱 Soil Recommendations</h3>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium text-sm">Select Soil Type:</label>
        <select 
          className="input text-sm"
          value={selectedSoil}
          onChange={(e) => setSelectedSoil(e.target.value)}
        >
          <option value="">Choose soil type</option>
          {soilData.map((soil, index) => (
            <option key={index} value={soil.Soil_Type}>
              {soil.Soil_Type}
            </option>
          ))}
        </select>
      </div>

      {selectedSoilData ? (
        <div className="text-sm">
          <div className="mb-3">
            <p className="font-medium mb-1">Average pH:</p>
            <p className="text-gray-600">{selectedSoilData.Average_pH}</p>
          </div>
          
          <div className="mb-3">
            <p className="font-medium mb-1">Suitable Plants:</p>
            <div className="flex flex-wrap gap-1">
              {selectedSoilData.Suitable_Plants.split(';').map((plant, index) => (
                <span key={index} className="badge badge-xs">
                  {plant.trim()}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-1">Improvement Suggestions:</p>
            <p className="text-gray-600">{selectedSoilData.Improvement_Suggestion}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">Select a soil type to see recommendations</p>
      )}
    </div>
  );
}

export default SoilRecommendations;
