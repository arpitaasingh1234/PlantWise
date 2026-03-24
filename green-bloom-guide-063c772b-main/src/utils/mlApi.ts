import type { Plant, PollutionLevel, SpaceType, SunlightLevel } from '@/data/plants';

const ML_API_URL = 'http://127.0.0.1:5000/predict-survival';

const pollutionMap: Record<PollutionLevel, number> = { low: 1, medium: 2, high: 3 };
const sunlightMap: Record<SunlightLevel, number> = { low: 1, partial: 2, full: 3 };
const spaceMap: Record<SpaceType, number> = { home: 1, office: 2, balcony: 3, roadside: 4, 'open-ground': 5 };
const difficultyMap: Record<Plant['difficulty'], number> = { easy: 1, moderate: 2, hard: 3 };

export async function fetchSurvivalFromML(
  env: { pollutionLevel: PollutionLevel; sunlight: SunlightLevel; spaceType: SpaceType },
  plant: Plant
): Promise<number> {
  try {
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pollution: pollutionMap[env.pollutionLevel],
        sunlight: sunlightMap[env.sunlight],
        space: spaceMap[env.spaceType],
        difficulty: difficultyMap[plant.difficulty],
      }),
    });

    if (!response.ok) throw new Error(`ML API returned ${response.status}`);

    const data = await response.json();
    return typeof data.survival_probability === 'number'
      ? Math.round(data.survival_probability * 100)
      : plant.survivalRate;
  } catch (err) {
    console.warn(`ML API unavailable for ${plant.name}, using fallback survivalRate:`, err);
    return plant.survivalRate;
  }
}
