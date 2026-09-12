import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetailsRequest {
  placeId: string;
  sessionToken?: string;
  addressHint?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { placeId, sessionToken, addressHint }: DetailsRequest = await req.json();

    if (!placeId) {
      return new Response(JSON.stringify({ error: 'Missing placeId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (apiKey) {
      try {
        const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
        if (sessionToken) {
          url.searchParams.set('sessionToken', sessionToken);
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const lat = data.location?.latitude;
          const lng = data.location?.longitude;
          const formattedAddress = data.formattedAddress || data.displayName?.text || addressHint || placeId;

          if (lat != null && lng != null) {
            return new Response(
              JSON.stringify({
                place_id: data.id || placeId,
                formatted_address: formattedAddress,
                location: { latitude: lat, longitude: lng },
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (gErr) {
        console.warn('Google Places Details failed, falling back to geocode:', gErr);
      }
    }

    // Fallback Geocode via Photon / Nominatim using addressHint or placeId if API key is missing or failed
    const query = addressHint || placeId;
    let lat = 22.3072;
    let lng = 73.1812;

    try {
      const photonRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`);
      if (photonRes.ok) {
        const pData = await photonRes.json();
        const feat = pData.features?.[0];
        if (feat?.geometry?.coordinates) {
          lng = feat.geometry.coordinates[0];
          lat = feat.geometry.coordinates[1];
        }
      }
    } catch (err) {
      console.warn('Photon geocode fallback failed:', err);
    }

    return new Response(
      JSON.stringify({
        place_id: placeId,
        formatted_address: addressHint || placeId,
        location: { latitude: lat, longitude: lng },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('get-place-details error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
