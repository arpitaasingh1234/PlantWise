import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

const FloatingEmoji = ({ emoji, className, delay = 0, duration = 4 }: { emoji: string; className: string; delay?: number; duration?: number }) => (
  <motion.span
    animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
    transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    className={`absolute select-none pointer-events-none ${className}`}
  >
    {emoji}
  </motion.span>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Lush green garden" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/75 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-background/40 to-background" />
      </div>

      {/* Floating decorative blobs */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-24 right-16 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        className="absolute bottom-32 left-10 w-56 h-56 rounded-full bg-sun/5 blur-3xl pointer-events-none"
      />

      {/* Floating emojis scattered around */}
      <FloatingEmoji emoji="🌸" className="top-28 left-[15%] text-3xl opacity-20" delay={0} />
      <FloatingEmoji emoji="🦋" className="top-36 right-[20%] text-2xl opacity-15" delay={1} duration={5} />
      <FloatingEmoji emoji="✨" className="top-[45%] left-[8%] text-xl opacity-20" delay={0.5} duration={3} />
      <FloatingEmoji emoji="🌿" className="bottom-[30%] right-[12%] text-2xl opacity-15" delay={2} duration={4.5} />
      <FloatingEmoji emoji="🌻" className="bottom-[25%] left-[22%] text-xl opacity-10" delay={1.5} />
      <FloatingEmoji emoji="💚" className="top-[30%] right-[30%] text-lg opacity-15" delay={0.8} duration={3.5} />
      <FloatingEmoji emoji="🍃" className="top-20 left-[45%] text-2xl opacity-10" delay={3} duration={6} />

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Cute floating icon badges */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { emoji: '🌱', bg: 'bg-accent', delay: 0 },
              { emoji: '☀️', bg: 'bg-sun-light', delay: 0.4 },
              { emoji: '🌬️', bg: 'bg-sky/10', delay: 0.8 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2 + item.delay, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: item.delay }}
                  className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shadow-lg border border-border/30`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                </motion.div>
                {i === 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 text-xs"
                  >✨</motion.span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-primary/20 mb-6 shadow-sm"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-xs font-semibold text-primary">AI-Powered Plant Companion</span>
            <Heart className="w-3 h-3 text-destructive/60 fill-destructive/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Plant Smarter,{' '}
            <span className="eco-text-gradient">Breathe Better</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Get personalized plant recommendations based on your air quality, space, and sunlight.
            Help your environment — one plant at a time 💚
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 8px 30px hsl(142 71% 45% / 0.3)' }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/dashboard"
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg overflow-hidden group"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-2">
                  🌿 Get Recommendations
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/community"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border text-foreground font-semibold text-lg hover:bg-muted transition-all duration-300 shadow-sm"
              >
                🤝 Join Community
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Cute Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {[
            { value: '12+', label: 'Plant Species', emoji: '🪴' },
            { value: 'Real-time', label: 'AQI Data', emoji: '📡' },
            { value: 'Smart', label: 'Soil Mixes', emoji: '🌍' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.15, type: 'spring' }}
              whileHover={{ y: -3, scale: 1.05 }}
              className="text-center p-3 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/30"
            >
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                className="inline-block text-lg mb-1"
              >{stat.emoji}</motion.span>
              <div className="text-xl sm:text-2xl font-bold eco-text-gradient">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom floating plant row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-12 flex justify-center gap-3"
        >
          {['🌻', '🌿', '🍃', '🌺', '🌵', '🪻', '🌼'].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25 }}
              className="text-xl opacity-25"
            >{emoji}</motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
