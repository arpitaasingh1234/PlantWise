import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useSavedPlants() {
  const { user } = useAuth();
  const [savedPlantNames, setSavedPlantNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!user) { setSavedPlantNames(new Set()); setLoading(false); return; }
    const { data } = await supabase
      .from('saved_recommendations')
      .select('plant_name')
      .eq('user_id', user.id);
    setSavedPlantNames(new Set((data || []).map(r => r.plant_name)));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const toggleSave = useCallback(async (plantName: string, context: {
    spaceType: string; plantingType: string; location: string; sunlight: string; pollutionLevel: string;
  }) => {
    if (!user) return;

    if (savedPlantNames.has(plantName)) {
      const { error } = await supabase
        .from('saved_recommendations')
        .delete()
        .eq('user_id', user.id)
        .eq('plant_name', plantName);
      if (error) { toast.error('Failed to remove bookmark'); return; }
      setSavedPlantNames(prev => { const n = new Set(prev); n.delete(plantName); return n; });
      toast.success(`${plantName} removed from saved plants`);
    } else {
      const { error } = await supabase.from('saved_recommendations').insert({
        user_id: user.id,
        plant_name: plantName,
        space_type: context.spaceType,
        planting_type: context.plantingType,
        location: context.location,
        sunlight: context.sunlight,
        pollution_level: context.pollutionLevel,
      });
      if (error) { toast.error('Failed to save plant'); return; }
      setSavedPlantNames(prev => new Set(prev).add(plantName));
      toast.success(`${plantName} saved to your collection! 🌱`);
    }
  }, [user, savedPlantNames]);

  return { savedPlantNames, loading, toggleSave, refetch: fetchSaved };
}
