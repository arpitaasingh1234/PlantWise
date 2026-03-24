const wikiCache = new Map<string, { thumbnail?: string; summary?: string; url?: string }>();

export async function fetchWikipediaSummary(plantName: string): Promise<{
  thumbnail?: string;
  summary?: string;
  url?: string;
}> {
  if (wikiCache.has(plantName)) {
    return wikiCache.get(plantName)!;
  }

  try {
    const encoded = encodeURIComponent(plantName.replace(/\s+/g, '_'));
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`Wikipedia returned ${response.status}`);
    }

    const data = await response.json();
    const result = {
      thumbnail: data.thumbnail?.source,
      summary: data.extract
        ? data.extract.length > 150
          ? data.extract.slice(0, 150).trim() + '…'
          : data.extract
        : undefined,
      url: data.content_urls?.desktop?.page,
    };

    wikiCache.set(plantName, result);
    return result;
  } catch (err) {
    console.warn(`Wikipedia fetch failed for ${plantName}:`, err);
    const fallback = {};
    wikiCache.set(plantName, fallback);
    return fallback;
  }
}
