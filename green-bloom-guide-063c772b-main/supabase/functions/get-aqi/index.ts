import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WAQI_API_TOKEN = Deno.env.get('WAQI_API_TOKEN');
    if (!WAQI_API_TOKEN) {
      throw new Error('WAQI_API_TOKEN is not configured');
    }

    const { lat, lng } = await req.json();
    if (!lat || !lng) {
      throw new Error('lat and lng are required');
    }

    // Fetch AQI data from WAQI API using geo coordinates
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_API_TOKEN}`
    );
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(`WAQI API error: ${JSON.stringify(data)}`);
    }

    const aqiValue = data.data.aqi;
    const city = data.data.city?.name || 'Unknown location';
    const dominantPollutant = data.data.dominentpol || null;

    // Extract individual pollutant values if available
    const iaqi = data.data.iaqi || {};
    const pm25 = iaqi.pm25?.v ?? null;
    const pm10 = iaqi.pm10?.v ?? null;

    return new Response(
      JSON.stringify({
        aqi: aqiValue,
        city,
        dominantPollutant,
        pm25,
        pm10,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('AQI fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
