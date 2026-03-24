import { motion } from 'framer-motion';
import { Heart, MapPin } from 'lucide-react';
import type { CommunityTip } from '@/data/plants';

interface CommunityCardProps {
  tip: CommunityTip;
  index: number;
}

const CommunityCard = ({ tip, index }: CommunityCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="eco-card-hover p-5"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-lg flex-shrink-0">
          {tip.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">{tip.author}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {tip.location}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{tip.date}</span>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-3">{tip.tip}</p>

      <div className="flex items-center justify-between">
        <span className="eco-badge-low text-[10px]">🌱 {tip.plantName}</span>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-3.5 h-3.5" />
          {tip.likes}
        </button>
      </div>
    </motion.div>
  );
};

export default CommunityCard;
