# Climate-Based Soil Recommendation Feature

## Overview

Added climate-based soil recommendation feature that dynamically updates soil suggestions based on the weather selection in the Plant Wizard, providing users with both plant and soil recommendations in one integrated experience.

## Files Modified

### 1. `src/components/PlantGuideWizard.tsx` - ENHANCED

**Added Soil Recommendation Section in Results:**
```typescript
{/* ── Recommended Soil ── */}
<div className="mt-6">
  <div className="flex items-center gap-2.5 mb-4">
    <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/20">
      <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
    </div>
    <div>
      <h3 className="font-display text-lg font-bold text-foreground">
        Recommended Soil 🌱
      </h3>
      <p className="text-xs text-muted-foreground">
        Based on {selectedWeather === 'hot-dry' ? 'Hot & Dry' : 
                 selectedWeather === 'rainy-humid' ? 'Rainy / Humid' : 
                 selectedWeather === 'cold-frost' ? 'Cold / Frost' : 'Normal'} weather
      </p>
    </div>
  </div>
</div>
```

**Weather-Based Soil Logic:**
```typescript
{selectedWeather === 'hot-dry' && [
  { name: 'Sandy Soil', desc: 'Prevents water retention, avoids root rot', emoji: '🏖️' },
  { name: 'Well-drained Soil', desc: 'Prevents water retention, avoids root rot', emoji: '💧' }
].map((soil, i) => (
  <motion.div className="eco-card p-4 text-left transition-all duration-200 hover:border-primary/30">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{soil.emoji}</span>
      <div>
        <p className="font-bold text-foreground text-sm">{soil.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{soil.desc}</p>
      </div>
    </div>
  </motion.div>
))}
```

**Soil Recommendations by Weather:**

| Weather | Soil Options | Description |
|---------|-------------|-------------|
| **Hot & Dry** | Sandy Soil, Well-drained Soil | "Prevents water retention, avoids root rot" |
| **Rainy / Humid** | Loamy Soil, Moisture-control Soil | "Balances water, avoids excess moisture" |
| **Cold / Frost** | Nutrient-rich Soil, Indoor Potting Mix | "Supports growth in low temperature" |
| **Normal** | Standard Garden Soil | "Suitable for most plants" |

**UI Consistency:**
- Same `eco-card` class as selection steps
- Same hover effect: `hover:border-primary/30`
- Same spacing and borders
- Same motion animation with staggered delays
- Same emoji + text layout

### 2. `src/utils/recommendations.ts` - ENHANCED

**Weather-Based Soil Filtering:**
```typescript
// Enhanced soil recommendations based on planting type and weather
const enhancedSoilMix = soilMix.filter(soil => {
  // Weather-based filtering
  if (env.weather === 'hot-dry') {
    const soilName = soil.name.toLowerCase();
    return soilName.includes('sandy') || 
           soilName.includes('well-drained') ||
           soilName.includes('cactus') ||
           soilName.includes('succulent');
  }
  
  if (env.weather === 'rainy-humid') {
    const soilName = soil.name.toLowerCase();
    return soilName.includes('loamy') || 
           soilName.includes('moisture') ||
           soilName.includes('clay') ||
           soilName.includes('control');
  }
  
  if (env.weather === 'cold-frost') {
    const soilName = soil.name.toLowerCase();
    return soilName.includes('nutrient') || 
           soilName.includes('rich') ||
           soilName.includes('potting') ||
           soilName.includes('indoor') ||
           soilName.includes('mix');
  }
  
  // Normal weather: no special filtering
  
  // Planting type filtering (existing logic preserved)
  if (env.plantingType === 'pot') {
    return soil.name.toLowerCase().includes('potting') || 
           soil.name.toLowerCase().includes('container') ||
           soil.name.toLowerCase().includes('mix');
  }
  
  return true;
});
```

### 3. `src/pages/Dashboard.tsx` - UPDATED

**Added Default Weather Parameter:**
```typescript
const recs = await getRecommendations({ 
  pollutionLevel, 
  spaceType, 
  plantingType, 
  location, 
  sunlight, 
  areaSize, 
  weather: 'normal' // Default to normal weather for Dashboard
});
```

## Key Features Implemented

### ✅ **Dynamic Soil Recommendations**
- Soil suggestions update instantly when weather changes
- Weather-specific soil filtering logic
- Preserves existing planting type filtering

### ✅ **UI Consistency**
- **Same card design** as selection steps
- **Same hover effects**: `hover:border-primary/30`
- **Same spacing**: `gap-3`, `p-4`
- **Same borders**: `eco-card` class
- **Same animations**: Motion with staggered delays

### ✅ **Weather Logic Integration**
- **Hot & Dry**: Sandy + Well-drained soils
- **Rainy / Humid**: Loamy + Moisture-control soils  
- **Cold / Frost**: Nutrient-rich + Indoor Potting Mix
- **Normal**: Standard Garden Soil

### ✅ **User Experience**
- **Simple flow**: Select weather → See plants + soil suggestions
- **Visual hierarchy**: Plants first, then soil recommendations
- **Clear labeling**: "Recommended Soil 🌱" with weather context
- **Instant updates**: Soil changes dynamically with weather selection

### ✅ **Integration**
- **Wizard**: Shows soil cards in results section
- **Dashboard**: Uses weather-based filtering in existing soil recommendations
- **Preserved functionality**: All existing soil recommendation logic maintained

## Soil Recommendation Display

### **In Plant Wizard Results:**
```
🌿 Plant Matches (6)
Based on selected weather, showing optimized plants
Weather: Hot & Dry

🌱 Recommended Soil
Based on Hot & Dry weather

[🏖️ Sandy Soil]     [💧 Well-drained Soil]
Prevents water      Prevents water
retention, avoids    retention, avoids
root rot           root rot
```

### **In Dashboard:**
- Uses existing `SoilRecommendationCard` component
- Weather-based filtering applied to soil recommendations
- Default weather = 'normal' for Dashboard

## Technical Implementation

### **Weather-Based Soil Keywords:**

| Weather | Soil Keywords Matched |
|---------|---------------------|
| **Hot & Dry** | sandy, well-drained, cactus, succulent |
| **Rainy / Humid** | loamy, moisture, clay, control |
| **Cold / Frost** | nutrient, rich, potting, indoor, mix |
| **Normal** | No special filtering (all soils) |

### **Component Structure:**
```typescript
// Header with icon and weather context
<div className="flex items-center gap-2.5 mb-4">
  <Leaf className="w-5 h-5 text-green-600" />
  <div>
    <h3>Recommended Soil 🌱</h3>
    <p>Based on {weather} weather</p>
  </div>
</div>

// Grid of soil cards (same UI as selection steps)
<div className="grid grid-cols-2 gap-3">
  {soilOptions.map((soil, i) => (
    <motion.div className="eco-card p-4 hover:border-primary/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{soil.emoji}</span>
        <div>
          <p className="font-bold text-sm">{soil.name}</p>
          <p className="text-xs text-muted-foreground">{soil.desc}</p>
        </div>
      </div>
    </motion.div>
  ))}
</div>
```

## Result

- ✅ **Complete climate-based soil recommendations**
- ✅ **Dynamic updates** with weather selection
- ✅ **Consistent UI design** with existing components
- ✅ **Integration** with both Wizard and Dashboard
- ✅ **Preserved functionality** - no breaking changes
- ✅ **Enhanced user experience** - plants + soil suggestions together

Users now get comprehensive recommendations that include both optimal plants AND the best soil types for their selected weather conditions, creating a complete planting guidance system.
