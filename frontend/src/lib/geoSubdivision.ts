/**
 * Geographic Subdivision & Bounding Box Grid Generator
 * Subdivides a geographic target location into bounding box cells for high recall.
 */

export type BoundingBox = [number, number, number, number]; // [south, west, north, east]

export interface GeoCell {
  id: string;
  label: string;
  bbox: BoundingBox;
  center: [number, number]; // [lat, lon]
}

const PRESET_BBOX: Record<string, BoundingBox> = {
  'vadodara, gujarat': [22.20, 73.10, 22.38, 73.26],
  'vadodara': [22.20, 73.10, 22.38, 73.26],
  'surat, gujarat': [21.10, 72.75, 21.28, 72.92],
  'surat': [21.10, 72.75, 21.28, 72.92],
  'ahmedabad, gujarat': [22.95, 72.48, 23.12, 72.68],
  'ahmedabad': [22.95, 72.48, 23.12, 72.68],
  'mumbai, maharashtra': [18.88, 72.77, 19.28, 72.98],
  'mumbai': [18.88, 72.77, 19.28, 72.98],
  'bengaluru, karnataka': [12.85, 77.45, 13.15, 77.75],
  'bengaluru': [12.85, 77.45, 13.15, 77.75],
  'delhi ncr, india': [28.40, 76.90, 28.88, 77.35],
  'delhi': [28.40, 76.90, 28.88, 77.35],
};

const geocodeCache = new Map<string, BoundingBox>();

export async function geocodeLocationToBbox(locString: string): Promise<BoundingBox> {
  if (!locString || !locString.trim()) return [22.20, 73.10, 22.38, 73.26];
  const cleaned = locString.trim().toLowerCase();
  const firstCityToken = cleaned.split(',')[0].trim();

  if (geocodeCache.has(cleaned)) return geocodeCache.get(cleaned)!;
  if (PRESET_BBOX[cleaned]) return PRESET_BBOX[cleaned];
  if (PRESET_BBOX[firstCityToken]) return PRESET_BBOX[firstCityToken];

  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleaned)}`;
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      const feat = data.features?.[0];
      if (feat?.geometry?.coordinates && Array.isArray(feat.geometry.coordinates)) {
        const [lon, lat] = feat.geometry.coordinates;
        if (!isNaN(lat) && !isNaN(lon)) {
          const s = parseFloat((lat - 0.15).toFixed(4));
          const w = parseFloat((lon - 0.15).toFixed(4));
          const n = parseFloat((lat + 0.15).toFixed(4));
          const e = parseFloat((lon + 0.15).toFixed(4));
          const bbox: BoundingBox = [s, w, n, e];
          geocodeCache.set(cleaned, bbox);
          return bbox;
        }
      }
    }
  } catch (err) {
    console.warn('Geocoding location failed for:', cleaned, err);
  }

  return [22.20, 73.10, 22.38, 73.26];
}

/**
 * Subdivides a bounding box into a 2x2 grid of 4 geographic cells.
 * For smaller areas, returns 1 single primary cell to minimize unnecessary requests.
 */
export function generateGeoGrid(bbox: BoundingBox, locationLabel: string): GeoCell[] {
  const [s, w, n, e] = bbox;
  const latSpan = n - s;
  const lonSpan = e - w;

  // If area span is small (< 0.1 deg), single cell is sufficient
  if (latSpan < 0.10 && lonSpan < 0.10) {
    return [
      {
        id: 'cell_full',
        label: locationLabel,
        bbox,
        center: [(s + n) / 2, (w + e) / 2],
      },
    ];
  }

  // 2x2 grid subdivision
  const midLat = (s + n) / 2;
  const midLon = (w + e) / 2;

  return [
    {
      id: 'cell_nw',
      label: `${locationLabel} (North-West)`,
      bbox: [midLat, w, n, midLon],
      center: [(midLat + n) / 2, (w + midLon) / 2],
    },
    {
      id: 'cell_ne',
      label: `${locationLabel} (North-East)`,
      bbox: [midLat, midLon, n, e],
      center: [(midLat + n) / 2, (midLon + e) / 2],
    },
    {
      id: 'cell_sw',
      label: `${locationLabel} (South-West)`,
      bbox: [s, w, midLat, midLon],
      center: [(s + midLat) / 2, (w + midLon) / 2],
    },
    {
      id: 'cell_se',
      label: `${locationLabel} (South-East)`,
      bbox: [s, midLon, midLat, e],
      center: [(s + midLat) / 2, (midLon + e) / 2],
    },
  ];
}
