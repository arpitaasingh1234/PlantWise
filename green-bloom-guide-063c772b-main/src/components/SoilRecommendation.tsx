import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, ChevronDown, Droplets, Layers, Leaf } from 'lucide-react';
import type { SoilRecommendation as SoilRec } from '@/data/plants';

interface SoilRecommendationProps {
  recommendations: SoilRec[];
}

interface SoilDetail {
  composition: string;
  drainage: string;
  waterRetention: string;
  whySuitable: string;
  wateringGuide: string;
  bestPlants: string[];
}

const soilDetails: Record<string, SoilDetail> = {
  'Urban Pollution Fighter Mix': {
    composition: 'Garden soil (40%), compost (25%), biochar (15%), neem khali (10%), perlite (10%)',
    drainage: 'Moderate — biochar and perlite improve aeration while retaining nutrients',
    waterRetention: 'High — compost and biochar hold moisture for extended periods',
    whySuitable: 'Biochar absorbs heavy metals and toxins from polluted environments while neem khali provides natural pest resistance.',
    wateringGuide: 'Water every 3–4 days. Biochar retains moisture well so avoid overwatering.',
    bestPlants: ['Neem', 'Peepal Tree', 'Tulsi', 'Indian Jasmine'],
  },
  'Indoor Purifier Mix': {
    composition: 'Potting soil (40%), vermicompost (25%), perlite (20%), coco peat (15%)',
    drainage: 'Excellent — perlite ensures fast drainage to prevent root rot',
    waterRetention: 'Moderate — coco peat retains just enough moisture for indoor plants',
    whySuitable: 'Lightweight and clean for indoor use. Vermicompost provides steady nutrients without odor.',
    wateringGuide: 'Water once a week. Let the top inch dry out between waterings.',
    bestPlants: ['Snake Plant', 'Money Plant', 'Peace Lily', 'Rubber Plant', 'Areca Palm'],
  },
  'Balcony Garden Mix': {
    composition: 'Potting mix (35%), compost (25%), neem khali (15%), sand (15%), bone meal (10%)',
    drainage: 'Good — sand improves drainage in containers',
    waterRetention: 'Moderate — compost balances moisture retention with drainage',
    whySuitable: 'Nutrient-rich and well-balanced for container gardening. Bone meal promotes flowering.',
    wateringGuide: 'Water 2–3 times per week. Containers dry out faster than ground soil.',
    bestPlants: ['Tulsi', 'Indian Jasmine', 'Spider Plant', 'Aloe Vera'],
  },
};

// Fallback for unknown soil types
const defaultDetail: SoilDetail = {
  composition: 'Balanced mix of organic and inorganic components',
  drainage: 'Moderate drainage suitable for most plants',
  waterRetention: 'Balanced water retention',
  whySuitable: 'General-purpose mix suitable for a variety of plants.',
  wateringGuide: 'Water every 3–5 days depending on plant type.',
  bestPlants: ['Snake Plant', 'Money Plant', 'Aloe Vera'],
};

const SoilRecommendationCard = ({ recommendations }: SoilRecommendationProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sprout className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Soil Mix Recommendations</h3>
          <p className="text-xs text-muted-foreground">Click a soil mix to see detailed information</p>
        </div>
      </div>
      {recommendations.map((soil, i) => {
        const isExpanded = expandedIndex === i;
        const detail = soilDetails[soil.name] || defaultDetail;

        return (
          <motion.div
            key={soil.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="eco-card overflow-hidden cursor-pointer"
            onClick={() => setExpandedIndex(isExpanded ? null : i)}
          >
            <div className="h-1 w-full bg-gradient-to-r from-primary/15 to-transparent" />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{soil.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-foreground">{soil.name}</h4>
                  <p className="text-xs text-muted-foreground">{soil.description}</p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </div>

              {/* Ingredients badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {soil.ingredients.map(ingredient => (
                  <span key={ingredient} className="eco-badge-low text-[10px]">
                    🌿 {ingredient}
                  </span>
                ))}
              </div>

              {/* Expandable detail panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 pt-5 border-t border-border space-y-4">
                      {/* Composition */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/40">
                        <Layers className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground mb-0.5">Soil Composition</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{detail.composition}</p>
                        </div>
                      </div>

                      {/* Drainage & Water Retention */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-accent/40">
                          <p className="text-xs font-bold text-foreground mb-0.5">💧 Drainage</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{detail.drainage}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-accent/40">
                          <p className="text-xs font-bold text-foreground mb-0.5">🫧 Water Retention</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{detail.waterRetention}</p>
                        </div>
                      </div>

                      {/* Why suitable */}
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs font-bold text-foreground mb-0.5">🌱 Why This Mix?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{detail.whySuitable}</p>
                      </div>

                      {/* Watering Guide */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/40">
                        <Droplets className="w-4 h-4 text-sky mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground mb-0.5">Watering Guide</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{detail.wateringGuide}</p>
                        </div>
                      </div>

                      {/* Best Plants */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Leaf className="w-3.5 h-3.5 text-primary" />
                          <p className="text-xs font-bold text-foreground">Best Plants for This Soil</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {detail.bestPlants.map(p => (
                            <span key={p} className="eco-badge-low text-[10px]">🌿 {p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SoilRecommendationCard;
