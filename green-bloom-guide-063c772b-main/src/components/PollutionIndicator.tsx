import { motion } from 'framer-motion';
import { Wind, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { getPollutionMessage } from '@/utils/recommendations';
import type { PollutionLevel } from '@/data/plants';

interface PollutionIndicatorProps {
  level: PollutionLevel | null;
  aqi: number | null;
  location: string | null;
  loading: boolean;
  onRefresh?: () => void;
}

const aqiEmoji = (level: PollutionLevel) => {
  switch (level) {
    case 'low': return '🌿';
    case 'medium': return '🌤️';
    case 'high': return '🏭';
  }
};

const aqiGradient = (level: PollutionLevel) => {
  switch (level) {
    case 'low': return 'from-primary/20 via-primary/10 to-transparent';
    case 'medium': return 'from-sun/20 via-sun/10 to-transparent';
    case 'high': return 'from-destructive/20 via-destructive/10 to-transparent';
  }
};

const PollutionIndicator = ({ level, aqi, location, loading, onRefresh }: PollutionIndicatorProps) => {
  if (loading) {
    return (
      <div className="eco-card p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Detecting air quality… 🌬️</span>
      </div>
    );
  }

  if (!level || aqi === null) {
    return (
      <div className="eco-card p-6 text-center">
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block text-3xl mb-3"
        >🌬️</motion.span>
        <p className="text-sm text-muted-foreground">Enable location to detect air quality</p>
      </div>
    );
  }

  const message = getPollutionMessage(level);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="eco-card overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Gradient accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${aqiGradient(level)}`} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-2 rounded-xl bg-primary/10"
            >
              <Wind className="w-4 h-4 text-primary" />
            </motion.div>
            <h3 className="font-display text-sm font-bold text-foreground">Air Quality Index</h3>
          </div>
          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRefresh}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-5 mb-4">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative"
            >
              <span className="text-4xl font-bold text-foreground tabular-nums">{aqi}</span>
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 -right-5 text-lg"
              >{aqiEmoji(level)}</motion.span>
            </motion.div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">AQI</div>
          </div>
          <div className="flex-1">
            <span className={message.color}>
              {message.icon} {level.charAt(0).toUpperCase() + level.slice(1)} Pollution
            </span>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{message.text}</p>
          </div>
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-3 border-t border-border">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PollutionIndicator;
