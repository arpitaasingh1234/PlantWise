import { useState } from 'react';
import { addNewPlant } from '@/data/plants';
import { toast } from 'sonner';

interface AddPlantFormProps {
  onSuccess?: () => void;
}

export function AddPlantForm({ onSuccess }: AddPlantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    place: 'home',
    indoorOutdoor: 'indoor',
    sunlight: 'partial',
    soil: 'soil',
    area: 'medium',
    pollutionTolerance: 'medium',
    maintenance: 'medium',
    watering: 'weekly',
    plantingMethod: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await addNewPlant(formData);
      
      if (result.success) {
        toast.success(`Plant "${formData.name}" added successfully!`);
        // Reset form
        setFormData({
          name: '',
          place: 'home',
          indoorOutdoor: 'indoor',
          sunlight: 'partial',
          soil: 'soil',
          area: 'medium',
          pollutionTolerance: 'medium',
          maintenance: 'medium',
          watering: 'weekly',
          plantingMethod: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.message || 'Failed to add plant');
      }
    } catch (error) {
      toast.error('An error occurred while adding the plant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Add New Plant to Community</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plant Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Rose Plant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Place *
          </label>
          <select
            value={formData.place}
            onChange={(e) => handleChange('place', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="balcony">Balcony</option>
            <option value="open_ground">Open Ground</option>
            <option value="roadside">Roadside</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indoor/Outdoor *
          </label>
          <select
            value={formData.indoorOutdoor}
            onChange={(e) => handleChange('indoorOutdoor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sunlight *
          </label>
          <select
            value={formData.sunlight}
            onChange={(e) => handleChange('sunlight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="low">Low</option>
            <option value="partial">Partial</option>
            <option value="full">Full</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Soil Type *
          </label>
          <select
            value={formData.soil}
            onChange={(e) => handleChange('soil', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="soil">Soil</option>
            <option value="pot">Pot</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area Size *
          </label>
          <select
            value={formData.area}
            onChange={(e) => handleChange('area', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="very_small">Very Small</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pollution Tolerance *
          </label>
          <select
            value={formData.pollutionTolerance}
            onChange={(e) => handleChange('pollutionTolerance', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maintenance Level *
          </label>
          <select
            value={formData.maintenance}
            onChange={(e) => handleChange('maintenance', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Watering Frequency *
          </label>
          <select
            value={formData.watering}
            onChange={(e) => handleChange('watering', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planting Method (Optional)
          </label>
          <input
            type="text"
            value={formData.plantingMethod}
            onChange={(e) => handleChange('plantingMethod', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Use well-draining soil"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.name}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding Plant...' : 'Add Plant'}
        </button>
      </form>
    </div>
  );
}
