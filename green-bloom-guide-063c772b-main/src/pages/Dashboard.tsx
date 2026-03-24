import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, AlertTriangle, Wand2, Loader2, Brain, TreePine, Zap, Heart, CloudSun, Flower2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PollutionIndicator from '@/components/PollutionIndicator';
import EnvironmentForm from '@/components/EnvironmentForm';
import PlantCard from '@/components/PlantCard';
import SoilRecommendationCard from '@/components/SoilRecommendation';
import PlantGuideWizard from '@/components/PlantGuideWizard';
import NoPlantationMessage from '@/components/NoPlantationMessage';
import AlternativeGreenSolutions from '@/components/AlternativeGreenSolutions';
import { getRecommendations, classifyAQI } from '@/utils/recommendations';
import { useSavedPlants } from '@/hooks/useSavedPlants';
import { supabase } from '@/integrations/supabase/client';
import type { PollutionLevel, SpaceType, PlantingType, Location, SunlightLevel, AreaSize } from '@/data/plants';
import type { RecommendationResult } from '@/utils/recommendations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

/* Floating decorative blobs */
const FloatingBlob = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    className={className}
  />
);

const Dashboard = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [pollutionLevel, setPollutionLevel] = useState<PollutionLevel | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const [spaceType, setSpaceType] = useState<SpaceType>('home');
  const [plantingType, setPlantingType] = useState<PlantingType>('pot');
  const [location, setLocation] = useState<Location>('indoor');
  const [sunlight, setSunlight] = useState<SunlightLevel>('partial');
  const [areaSize, setAreaSize] = useState<AreaSize>('small');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendationResult | null>(null);
  const { savedPlantNames, toggleSave } = useSavedPlants();

  const fetchAQI = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-aqi', {
        body: { lat, lng },
      });
      if (error) throw error;
      const aqiVal = data.aqi;
      const level = classifyAQI(aqiVal);
      setAqi(aqiVal);
      setPollutionLevel(level);
      setLocationName(data.city || `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`);
      setLoading(false);
      if (level === 'high') {
        toast('High pollution detected 🌿', {
          description: `AQI ${aqiVal} at ${data.city}. Pollution-resistant plants suggested.`,
        });
      } else {
        toast('Air quality loaded 🌿', {
          description: `AQI ${aqiVal} at ${data.city}. ${level === 'low' ? 'Great conditions!' : 'Moderate — choosing hardy plants.'}`,
        });
      }
    } catch {
      const fallbackAQI = Math.floor(Math.random() * 200) + 20;
      const level = classifyAQI(fallbackAQI);
      setAqi(fallbackAQI);
      setPollutionLevel(level);
      setLocationName('Estimated (API unavailable)');
      setLoading(false);
      toast('Using estimated air quality data');
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAQI(pos.coords.latitude, pos.coords.longitude),
        () => { fetchAQI(28.6139, 77.2090); setLocationName('Delhi (default)'); }
      );
    } else {
      fetchAQI(28.6139, 77.2090);
      setLocationName('Delhi (default)');
    }
  }, [fetchAQI]);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  const generateRecommendations = useCallback(async () => {
    if (!pollutionLevel) return;
    setRecsLoading(true);
    setHasGenerated(true);
    try {
      const recs = await getRecommendations({ pollutionLevel, spaceType, plantingType, location, sunlight, areaSize });
      setResults(recs);
    } catch {
      toast.error('Failed to generate recommendations.');
    } finally {
      setRecsLoading(false);
    }
  }, [pollutionLevel, spaceType, plantingType, location, sunlight, areaSize]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        toast('Space photo uploaded! 📸');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 relative overflow-hidden">
        {/* Decorative floating blobs */}
        <FloatingBlob className="absolute top-32 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" delay={0} />
        <FloatingBlob className="absolute top-96 left-0 w-48 h-48 rounded-full bg-sun/5 blur-3xl pointer-events-none" delay={2} />
        <FloatingBlob className="absolute bottom-40 right-20 w-56 h-56 rounded-full bg-sky/5 blur-3xl pointer-events-none" delay={4} />

        <div className="max-w-6xl mx-auto relative z-10">

          {/* ── Cute Hero Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-10 rounded-3xl overflow-hidden"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent to-sun-light/30" />
            <div className="absolute inset-0 eco-dots-pattern opacity-40" />

            {/* Floating emoji decorations */}
            <motion.span
              animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-6 right-12 text-4xl opacity-20 select-none"
            >🌸</motion.span>
            <motion.span
              animate={{ y: [0, -8, 0], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-8 right-32 text-3xl opacity-15 select-none"
            >🦋</motion.span>
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute top-12 left-[60%] text-2xl opacity-15 select-none"
            >✨</motion.span>

            <div className="relative z-10 p-8 md:p-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-primary/20 mb-5 shadow-sm"
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-xs font-semibold text-primary">AI-Powered Plant Magic</span>
                <Heart className="w-3 h-3 text-destructive/60 fill-destructive/60" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3"
              >
                Your Plant{' '}
                <span className="eco-text-gradient">Dashboard</span>{' '}
                <motion.span
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >🌱</motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed"
              >
                Discover perfect plants for your space — pollution-aware, AI-powered, and curated just for you 💚
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-6 flex flex-wrap gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 24px hsl(142 71% 45% / 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWizard((v) => !v)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl eco-gradient-primary text-primary-foreground font-semibold text-sm shadow-lg"
                >
                  <Wand2 className="w-4 h-4" />
                  {showWizard ? 'Close Wizard' : '✨ Plant Wizard'}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Wizard ── */}
          <AnimatePresence>
            {showWizard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="mb-8 overflow-hidden"
              >
                <PlantGuideWizard onClose={() => setShowWizard(false)} pollutionLevel={pollutionLevel} aqi={aqi} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-5"
            >
              <PollutionIndicator
                level={pollutionLevel}
                aqi={aqi}
                location={locationName}
                loading={loading}
                onRefresh={requestLocation}
              />
              <EnvironmentForm
                spaceType={spaceType}
                plantingType={plantingType}
                location={location}
                sunlight={sunlight}
                areaSize={areaSize}
                imagePreview={imagePreview}
                onSpaceTypeChange={setSpaceType}
                onPlantingTypeChange={setPlantingType}
                onLocationChange={setLocation}
                onSunlightChange={setSunlight}
                onAreaSizeChange={setAreaSize}
                onImageUpload={handleImageUpload}
              />

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 30px hsl(142 71% 45% / 0.25)' }}
                whileTap={{ scale: 0.96 }}
                onClick={generateRecommendations}
                disabled={recsLoading || !pollutionLevel}
                className="w-full relative flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl eco-gradient-primary text-primary-foreground font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {recsLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Environment…
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    🌿 Generate Recommendations
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Right: results */}
            <div className="lg:col-span-3 space-y-8">
              <AnimatePresence mode="wait">
                {!hasGenerated ? (
                  /* ── Cute Welcome State ── */
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="eco-card relative overflow-hidden"
                  >
                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-sun/5" />

                    <div className="relative z-10 p-10 md:p-14 text-center">
                      {/* Animated plant pot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="relative inline-block mb-6"
                      >
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-primary/10 flex items-center justify-center shadow-lg">
                          <motion.span
                            animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-5xl"
                          >🪴</motion.span>
                        </div>
                        {/* Floating sparkles around the pot */}
                        <motion.span
                          animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-2 -right-2 text-lg"
                        >✨</motion.span>
                        <motion.span
                          animate={{ y: [0, -6, 0], opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          className="absolute -top-1 -left-3 text-sm"
                        >💚</motion.span>
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-display text-xl md:text-2xl font-bold text-foreground mb-3"
                      >
                        Tell Us About Your Space! 🏡
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-8"
                      >
                        Fill in your environment details on the left panel and click
                        <span className="font-semibold text-primary"> Generate Recommendations</span> to receive personalized, AI-powered plant suggestions 🌟
                      </motion.p>

                      {/* Cute step indicators */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-3"
                      >
                        {[
                          { emoji: '☀️', label: 'Sunlight' },
                          { emoji: '📐', label: 'Area' },
                          { emoji: '🏠', label: 'Space' },
                          { emoji: '🪴', label: 'Planting' },
                        ].map((step, i) => (
                          <motion.div
                            key={step.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/80 border border-primary/10 cursor-default"
                          >
                            <span className="text-base">{step.emoji}</span>
                            <span className="text-xs font-semibold text-foreground">{step.label}</span>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Cute bottom decoration */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 flex justify-center gap-2"
                      >
                        {['🌻', '🌿', '🍃', '🌺', '🌵'].map((emoji, i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            className="text-lg opacity-30"
                          >{emoji}</motion.span>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>

                ) : recsLoading ? (
                  /* ── Cute Loading State ── */
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="eco-card relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
                    <div className="relative z-10 p-12 text-center">
                      <div className="relative inline-block mb-6">
                        {/* Orbiting loader */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="w-20 h-20 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center"
                        >
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-3xl"
                          >🌱</motion.span>
                        </motion.div>
                        <motion.span
                          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-1 -right-1 text-lg"
                        >🔍</motion.span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-2">
                        Finding Your Perfect Plants… 🌿
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                        Our AI is analyzing pollution data and predicting survival rates just for you!
                      </p>
                      {/* Animated progress dots */}
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3, 4].map(i => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.5, 1], backgroundColor: ['hsl(var(--muted))', 'hsl(var(--primary))', 'hsl(var(--muted))'] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2.5 h-2.5 rounded-full bg-muted"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>

                ) : results && results.noPlantation ? (
                  <motion.div
                    key="no-plantation"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <NoPlantationMessage reasons={results.noPlantationReasons} />
                  </motion.div>

                ) : results && results.recommended.length > 0 ? (
                  <motion.div
                    key="results"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    {results.noDirectPlantation && (
                      <motion.div variants={itemVariants}>
                        <AlternativeGreenSolutions reason={results.noDirectPlantationReason} />
                      </motion.div>
                    )}

                    <motion.div variants={itemVariants}>
                      <div className="flex items-center gap-3 mb-5">
                        <motion.div
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
                        >
                          <Flower2 className="w-5 h-5 text-primary" />
                        </motion.div>
                        <div>
                          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                            Recommended Plants
                            <motion.span
                              animate={{ rotate: [-5, 5, -5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >🌸</motion.span>
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            {results.recommended.length} plants matched • sorted by AI confidence
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {results.recommended.map((plant, i) => (
                          <PlantCard
                            key={plant.id}
                            plant={plant}
                            index={i}
                            isSaved={savedPlantNames.has(plant.name)}
                            onToggleSave={(name) => toggleSave(name, {
                              spaceType, plantingType, location, sunlight,
                              pollutionLevel: pollutionLevel || 'low',
                            })}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {results.avoid.length > 0 && (
                      <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="p-2 rounded-xl bg-destructive/10">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          </div>
                          <h2 className="font-display text-lg font-semibold text-foreground">
                            Plants to Avoid ⚠️
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {results.avoid.map((plant, i) => (
                            <PlantCard key={plant.id} plant={plant} index={i} variant="avoid" />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <motion.div variants={itemVariants}>
                      <SoilRecommendationCard recommendations={results.soilMix} />
                    </motion.div>
                  </motion.div>

                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="eco-card p-12 text-center"
                  >
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="inline-block text-5xl mb-4"
                    >🍂</motion.span>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">
                      No perfect matches found
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Try adjusting your environment preferences to discover more plant recommendations.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
