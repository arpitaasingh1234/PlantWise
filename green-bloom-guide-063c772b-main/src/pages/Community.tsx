import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommunityCard from '@/components/CommunityCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { CommunityTip } from '@/data/plants';

const Community = () => {
  const { user } = useAuth();
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [newTip, setNewTip] = useState('');
  const [newPlant, setNewPlant] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    const { data, error } = await supabase
      .from('community_tips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tips:', error);
      return;
    }

    const mapped: CommunityTip[] = (data || []).map(t => ({
      id: t.id,
      author: t.author_name,
      avatar: '🌱',
      location: 'Community',
      tip: t.tip,
      plantName: t.plant_name,
      likes: t.likes,
      date: new Date(t.created_at).toLocaleDateString(),
    }));
    setTips(mapped);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTip.trim() || !newPlant.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!user) return;

    const { error } = await supabase.from('community_tips').insert({
      user_id: user.id,
      author_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
      tip: newTip.trim(),
      plant_name: newPlant.trim(),
    });

    if (error) {
      toast.error('Failed to share tip');
      console.error(error);
      return;
    }

    setNewTip('');
    setNewPlant('');
    toast.success('Tip shared with the community! 🌿');
    fetchTips();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">Community</h1>
            </div>
            <p className="text-muted-foreground">
              Share your planting experiences and learn from others
            </p>
          </motion.div>

          {/* New tip form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="eco-card p-5 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Share a Tip</h3>
            </div>
            <textarea
              value={newTip}
              onChange={(e) => setNewTip(e.target.value)}
              placeholder="What worked for you? Share your planting experience..."
              className="eco-input w-full h-24 resize-none mb-3"
              maxLength={500}
            />
            <div className="flex gap-3">
              <input
                value={newPlant}
                onChange={(e) => setNewPlant(e.target.value)}
                placeholder="Plant name"
                className="eco-input flex-1"
                maxLength={50}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl eco-gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
                Share
              </button>
            </div>
          </motion.form>

          {/* Community tips */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading tips...</div>
            ) : tips.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No tips yet. Be the first to share!</div>
            ) : (
              tips.map((tip, i) => (
                <CommunityCard key={tip.id} tip={tip} index={i} />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
