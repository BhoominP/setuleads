import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequestBody {
  query?: string;
  location?: string;
  pageToken?: string;
  bbox?: [number, number, number, number]; // [south, west, north, east]
}

interface RawLeadResult {
  external_id: string;
  google_place_id: string;
  business_name: string;
  address: string | null;
  phone: string | null;
  website_url: string | null;
  latitude: number | null;
  longitude: number | null;
  types?: string[];
  business_status?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query = "", location = "", pageToken, bbox } = (await req.json()) as SearchRequestBody;

    if (!query.trim()) {
      return new Response(
        JSON.stringify({ error: "Search query is required", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          results: [],
          source: "google_places",
          error: "GOOGLE_PLACES_API_KEY secret is not configured in Supabase environment variables.",
          diagnostics: { httpStatus: 401, placesCount: 0 }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Construct textQuery: If bbox rectangle is specified, textQuery should be the category term (e.g. "startup").
    // If no bbox is specified, textQuery is "query in location" (e.g. "startup in Vadodara, Gujarat").
    const textQuery = bbox && Array.isArray(bbox) && bbox.length === 4
      ? query
      : (location ? `${query} in ${location}` : query);

    const requestBody: any = {
      textQuery,
      pageSize: 20,
    };

    if (pageToken) {
      requestBody.pageToken = pageToken;
    }

    if (bbox && Array.isArray(bbox) && bbox.length === 4) {
      requestBody.locationRestriction = {
        rectangle: {
          low: { latitude: bbox[0], longitude: bbox[1] },
          high: { latitude: bbox[2], longitude: bbox[3] },
        },
      };
    }

    const url = "https://places.googleapis.com/v1/places:searchText";
    const googleResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.location,places.types,places.businessStatus,nextPageToken",
      },
      body: JSON.stringify(requestBody),
    });

    if (!googleResponse.ok) {
      const errText = await googleResponse.text();
      console.error(`Google Places API Error (${googleResponse.status}):`, errText);
      return new Response(
        JSON.stringify({
          results: [],
          error: `Google Places API returned status ${googleResponse.status}: ${errText.slice(0, 150)}`,
          diagnostics: { httpStatus: googleResponse.status, placesCount: 0 }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const data = await googleResponse.json();
    const places = Array.isArray(data.places) ? data.places : [];
    const nextPageToken = data.nextPageToken || null;

    const results: RawLeadResult[] = places.map((p: any) => ({
      external_id: p.id,
      google_place_id: p.id,
      business_name: p.displayName?.text || "Unknown Business",
      address: p.formattedAddress || null,
      phone: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
      website_url: p.websiteUri || null,
      latitude: p.location?.latitude || null,
      longitude: p.location?.longitude || null,
      types: p.types || [],
      business_status: p.businessStatus || null,
    }));

    return new Response(
      JSON.stringify({
        results,
        nextPageToken,
        source: "google_places",
        diagnostics: {
          httpStatus: 200,
          placesCount: places.length,
          parsedCount: results.length,
          hasNextPageToken: Boolean(nextPageToken),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("search-places function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to execute Google Places search",
        results: [],
        diagnostics: { httpStatus: 500, placesCount: 0 }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
