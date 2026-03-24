import { useState, useEffect } from 'react';
import { loadPollutionData, getPollutionLevel } from '../data/dataService';

function PollutionData() {
  const [pollutionData, setPollutionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load pollution data from backend API
    loadPollutionData().then(data => {
      setPollutionData(data);
      setLoading(false);
    });
  }, []);

  const getAQIColor = (aqiClass) => {
    const level = getPollutionLevel(aqiClass);
    switch(level) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="mb-4">🌍 Current Air Quality</h3>
        <div className="text-center py-4">
          <div className="loading inline-block"></div>
          <p className="text-sm text-gray-600 mt-2">Loading pollution data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4">🌍 Current Air Quality</h3>
      {pollutionData.length > 0 ? (
        <div className="space-y-4">
          {pollutionData.slice(0, 3).map((record, index) => (
            <div key={index} className="border-b pb-3 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{record.City}</span>
                <span 
                  className="badge badge-sm"
                  style={{ 
                    backgroundColor: getAQIColor(record.AQI_Class) + '20',
                    color: getAQIColor(record.AQI_Class)
                  }}
                >
                  {record.AQI_Class}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>PM2.5: {record.PM2_5} μg/m³</p>
                <p>PM10: {record.PM10} μg/m³</p>
                <p>NO2: {record.NO2} μg/m³</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-sm">No pollution data available</p>
      )}
    </div>
  );
}

export default PollutionData;
