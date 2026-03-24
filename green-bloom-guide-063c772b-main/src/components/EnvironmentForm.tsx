import { motion } from 'framer-motion';
import { Camera, Upload, Home, Building2, TreePine, Fence, MapPin, Maximize2 } from 'lucide-react';
import type { SpaceType, PlantingType, Location, SunlightLevel, AreaSize } from '@/data/plants';

interface EnvironmentFormProps {
  spaceType: SpaceType;
  plantingType: PlantingType;
  location: Location;
  sunlight: SunlightLevel;
  areaSize: AreaSize;
  imagePreview: string | null;
  onSpaceTypeChange: (v: SpaceType) => void;
  onPlantingTypeChange: (v: PlantingType) => void;
  onLocationChange: (v: Location) => void;
  onSunlightChange: (v: SunlightLevel) => void;
  onAreaSizeChange: (v: AreaSize) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const spaceOptions: { value: SpaceType; label: string; icon: React.ReactNode; emoji: string }[] = [
  { value: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, emoji: '🏡' },
  { value: 'office', label: 'Office', icon: <Building2 className="w-4 h-4" />, emoji: '🏢' },
  { value: 'balcony', label: 'Balcony', icon: <Fence className="w-4 h-4" />, emoji: '🌇' },
  { value: 'roadside', label: 'Roadside', icon: <MapPin className="w-4 h-4" />, emoji: '🛣️' },
  { value: 'open-ground', label: 'Open Ground', icon: <TreePine className="w-4 h-4" />, emoji: '🌳' },
];

const areaOptions: { value: AreaSize; label: string; desc: string; emoji: string }[] = [
  { value: 'very-small', label: 'Very Small', desc: 'Table / window sill', emoji: '🪟' },
  { value: 'small', label: 'Small', desc: 'Balcony corner', emoji: '🏠' },
  { value: 'medium', label: 'Medium', desc: 'Garden / terrace', emoji: '🌿' },
  { value: 'large', label: 'Large', desc: 'Open ground / park', emoji: '🌳' },
];

const OptionChip = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border ${
      selected
        ? 'bg-primary text-primary-foreground border-primary shadow-md'
        : 'bg-card text-foreground border-border hover:bg-accent hover:border-primary/20 hover:shadow-sm'
    }`}
  >
    {children}
  </motion.button>
);

const SectionCard = ({ title, emoji, children, delay = 0 }: { title: string; emoji: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="eco-card p-5 hover:shadow-md transition-shadow duration-300"
  >
    <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
      <span className="text-base">{emoji}</span>
      {title}
    </h3>
    {children}
  </motion.div>
);

const EnvironmentForm = ({
  spaceType,
  plantingType,
  location,
  sunlight,
  areaSize,
  imagePreview,
  onSpaceTypeChange,
  onPlantingTypeChange,
  onLocationChange,
  onSunlightChange,
  onAreaSizeChange,
  onImageUpload,
}: EnvironmentFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Image Upload */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="eco-card p-5 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Camera className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            📸 Upload Space Photo
          </h3>
        </div>
        <label className="block cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.01, borderColor: 'hsl(var(--primary))' }}
            className={`border-2 border-dashed rounded-2xl transition-all duration-300 ${
              imagePreview ? 'border-primary/30 p-2' : 'border-border p-8 hover:bg-accent/30'
            }`}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Uploaded space" className="w-full h-40 object-cover rounded-xl" />
            ) : (
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-primary/40" />
                </motion.div>
                <p className="text-sm font-medium text-foreground">Tap to upload a photo</p>
                <p className="text-xs text-muted-foreground mt-1">of your planting space</p>
              </div>
            )}
          </motion.div>
          <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
        </label>
      </motion.div>

      <SectionCard title="Where do you want to plant?" emoji="📍" delay={0.05}>
        <div className="flex flex-wrap gap-2">
          {spaceOptions.map(opt => (
            <OptionChip
              key={opt.value}
              selected={spaceType === opt.value}
              onClick={() => onSpaceTypeChange(opt.value)}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </OptionChip>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Planting in?" emoji="🌍" delay={0.1}>
        <div className="flex gap-2">
          <OptionChip selected={plantingType === 'soil'} onClick={() => onPlantingTypeChange('soil')}>
            🌍 Soil
          </OptionChip>
          <OptionChip selected={plantingType === 'pot'} onClick={() => onPlantingTypeChange('pot')}>
            🪴 Pot
          </OptionChip>
        </div>
      </SectionCard>

      <SectionCard title="Indoor or Outdoor?" emoji="🏠" delay={0.15}>
        <div className="flex gap-2">
          <OptionChip selected={location === 'indoor'} onClick={() => onLocationChange('indoor')}>
            🏠 Indoor
          </OptionChip>
          <OptionChip selected={location === 'outdoor'} onClick={() => onLocationChange('outdoor')}>
            ☀️ Outdoor
          </OptionChip>
        </div>
      </SectionCard>

      <SectionCard title="Sunlight Available?" emoji="☀️" delay={0.2}>
        <div className="flex flex-wrap gap-2">
          <OptionChip selected={sunlight === 'low'} onClick={() => onSunlightChange('low')}>
            🌥️ Low
          </OptionChip>
          <OptionChip selected={sunlight === 'partial'} onClick={() => onSunlightChange('partial')}>
            ⛅ Partial
          </OptionChip>
          <OptionChip selected={sunlight === 'full'} onClick={() => onSunlightChange('full')}>
            ☀️ Full Sun
          </OptionChip>
        </div>
      </SectionCard>

      {/* Area Size */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="eco-card p-5 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Maximize2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            📐 Available Area Size
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {areaOptions.map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAreaSizeChange(opt.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 border ${
                areaSize === opt.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-foreground border-border hover:bg-accent hover:border-primary/20 hover:shadow-sm'
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <div>
                <p className="text-sm font-bold">{opt.label}</p>
                <p className={`text-[10px] ${areaSize === opt.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnvironmentForm;
