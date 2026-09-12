import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutocompleteRequest {
  input: string;
  sessionToken: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { input, sessionToken }: AutocompleteRequest = await req.json();

    if (!input || input.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY not configured');
    }

    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input,
        sessionToken,
        includedPrimaryTypes: ['locality', 'administrative_area_level_1', 'country'],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Places Autocomplete API error: ${errText}`);
    }

    const data = await response.json();
    const results = (data.suggestions ?? []).map((s: any) => ({
      place_id: s.placePrediction?.placeId,
      text: s.placePrediction?.text?.text,
      main_text: s.placePrediction?.structuredFormat?.mainText?.text,
      secondary_text: s.placePrediction?.structuredFormat?.secondaryText?.text,
    })).filter((item: any) => item.place_id && item.text);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('search-locations error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error', results: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
