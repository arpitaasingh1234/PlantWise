import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    emoji: '📍',
    title: 'Share Your Location',
    description: 'We detect your local air quality index automatically using real-time data.',
    accent: 'from-sky/20 to-sky/5',
    connector: '🌬️',
  },
  {
    number: '02',
    emoji: '🏡',
    title: 'Describe Your Space',
    description: 'Tell us about your sunlight, space type, and planting preferences.',
    accent: 'from-sun/20 to-sun/5',
    connector: '☀️',
  },
  {
    number: '03',
    emoji: '🤖',
    title: 'AI Analyzes Everything',
    description: 'Our smart engine matches your conditions to the perfect plants.',
    accent: 'from-primary/20 to-primary/5',
    connector: '🌱',
  },
  {
    number: '04',
    emoji: '🌿',
    title: 'Get Your Green Plan',
    description: 'Receive curated plant picks with soil mixes, care tips, and more!',
    accent: 'from-leaf/20 to-leaf/5',
    connector: null,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background blobs */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-16 left-10 w-56 h-56 rounded-full bg-primary/3 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
        className="absolute bottom-16 right-10 w-48 h-48 rounded-full bg-sun/3 blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/80 border border-primary/10 mb-5"
          >
            <span className="text-base">🪄</span>
            <span className="text-xs font-semibold text-primary">Simple & Easy</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4"
          >
            How It Works{' '}
            <motion.span
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >✨</motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-md mx-auto"
          >
            Four simple steps to your perfect green space 🌈
          </motion.p>
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="max-w-4xl mx-auto"
        >
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              <motion.div
                variants={itemVariants}
                className="flex items-start gap-6 sm:gap-8 mb-4"
              >
                {/* Number + Line */}
                <div className="flex flex-col items-center shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.accent} border border-border/40 flex items-center justify-center shadow-md relative`}
                  >
                    <span className="text-3xl">{step.emoji}</span>
                    <span className="absolute -top-2 -left-2 text-[10px] font-bold text-primary bg-card rounded-full w-6 h-6 flex items-center justify-center border border-primary/20 shadow-sm">
                      {step.number}
                    </span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="pt-2 pb-6">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Connector */}
              {step.connector && (
                <div className="flex items-center ml-8 mb-4">
                  <div className="w-px h-8 bg-border/50 ml-[1.45rem]" />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="text-base ml-2 opacity-40"
                  >
                    {step.connector}
                  </motion.span>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Bottom flourish */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex justify-center gap-3"
        >
          {['🌱', '→', '🌿', '→', '🌳'].map((item, i) => (
            <motion.span
              key={i}
              animate={item !== '→' ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className={`text-lg ${item === '→' ? 'text-muted-foreground/40' : 'opacity-40'}`}
            >
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
