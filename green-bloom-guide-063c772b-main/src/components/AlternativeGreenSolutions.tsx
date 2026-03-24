import { motion } from 'framer-motion';
import { Leaf, Sprout, FlowerIcon, Shrub, Layers, Box, Fence } from 'lucide-react';

interface AlternativeGreenSolutionsProps {
  reason: string;
}

const solutions = [
  { icon: Layers, emoji: '🌿', title: 'Vertical Gardens', description: 'Wall-mounted panels with climbing plants like Money Plant or Pothos.' },
  { icon: Sprout, emoji: '🪴', title: 'Hanging Planters', description: 'Spider Plants and String of Pearls in suspended baskets save floor space.' },
  { icon: Leaf, emoji: '🌱', title: 'Wall-Mounted Plant Panels', description: 'Living walls with ferns and moss that attach directly to surfaces.' },
  { icon: FlowerIcon, emoji: '💧', title: 'Hydroponic Systems', description: 'Grow plants in water-based systems — no soil needed at all.' },
  { icon: Shrub, emoji: '🌿', title: 'Moss Walls', description: 'Preserved moss requires no soil, water, or sunlight and absorbs pollutants.' },
  { icon: Box, emoji: '📦', title: 'Portable Planter Boxes', description: 'Movable raised beds that sit on concrete or hard surfaces.' },
  { icon: Fence, emoji: '🌺', title: 'Green Balcony Railings', description: 'Railing-mounted planters filled with trailing flowers and herbs.' },
];

const AlternativeGreenSolutions = ({ reason }: AlternativeGreenSolutionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="eco-card overflow-hidden"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/30 via-accent/20 to-transparent" />
      <div className="p-6 sm:p-8">
        {/* Warning header */}
        <div className="flex items-start gap-3 mb-5 p-4 rounded-2xl bg-accent/40 border border-primary/10">
          <span className="text-2xl flex-shrink-0">🚧</span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground mb-1">
              Direct Plantation May Not Be Possible
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
          </div>
        </div>

        {/* Solutions */}
        <h4 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-primary" />
          Alternative Green Solutions
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {solutions.map((sol, i) => (
            <motion.div
              key={sol.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
              whileHover={{ y: -2 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-200"
            >
              <div className="p-2 rounded-xl bg-primary/8 flex-shrink-0">
                <sol.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{sol.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{sol.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AlternativeGreenSolutions;
