import { motion } from 'framer-motion';

const features = [
  {
    emoji: '🌬️',
    title: 'Auto Pollution Detection',
    description: 'Automatically detects air quality from your location and suggests pollution-resistant plants.',
    accent: 'from-sky/20 to-sky/5',
  },
  {
    emoji: '📸',
    title: 'Space Analysis',
    description: 'Upload a photo of your space to get recommendations tailored to your environment.',
    accent: 'from-sun/20 to-sun/5',
  },
  {
    emoji: '🌱',
    title: 'Smart Recommendations',
    description: 'AI-powered plant suggestions based on pollution, space, sunlight, and soil conditions.',
    accent: 'from-primary/20 to-primary/5',
  },
  {
    emoji: '💧',
    title: 'Soil Mix Guides',
    description: 'Custom soil recipes with compost, vermicompost, biochar, and neem khali.',
    accent: 'from-sky/20 to-sky/5',
  },
  {
    emoji: '🤝',
    title: 'Community Tips',
    description: 'Learn from fellow plant enthusiasts what works best in your area.',
    accent: 'from-sun/20 to-sun/5',
  },
  {
    emoji: '🔔',
    title: 'Care Reminders',
    description: 'Friendly notifications for watering, soil improvement, and seasonal care.',
    accent: 'from-primary/20 to-primary/5',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 right-10 w-48 h-48 rounded-full bg-primary/3 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-sun/3 blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/80 border border-primary/10 mb-5"
          >
            <span className="text-base">✨</span>
            <span className="text-xs font-semibold text-primary">Features You'll Love</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4"
          >
            How PlantWise Helps You{' '}
            <motion.span
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >🌿</motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-md mx-auto"
          >
            Everything you need to make the right plantation decisions for your space 💚
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="eco-card overflow-hidden group cursor-default"
            >
              {/* Top gradient accent */}
              <div className={`h-1 w-full bg-gradient-to-r ${feature.accent}`} />

              <div className="p-6">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 shadow-sm"
                >
                  <span className="text-2xl">{feature.emoji}</span>
                </motion.div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="flex justify-center gap-2 mb-4">
            {['🌻', '🌿', '🍃', '🌺', '🌵'].map((emoji, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                className="text-lg opacity-30"
              >{emoji}</motion.span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            And many more features coming soon… 🚀
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
