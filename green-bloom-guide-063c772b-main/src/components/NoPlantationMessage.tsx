import { motion } from 'framer-motion';
import { AlertTriangle, Wind, Droplets, Leaf } from 'lucide-react';

interface NoPlantationMessageProps {
  reasons: string[];
}

const alternatives = [
  {
    icon: Wind,
    title: 'Air Purifiers',
    description: 'Consider HEPA air purifiers to improve indoor air quality without plants.',
    emoji: '💨',
  },
  {
    icon: Droplets,
    title: 'Better Ventilation',
    description: 'Cross-ventilation and exhaust fans can significantly reduce indoor pollutants.',
    emoji: '🪟',
  },
  {
    icon: Leaf,
    title: 'Moss Walls',
    description: 'Preserved moss walls need no soil, water, or sunlight and still absorb pollutants.',
    emoji: '🌿',
  },
];

const NoPlantationMessage = ({ reasons }: NoPlantationMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="eco-card overflow-hidden"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-destructive/30 to-transparent" />

      <div className="p-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex"
        >
          <div className="w-16 h-16 rounded-2xl bg-destructive/8 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </motion.div>

        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Plantation Not Feasible
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your current environment settings make plant growth unlikely:
          </p>
          <div className="space-y-2 inline-flex flex-col items-start">
            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 rounded-xl px-4 py-2.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {reason}
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-bold text-foreground mb-4">
            Try These Alternatives
          </h4>
          <div className="grid sm:grid-cols-3 gap-3">
            {alternatives.map((alt, i) => (
              <motion.div
                key={alt.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -3 }}
                className="p-4 rounded-2xl bg-accent/40 border border-border text-left"
              >
                <span className="text-2xl mb-2 block">{alt.emoji}</span>
                <h5 className="text-sm font-bold text-foreground mb-1">{alt.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{alt.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NoPlantationMessage;
