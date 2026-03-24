import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Sun, Shield, TrendingUp, Bookmark, DollarSign, Brain, ExternalLink } from 'lucide-react';
import type { Plant } from '@/data/plants';
import type { RecommendedPlant } from '@/utils/recommendations';
import { fetchWikipediaSummary } from '@/utils/wikipedia';

interface PlantCardProps {
  plant: Plant | RecommendedPlant;
  index: number;
  variant?: 'recommended' | 'avoid';
  isSaved?: boolean;
  onToggleSave?: (plantName: string) => void;
}

function isRecommendedPlant(plant: Plant | RecommendedPlant): plant is RecommendedPlant {
  return 'survivalScore' in plant;
}

const PlantCard = ({ plant, index, variant = 'recommended', isSaved, onToggleSave }: PlantCardProps) => {
  const isAvoid = variant === 'avoid';
  const scored = isRecommendedPlant(plant);

  const [wiki, setWiki] = useState<{ thumbnail?: string; summary?: string; url?: string }>({});

  useEffect(() => {
    if (!isAvoid) {
      fetchWikipediaSummary(plant.scientificName || plant.name).then(setWiki);
    }
  }, [plant.scientificName, plant.name, isAvoid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: isAvoid ? 1 : 1.015, y: isAvoid ? 0 : -2 }}
      className={`eco-card overflow-hidden ${isAvoid ? 'border-destructive/20 opacity-80' : ''}`}
    >
      {/* Top accent stripe */}
      {!isAvoid && (
        <div className="h-1 w-full eco-gradient-primary" />
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Plant emoji or Wikipedia thumbnail */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden ${
              isAvoid ? 'bg-destructive/8' : 'bg-accent'
            }`}
          >
            {wiki.thumbnail && !isAvoid ? (
              <img
                src={wiki.thumbnail}
                alt={plant.name}
                className="w-full h-full object-cover"
              />
            ) : (plant as Plant).imageUrl && !isAvoid ? (
              <img
                src={(plant as Plant).imageUrl}
                alt={plant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              plant.emoji
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-base font-bold text-foreground truncate">
                {plant.name}
              </h3>
              {isAvoid && (
                <span className="eco-badge-high text-[10px]">Avoid</span>
              )}
              {!isAvoid && onToggleSave && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleSave(plant.name)}
                  className="ml-auto flex-shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors"
                  title={isSaved ? 'Remove bookmark' : 'Bookmark plant'}
                >
                  <Bookmark
                    className={`w-4 h-4 transition-colors ${
                      isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </motion.button>
              )}
            </div>
            <p className="text-xs text-muted-foreground italic mb-2">{plant.scientificName}</p>

            {/* ML explanation */}
            {scored && plant.explanation && (
              <div className="flex items-start gap-1.5 mb-3 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                <Brain className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">{plant.explanation}</p>
              </div>
            )}

            {/* Wikipedia summary */}
            {wiki.summary && !isAvoid && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {wiki.summary}
              </p>
            )}

            {!wiki.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {plant.description}
              </p>
            )}

            {!isAvoid && (
              <>
                {/* Stats row */}
                <div className="flex flex-wrap gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                    <Droplets className="w-3 h-3 text-sky" />
                    {plant.wateringFrequency}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                    <Sun className="w-3 h-3 text-sun" />
                    {plant.sunlight.join(' / ')}
                  </div>
                  {scored && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                      <DollarSign className="w-3 h-3 text-earth" />
                      {plant.maintenanceCost}
                    </div>
                  )}
                </div>

                {/* Scores row */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground capitalize">
                      {plant.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {scored ? `${plant.survivalScore}%` : `${plant.survivalRate}%`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {scored ? 'ML predicted' : 'survival'}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                {plant.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {plant.benefits.slice(0, 3).map(benefit => (
                      <span key={benefit} className="eco-badge-low text-[10px]">
                        {benefit}
                      </span>
                    ))}
                  </div>
                )}

                {/* Wikipedia link */}
                {wiki.url && (
                  <a
                    href={wiki.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Read more on Wikipedia
                  </a>
                )}
              </>
            )}

            {isAvoid && plant.avoidWhen && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {plant.avoidWhen.map(reason => (
                  <span key={reason} className="eco-badge-high text-[10px]">
                    ⚠ {reason}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlantCard;
