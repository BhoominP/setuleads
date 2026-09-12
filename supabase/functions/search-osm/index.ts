import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequestBody {
  query?: string;
  location?: string;
  bbox?: [number, number, number, number];
}

interface RawLeadResult {
  external_id: string;
  osm_type: string;
  osm_id: string;
  business_name: string;
  address: string | null;
  phone: string | null;
  website_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query = "business", location = "Vadodara, Gujarat", bbox: customBbox } = (await req.json()) as SearchRequestBody;

    let bbox = customBbox || [22.25, 73.12, 22.35, 73.25];

    if (!customBbox) {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const geoRes = await fetch(geoUrl, {
          headers: { "User-Agent": "SetuLeads/1.0 (Lead Discovery Engine)" },
        });

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0 && geoData[0].boundingbox) {
            const bb = geoData[0].boundingbox;
            bbox = [parseFloat(bb[0]), parseFloat(bb[2]), parseFloat(bb[1]), parseFloat(bb[3])];
          }
        }
      } catch (geoErr) {
        console.warn("Nominatim geocoding failed, using default bbox", geoErr);
      }
    }

    const [south, west, north, east] = bbox;
    const resultsMap = new Map<string, RawLeadResult>();
    let overpassError: string | null = null;
    let overpassCount = 0;

    // 1. Overpass QL Tag Search with required User-Agent header
    const overpassQl = `
      [out:json][timeout:15];
      (
        node[shop](${south},${west},${north},${east});
        way[shop](${south},${west},${north},${east});
        node[amenity](${south},${west},${north},${east});
        way[amenity](${south},${west},${north},${east});
        node[office](${south},${west},${north},${east});
        way[office](${south},${west},${north},${east});
        node[craft](${south},${west},${north},${east});
        way[craft](${south},${west},${north},${east});
      );
      out center 60;
    `.trim();

    try {
      const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "SetuLeads/1.0 (Lead Discovery Engine)",
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
      });

      if (overpassRes.ok) {
        const data = await overpassRes.json();
        const elements = Array.isArray(data.elements) ? data.elements : [];
        overpassCount = elements.length;

        elements.forEach((el: any) => {
          const tags = el.tags || {};
          const name = tags.name || tags["name:en"];
          if (name) {
            const street = tags["addr:street"] || tags["addr:full"] || (tags["addr:housenumber"] ? `No. ${tags["addr:housenumber"]}` : null);
            const city = tags["addr:city"] || tags["addr:suburb"] || tags["addr:town"];

            let address = location;
            if (street) {
              address = city && !location.toLowerCase().includes(city.toLowerCase()) ? `${street}, ${city}, ${location}` : `${street}, ${location}`;
            } else if (city && !location.toLowerCase().includes(city.toLowerCase())) {
              address = `${city}, ${location}`;
            }

            const idKey = `osm_${el.type}_${el.id}`;
            resultsMap.set(idKey, {
              external_id: idKey,
              osm_type: String(el.type),
              osm_id: String(el.id),
              business_name: name,
              address,
              phone: tags.phone || tags["contact:phone"] || null,
              website_url: tags.website || tags["contact:website"] || null,
              latitude: el.lat || el.center?.lat || null,
              longitude: el.lon || el.center?.lon || null,
            });
          }
        });
      } else {
        const errTxt = await overpassRes.text();
        overpassError = `Overpass API HTTP ${overpassRes.status}: ${errTxt.slice(0, 150)}`;
        console.warn("Overpass API HTTP Error:", overpassError);
      }
    } catch (opErr: any) {
      overpassError = opErr.message || "Overpass API fetch failed";
      console.warn("Overpass API execution failed:", opErr);
    }

    // 2. Photon POI Search API (Supplementary instant OSM search)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(`${query} ${location}`)}&limit=60`;
      const photonRes = await fetch(photonUrl, {
        headers: { "User-Agent": "SetuLeads/1.0 (Lead Discovery Engine)" },
      });

      if (photonRes.ok) {
        const pData = await photonRes.json();
        const features = Array.isArray(pData.features) ? pData.features : [];

        features.forEach((feat: any) => {
          const props = feat.properties || {};
          const name = props.name || props.street;
          if (name) {
            const coords = feat.geometry?.coordinates || [];
            const [lon, lat] = coords.length === 2 ? [coords[0], coords[1]] : [null, null];
            const streetAddr = [props.street, props.city, props.state || location].filter(Boolean).join(", ");
            const osmId = props.osm_id ? String(props.osm_id) : Math.random().toString(36).slice(2);
            const osmType = props.osm_type || "node";
            const idKey = `photon_${osmType}_${osmId}`;

            if (!resultsMap.has(idKey)) {
              resultsMap.set(idKey, {
                external_id: idKey,
                osm_type: osmType,
                osm_id: osmId,
                business_name: name,
                address: streetAddr || location,
                phone: props.phone || props["contact:phone"] || null,
                website_url: props.website || props["contact:website"] || null,
                latitude: lat,
                longitude: lon,
              });
            }
          }
        });
      }
    } catch (pErr) {
      console.warn("Photon POI search fallback failed:", pErr);
    }

    const results = Array.from(resultsMap.values());

    return new Response(
      JSON.stringify({
        results,
        source: "osm",
        error: results.length === 0 ? overpassError : null,
        diagnostics: {
          httpStatus: 200,
          overpassCount,
          parsedCount: results.length,
          overpassError,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("search-osm function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to execute OSM search",
        results: [],
        diagnostics: { httpStatus: 500, parsedCount: 0 },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
