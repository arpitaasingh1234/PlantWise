import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, Leaf, MapPin, Sun, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { plants as allPlants } from '@/data/plants';

interface SavedRec {
  id: string;
  plant_name: string;
  space_type: string;
  planting_type: string;
  location: string;
  sunlight: string;
  pollution_level: string;
  created_at: string;
}

const MyPlants = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState<SavedRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSaved();
  }, [user]);

  const fetchSaved = async () => {
    const { data, error } = await supabase
      .from('saved_recommendations')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (!error) setSaved(data || []);
    setLoading(false);
  };

  const handleRemove = async (id: string, name: string) => {
    const { error } = await supabase.from('saved_recommendations').delete().eq('id', id);
    if (error) { toast.error('Failed to remove'); return; }
    setSaved(prev => prev.filter(s => s.id !== id));
    toast.success(`${name} removed from saved plants`);
  };

  const getPlantData = (name: string) => allPlants.find(p => p.name === name);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">My Saved Plants</h1>
            </div>
            <p className="text-muted-foreground">Your bookmarked plant recommendations</p>
          </motion.div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading saved plants...</div>
          ) : saved.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eco-card p-10 text-center">
              <Leaf className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">No saved plants yet</h3>
              <p className="text-sm text-muted-foreground">
                Go to the Dashboard and bookmark plants you like — they'll appear here!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {saved.map((rec, i) => {
                const plant = getPlantData(rec.plant_name);
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="eco-card p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-2xl flex-shrink-0">
                        {plant?.emoji || '🌱'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-base font-semibold text-foreground truncate">
                            {rec.plant_name}
                          </h3>
                          <button
                            onClick={() => handleRemove(rec.id, rec.plant_name)}
                            className="ml-auto flex-shrink-0 p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                        {plant && (
                          <p className="text-xs text-muted-foreground italic mb-2">{plant.scientificName}</p>
                        )}
                        {plant && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{plant.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 eco-badge-low">
                            <MapPin className="w-3 h-3" /> {rec.space_type}
                          </span>
                          <span className="flex items-center gap-1 eco-badge-low">
                            <Sprout className="w-3 h-3" /> {rec.planting_type}
                          </span>
                          <span className="flex items-center gap-1 eco-badge-low">
                            {rec.location === 'indoor' ? '🏠' : '☀️'} {rec.location}
                          </span>
                          <span className="flex items-center gap-1 eco-badge-low">
                            <Sun className="w-3 h-3" /> {rec.sunlight}
                          </span>
                        </div>

                        <p className="text-[10px] text-muted-foreground mt-2">
                          Saved on {new Date(rec.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyPlants;
