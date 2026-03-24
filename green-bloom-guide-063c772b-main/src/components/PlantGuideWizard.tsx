import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudSun, Sunrise, Upload, ArrowRight, ArrowLeft, Sparkles, TreePine, Home, Trees, AlertTriangle, Leaf, Wind, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import PlantCard from '@/components/PlantCard';
import { plants } from '@/data/plants';
import type { Location, SunlightLevel, Plant, PollutionLevel, AreaSize } from '@/data/plants';
import { useSavedPlants } from '@/hooks/useSavedPlants';

type WizardStep = 'welcome' | 'location' | 'sunlight' | 'area' | 'photo' | 'results';

const motivationalQuotes = [
  "Hi Plant Lover 🌱 Let's find the perfect plant for your space!",
  "Every great garden starts with a single seed 🌿",
  "Your green journey begins here 🌻",
];

const fadeSlide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
};

// ── Confetti ──
const CONFETTI_COLORS = [
  'hsl(142, 60%, 45%)',
  'hsl(130, 50%, 40%)',
  'hsl(45, 90%, 60%)',
  'hsl(200, 50%, 70%)',
  'hsl(340, 60%, 65%)',
  'hsl(160, 40%, 50%)',
];

const ConfettiPiece = ({ index }: { index: number }) => {
  const left = useRef(Math.random() * 100).current;
  const delay = useRef(Math.random() * 0.5).current;
  const duration = useRef(1.5 + Math.random() * 1.5).current;
  const rotation = useRef(Math.random() * 720 - 360).current;
  const size = useRef(6 + Math.random() * 6).current;
  const xDrift = useRef((Math.random() - 0.5) * 150).current;
  const yEnd = useRef(200 + Math.random() * 200).current;
  const shape = index % 3;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x: 0, rotate: 0, scale: 1 }}
      animate={{ opacity: [1, 1, 0], y: [0, yEnd], x: [0, xDrift], rotate: rotation, scale: [1, 0.5] }}
      transition={{ duration, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: -10,
        width: shape === 2 ? size * 1.5 : size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 1 ? '50%' : shape === 2 ? 2 : 1,
        pointerEvents: 'none' as const,
        zIndex: 50,
      }}
    />
  );
};

const Confetti = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 40 }, (_, i) => (
      <ConfettiPiece key={i} index={i} />
    ))}
  </div>
);

// ── High-pollution plant suggestions ──
const highPollutionTips = [
  { emoji: '🌿', title: 'Indoor Air-Purifying Plants', description: 'Snake Plant, Spider Plant, and Money Plant thrive indoors and clean the air.' },
  { emoji: '🌱', title: 'Vertical Wall Planters', description: 'Maximize small spaces with wall-mounted planters filled with pothos or ferns.' },
  { emoji: '🪴', title: 'Hanging Plants', description: 'Spider Plants and String of Pearls work beautifully in hanging baskets.' },
  { emoji: '🌵', title: 'Small Desk Plants', description: 'Succulents, Aloe Vera, or mini Snake Plants fit on any desk or shelf.' },
];

const areaSizeLabels: Record<AreaSize, string> = {
  'very-small': 'very small',
  'small': 'small balcony',
  'medium': 'medium garden',
  'large': 'large open',
};

const PREFS_KEY = 'plantwise-wizard-prefs';

interface PlantGuideWizardProps {
  onClose: () => void;
  pollutionLevel?: PollutionLevel | null;
  aqi?: number | null;
}

const PlantGuideWizard = ({ onClose, pollutionLevel, aqi }: PlantGuideWizardProps) => {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch { return {}; }
  })();

  const [step, setStep] = useState<WizardStep>('welcome');
  const [showConfetti, setShowConfetti] = useState(false);
  const [location, setLocation] = useState<Location | null>(saved.location || null);
  const [sunlight, setSunlight] = useState<SunlightLevel | null>(saved.sunlight || null);
  const [areaSize, setAreaSize] = useState<AreaSize | null>(saved.areaSize || null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Plant[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { savedPlantNames, toggleSave } = useSavedPlants();

  const quoteIndex = useRef(Math.floor(Math.random() * motivationalQuotes.length)).current;

  const isHighPollution = pollutionLevel === 'high';

  // Persist preferences
  useEffect(() => {
    const prefs: Record<string, string> = {};
    if (location) prefs.location = location;
    if (sunlight) prefs.sunlight = sunlight;
    if (areaSize) prefs.areaSize = areaSize;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [location, sunlight, areaSize]);

  const generateResults = useCallback(() => {
    let filtered = plants.filter((p) => {
      const fitsLocation = location ? p.locations.includes(location) : true;
      const fitsSunlight = sunlight ? p.sunlight.includes(sunlight) : true;
      const fitsArea = areaSize ? p.areaSizes.includes(areaSize) : true;
      return fitsLocation && fitsSunlight && fitsArea;
    });

    // For high pollution, prioritize air-purifying and pollution-tolerant plants
    if (isHighPollution) {
      filtered = filtered.filter(p => p.pollutionTolerance.includes('high') || p.airPurifying);
      filtered.sort((a, b) => {
        const scoreA = (a.airPurifying ? 20 : 0) + a.survivalRate;
        const scoreB = (b.airPurifying ? 20 : 0) + b.survivalRate;
        return scoreB - scoreA;
      });
    } else {
      filtered.sort((a, b) => b.survivalRate - a.survivalRate);
    }

    setResults(filtered.slice(0, 6));
  }, [location, sunlight, areaSize, isHighPollution]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      toast('Photo uploaded! 📸', { description: "Great — we'll suggest plants that suit your space." });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const flow: WizardStep[] = ['welcome', 'location', 'sunlight', 'area', 'photo', 'results'];
  const totalSteps = 4; // location, sunlight, area, photo

  const goNext = () => {
    const idx = flow.indexOf(step);
    if (idx < flow.length - 1) {
      if (flow[idx + 1] === 'results') {
        generateResults();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
      setStep(flow[idx + 1]);
    }
  };

  const goBack = () => {
    const idx = flow.indexOf(step);
    if (idx > 0) setStep(flow[idx - 1]);
  };

  const stepIndex = flow.indexOf(step);
  const canNext =
    step === 'welcome' ||
    (step === 'location' && location) ||
    (step === 'sunlight' && sunlight) ||
    (step === 'area' && areaSize) ||
    step === 'photo';

  const stepNumber = step === 'location' ? 1 : step === 'sunlight' ? 2 : step === 'area' ? 3 : step === 'photo' ? 4 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="eco-card overflow-hidden"
    >
      {/* Progress bar */}
      {step !== 'welcome' && (
        <div className="h-1.5 bg-muted">
          <motion.div
            className="h-full rounded-full eco-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(stepIndex / (flow.length - 1)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* ── Welcome ── */}
          {step === 'welcome' && (
            <motion.div key="welcome" {...fadeSlide} className="text-center py-6">
              {/* Bouncing tree */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block mb-6"
              >
                <div className="w-28 h-28 mx-auto rounded-full bg-accent flex items-center justify-center text-6xl eco-shadow">
                  🌳
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-2xl font-bold text-foreground mb-3"
              >
                {motivationalQuotes[quoteIndex]}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-muted-foreground text-sm max-w-md mx-auto mb-4"
              >
                Answer a few quick questions and we'll recommend the best plants for your exact environment.
              </motion.p>

              {/* Show AQI badge if available */}
              {aqi !== null && aqi !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 ${
                    isHighPollution ? 'eco-badge-high' : pollutionLevel === 'medium' ? 'eco-badge-medium' : 'eco-badge-low'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  AQI {aqi} — {isHighPollution ? "We'll prioritize air-purifying plants!" : 'Great air quality!'}
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl eco-gradient-primary text-primary-foreground font-semibold text-sm eco-btn-glow eco-shadow"
              >
                Let's Go
                <Sparkles className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 1: Location ── */}
          {step === 'location' && (
            <motion.div key="location" {...fadeSlide}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step {stepNumber} of {totalSteps}</p>
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                Where will your plant live? 🏡
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {([
                  { value: 'indoor' as Location, label: 'Indoor', icon: Home, desc: 'Inside your home or office' },
                  { value: 'outdoor' as Location, label: 'Outdoor', icon: Trees, desc: 'Balcony, garden, or terrace' },
                ] as const).map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocation(opt.value)}
                    className={`eco-card p-5 text-left transition-all duration-200 ${
                      location === opt.value
                        ? 'ring-2 ring-primary border-primary bg-accent/50'
                        : 'hover:border-primary/30'
                    }`}
                  >
                    <opt.icon className={`w-8 h-8 mb-3 transition-colors ${location === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-bold text-foreground text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </motion.button>
                ))}
              </div>

              {isHighPollution && location === 'indoor' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-2"
                >
                  <Leaf className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground/80">Great choice! Indoor air-purifying plants are especially effective in high-pollution areas.</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Sunlight ── */}
          {step === 'sunlight' && (
            <motion.div key="sunlight" {...fadeSlide}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step {stepNumber} of {totalSteps}</p>
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                How much sunlight does the spot get? ☀️
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'low' as SunlightLevel, label: 'Low', icon: CloudSun, desc: 'Shady / indirect' },
                  { value: 'partial' as SunlightLevel, label: 'Medium', icon: Sunrise, desc: 'A few hours' },
                  { value: 'full' as SunlightLevel, label: 'Direct', icon: Sun, desc: 'All day sun' },
                ] as const).map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSunlight(opt.value)}
                    className={`eco-card p-4 text-center transition-all duration-200 ${
                      sunlight === opt.value
                        ? 'ring-2 ring-primary border-primary bg-accent/50'
                        : 'hover:border-primary/30'
                    }`}
                  >
                    <opt.icon className={`w-7 h-7 mx-auto mb-2 transition-colors ${sunlight === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-bold text-foreground text-sm">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Area Size ── */}
          {step === 'area' && (
            <motion.div key="area" {...fadeSlide}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step {stepNumber} of {totalSteps}</p>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                How much space do you have? 📐
              </h2>
              <p className="text-sm text-muted-foreground mb-6">This helps us recommend plants that actually fit.</p>

              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'very-small' as AreaSize, label: 'Very Small', desc: 'Window sill or desk', emoji: '🪟' },
                  { value: 'small' as AreaSize, label: 'Small', desc: 'Balcony corner', emoji: '🏠' },
                  { value: 'medium' as AreaSize, label: 'Medium', desc: 'Terrace or small yard', emoji: '🌿' },
                  { value: 'large' as AreaSize, label: 'Large', desc: 'Open ground or park', emoji: '🌳' },
                ] as const).map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAreaSize(opt.value)}
                    className={`eco-card p-5 text-left transition-all duration-200 ${
                      areaSize === opt.value
                        ? 'ring-2 ring-primary border-primary bg-accent/50'
                        : 'hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <p className="font-bold text-foreground text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {areaSize === 'very-small' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-accent/50 border border-primary/10 flex items-start gap-2"
                >
                  <Maximize2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground/80">Small spaces work great with compact plants like Snake Plant, Pothos, or succulents!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Step 4: Photo (drag & drop) ── */}
          {step === 'photo' && (
            <motion.div key="photo" {...fadeSlide}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step {stepNumber} of {totalSteps}</p>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Upload a photo of your space 📷
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Optional — helps us personalise suggestions.</p>

              {photoPreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border border-border mb-2"
                >
                  <img src={photoPreview} alt="Your space" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-background transition-colors"
                  >
                    Remove
                  </button>
                </motion.div>
              ) : (
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-border hover:border-primary/40 bg-muted/20'
                  }`}
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  >
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  </motion.div>
                  <span className="text-sm text-muted-foreground">
                    {isDragging ? 'Drop your image here!' : 'Drag & drop or click to upload'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </motion.div>
          )}

          {/* ── Results ── */}
          {step === 'results' && (
            <motion.div key="results" {...fadeSlide} className="relative">
              {showConfetti && <Confetti />}

              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Your Plant Matches ({results.length})
                  </h2>
                  {isHighPollution && (
                    <p className="text-xs text-primary font-medium">Prioritized for high-pollution areas</p>
                  )}
                </div>
              </div>

              {/* High pollution tips */}
              {isHighPollution && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-4 rounded-2xl bg-accent/40 border border-primary/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">Limited Space? Try These Ideas:</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {highPollutionTips.map((tip) => (
                      <div key={tip.title} className="flex items-start gap-2 p-2 rounded-xl bg-card/60">
                        <span className="text-lg flex-shrink-0">{tip.emoji}</span>
                        <div>
                          <p className="text-xs font-bold text-foreground">{tip.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {results.length > 0 ? (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {results.map((plant, i) => (
                    <PlantCard
                      key={plant.id}
                      plant={plant}
                      index={i}
                      isSaved={savedPlantNames.has(plant.name)}
                      onToggleSave={(name) =>
                        toggleSave(name, {
                          spaceType: 'home',
                          plantingType: 'pot',
                          location: location || 'indoor',
                          sunlight: sunlight || 'partial',
                          pollutionLevel: pollutionLevel || 'low',
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <TreePine className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No matches found — try different conditions.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation ── */}
        {step !== 'welcome' && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            <motion.button
              whileHover={{ x: -2 }}
              onClick={step === 'results' ? onClose : goBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 'results' ? 'Close Wizard' : 'Back'}
            </motion.button>

            {step !== 'results' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={!canNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl eco-gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 eco-btn-glow transition-all"
              >
                {step === 'photo' ? 'See Results' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlantGuideWizard;
