import { useState, useRef, useEffect } from 'react';
import { Crosshair, MapPin, Compass, Broadcast, Play, Pause, Lightning, Globe, Check } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface FamousCity {
  id: string;
  name: string;
  cityName: string;
  country: string;
  countryFlag: string;
  lat: number;
  lon: number;
  x: number;
  y: number;
}

export interface CountryGroup {
  country: string;
  countryCode: string;
  flag: string;
  cities: FamousCity[];
}

export const COUNTRY_TERRITORIES: CountryGroup[] = [
  {
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    cities: [
      { id: 'in_vadodara', name: 'Vadodara', cityName: 'Vadodara, Gujarat', country: 'India', countryFlag: '🇮🇳', lat: 22.3072, lon: 73.1812, x: 67.5, y: 44.2 },
      { id: 'in_mumbai', name: 'Mumbai', cityName: 'Mumbai, Maharashtra', country: 'India', countryFlag: '🇮🇳', lat: 19.0760, lon: 72.8777, x: 67.4, y: 49.5 },
      { id: 'in_bengaluru', name: 'Bengaluru', cityName: 'Bengaluru, Karnataka', country: 'India', countryFlag: '🇮🇳', lat: 12.9716, lon: 77.5946, x: 68.8, y: 56.8 },
      { id: 'in_delhi', name: 'Delhi NCR', cityName: 'Delhi NCR, India', country: 'India', countryFlag: '🇮🇳', lat: 28.6139, lon: 77.2090, x: 68.6, y: 36.2 },
      { id: 'in_ahmedabad', name: 'Ahmedabad', cityName: 'Ahmedabad, Gujarat', country: 'India', countryFlag: '🇮🇳', lat: 23.0225, lon: 72.5714, x: 67.3, y: 43.1 },
      { id: 'in_surat', name: 'Surat', cityName: 'Surat, Gujarat', country: 'India', countryFlag: '🇮🇳', lat: 21.1702, lon: 72.8311, x: 67.4, y: 45.3 },
      { id: 'in_pune', name: 'Pune', cityName: 'Pune, Maharashtra', country: 'India', countryFlag: '🇮🇳', lat: 18.5204, lon: 73.8567, x: 67.7, y: 50.1 },
      { id: 'in_hyderabad', name: 'Hyderabad', cityName: 'Hyderabad, Telangana', country: 'India', countryFlag: '🇮🇳', lat: 17.3850, lon: 78.4867, x: 69.0, y: 51.3 },
      { id: 'in_chennai', name: 'Chennai', cityName: 'Chennai, Tamil Nadu', country: 'India', countryFlag: '🇮🇳', lat: 13.0827, lon: 80.2707, x: 69.5, y: 56.6 },
      { id: 'in_jaipur', name: 'Jaipur', cityName: 'Jaipur, Rajasthan', country: 'India', countryFlag: '🇮🇳', lat: 26.9124, lon: 75.7873, x: 68.2, y: 38.4 },
    ],
  },
  {
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    cities: [
      { id: 'us_nyc', name: 'New York City', cityName: 'New York City, NY', country: 'United States', countryFlag: '🇺🇸', lat: 40.7128, lon: -74.0060, x: 26.2, y: 30.1 },
      { id: 'us_sf', name: 'San Francisco', cityName: 'San Francisco, CA', country: 'United States', countryFlag: '🇺🇸', lat: 37.7749, lon: -122.4194, x: 13.8, y: 32.8 },
      { id: 'us_la', name: 'Los Angeles', cityName: 'Los Angeles, CA', country: 'United States', countryFlag: '🇺🇸', lat: 34.0522, lon: -118.2437, x: 14.8, y: 36.2 },
      { id: 'us_chicago', name: 'Chicago', cityName: 'Chicago, IL', country: 'United States', countryFlag: '🇺🇸', lat: 41.8781, lon: -87.6298, x: 22.5, y: 29.1 },
      { id: 'us_austin', name: 'Austin', cityName: 'Austin, TX', country: 'United States', countryFlag: '🇺🇸', lat: 30.2672, lon: -97.7431, x: 19.8, y: 39.8 },
      { id: 'us_miami', name: 'Miami', cityName: 'Miami, FL', country: 'United States', countryFlag: '🇺🇸', lat: 25.7617, lon: -80.1918, x: 24.6, y: 44.2 },
      { id: 'us_seattle', name: 'Seattle', cityName: 'Seattle, WA', country: 'United States', countryFlag: '🇺🇸', lat: 47.6062, lon: -122.3321, x: 13.8, y: 23.9 },
      { id: 'us_boston', name: 'Boston', cityName: 'Boston, MA', country: 'United States', countryFlag: '🇺🇸', lat: 42.3601, lon: -71.0589, x: 26.8, y: 28.6 },
    ],
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    cities: [
      { id: 'uk_london', name: 'London', cityName: 'London, United Kingdom', country: 'United Kingdom', countryFlag: '🇬🇧', lat: 51.5074, lon: -0.1278, x: 46.8, y: 22.4 },
      { id: 'uk_manchester', name: 'Manchester', cityName: 'Manchester, United Kingdom', country: 'United Kingdom', countryFlag: '🇬🇧', lat: 53.4808, lon: -2.2426, x: 46.2, y: 20.2 },
      { id: 'uk_birmingham', name: 'Birmingham', cityName: 'Birmingham, United Kingdom', country: 'United Kingdom', countryFlag: '🇬🇧', lat: 52.4862, lon: -1.8904, x: 46.3, y: 21.3 },
      { id: 'uk_edinburgh', name: 'Edinburgh', cityName: 'Edinburgh, Scotland', country: 'United Kingdom', countryFlag: '🇬🇧', lat: 55.9533, lon: -3.1883, x: 45.9, y: 17.5 },
      { id: 'uk_bristol', name: 'Bristol', cityName: 'Bristol, United Kingdom', country: 'United Kingdom', countryFlag: '🇬🇧', lat: 51.4545, lon: -2.5879, x: 46.1, y: 22.5 },
    ],
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    cities: [
      { id: 'ca_toronto', name: 'Toronto', cityName: 'Toronto, Ontario, Canada', country: 'Canada', countryFlag: '🇨🇦', lat: 43.6532, lon: -79.3832, x: 24.8, y: 27.2 },
      { id: 'ca_vancouver', name: 'Vancouver', cityName: 'Vancouver, BC, Canada', country: 'Canada', countryFlag: '🇨🇦', lat: 49.2827, lon: -123.1207, x: 13.5, y: 22.1 },
      { id: 'ca_montreal', name: 'Montreal', cityName: 'Montreal, Quebec, Canada', country: 'Canada', countryFlag: '🇨🇦', lat: 45.5017, lon: -73.5673, x: 26.3, y: 25.3 },
      { id: 'ca_calgary', name: 'Calgary', cityName: 'Calgary, Alberta, Canada', country: 'Canada', countryFlag: '🇨🇦', lat: 51.0447, lon: -114.0719, x: 16.2, y: 20.8 },
    ],
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    cities: [
      { id: 'au_sydney', name: 'Sydney', cityName: 'Sydney, Australia', country: 'Australia', countryFlag: '🇦🇺', lat: -33.8688, lon: 151.2093, x: 89.2, y: 78.4 },
      { id: 'au_melbourne', name: 'Melbourne', cityName: 'Melbourne, Australia', country: 'Australia', countryFlag: '🇦🇺', lat: -37.8136, lon: 144.9631, x: 87.5, y: 82.2 },
      { id: 'au_brisbane', name: 'Brisbane', cityName: 'Brisbane, Australia', country: 'Australia', countryFlag: '🇦🇺', lat: -27.4705, lon: 153.0260, x: 89.7, y: 72.1 },
      { id: 'au_perth', name: 'Perth', cityName: 'Perth, Australia', country: 'Australia', countryFlag: '🇦🇺', lat: -31.9505, lon: 115.8605, x: 81.2, y: 76.5 },
    ],
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    cities: [
      { id: 'de_berlin', name: 'Berlin', cityName: 'Berlin, Germany', country: 'Germany', countryFlag: '🇩🇪', lat: 52.5200, lon: 13.4050, x: 50.5, y: 21.2 },
      { id: 'de_munich', name: 'Munich', cityName: 'Munich, Germany', country: 'Germany', countryFlag: '🇩🇪', lat: 48.1351, lon: 11.5820, x: 50.0, y: 25.5 },
      { id: 'de_frankfurt', name: 'Frankfurt', cityName: 'Frankfurt, Germany', country: 'Germany', countryFlag: '🇩🇪', lat: 50.1109, lon: 8.6821, x: 49.2, y: 23.6 },
    ],
  },
  {
    country: 'UAE',
    countryCode: 'AE',
    flag: '🇦🇪',
    cities: [
      { id: 'ae_dubai', name: 'Dubai', cityName: 'Dubai, UAE', country: 'UAE', countryFlag: '🇦🇪', lat: 25.2048, lon: 55.2708, x: 62.4, y: 41.2 },
      { id: 'ae_abudhabi', name: 'Abu Dhabi', cityName: 'Abu Dhabi, UAE', country: 'UAE', countryFlag: '🇦🇪', lat: 24.4539, lon: 54.3773, x: 62.2, y: 42.1 },
    ],
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    cities: [
      { id: 'jp_tokyo', name: 'Tokyo', cityName: 'Tokyo, Japan', country: 'Japan', countryFlag: '🇯🇵', lat: 35.6762, lon: 139.6503, x: 86.2, y: 34.5 },
      { id: 'jp_osaka', name: 'Osaka', cityName: 'Osaka, Japan', country: 'Japan', countryFlag: '🇯🇵', lat: 34.6937, lon: 135.5023, x: 85.1, y: 35.5 },
    ],
  },
  {
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    cities: [
      { id: 'fr_paris', name: 'Paris', cityName: 'Paris, France', country: 'France', countryFlag: '🇫🇷', lat: 48.8566, lon: 2.3522, x: 47.4, y: 24.8 },
      { id: 'fr_lyon', name: 'Lyon', cityName: 'Lyon, France', country: 'France', countryFlag: '🇫🇷', lat: 45.7640, lon: 4.8357, x: 48.1, y: 27.8 },
    ],
  },
  {
    country: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    cities: [
      { id: 'sg_singapore', name: 'Singapore', cityName: 'Singapore', country: 'Singapore', countryFlag: '🇸🇬', lat: 1.3521, lon: 103.8198, x: 75.8, y: 68.3 },
    ],
  },
];

// All preset cities for map dots
const ALL_PRESET_CITIES: FamousCity[] = COUNTRY_TERRITORIES.flatMap((group) => group.cities);

interface PingPoint {
  x: number;
  y: number;
  lat: number;
  lon: number;
  timestamp: number;
  locationName: string;
}

interface RadarScanMapProps {
  currentLocation?: string;
  activeCoords?: { lat: number; lng: number };
  onSelectLocation?: (locationName: string) => void;
}

export function RadarScanMap({
  currentLocation = 'Vadodara, Gujarat',
  activeCoords,
  onSelectLocation,
}: RadarScanMapProps) {
  const [isRotating, setIsRotating] = useState(true);
  const [sweepSpeed, setSweepSpeed] = useState<'normal' | 'fast'>('normal');
  const [selectedCountry, setSelectedCountry] = useState<string>('India');

  const [activePing, setActivePing] = useState<PingPoint | null>({
    x: 67.5,
    y: 44.2,
    lat: 22.3072,
    lon: 73.1812,
    timestamp: Date.now(),
    locationName: currentLocation,
  });
  const [hoveredLocation, setHoveredLocation] = useState<FamousCity | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync activePing when activeCoords or currentLocation changes
  useEffect(() => {
    if (activeCoords && !isNaN(activeCoords.lat) && !isNaN(activeCoords.lng)) {
      const x = Math.min(95, Math.max(5, ((activeCoords.lng + 180) / 360) * 100));
      const y = Math.min(95, Math.max(5, ((85 - activeCoords.lat) / 170) * 100));
      setActivePing({
        x,
        y,
        lat: activeCoords.lat,
        lon: activeCoords.lng,
        timestamp: Date.now(),
        locationName: currentLocation,
      });
    }
  }, [currentLocation, activeCoords]);

  // Handle city selection
  function handleSelectCity(city: FamousCity) {
    setActivePing({
      x: city.x,
      y: city.y,
      lat: city.lat,
      lon: city.lon,
      timestamp: Date.now(),
      locationName: city.cityName,
    });
    if (onSelectLocation) {
      onSelectLocation(city.cityName);
    }
  }

  // Convert canvas click (X%, Y%) to approximate WGS84 Lat/Lon coordinates
  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    const lon = parseFloat((-180 + (percentX / 100) * 360).toFixed(4));
    const lat = parseFloat((85 - (percentY / 100) * 170).toFixed(4));

    const nearest = ALL_PRESET_CITIES.find((p) => Math.hypot(p.x - percentX, p.y - percentY) < 3.5);

    const locationName = nearest
      ? nearest.cityName
      : `Sector (${lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}, ${lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`})`;

    const ping: PingPoint = {
      x: percentX,
      y: percentY,
      lat,
      lon,
      timestamp: Date.now(),
      locationName,
    };

    setActivePing(ping);

    if (onSelectLocation) {
      onSelectLocation(locationName);
    }
  }

  function formatCoords(lat: number, lon: number): string {
    const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
    return `${latStr}, ${lonStr}`;
  }

  const currentCountryGroup = COUNTRY_TERRITORIES.find((g) => g.country === selectedCountry) || COUNTRY_TERRITORIES[0];

  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-4 mb-6 relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Broadcast size={18} className="text-[#FF4A00] animate-pulse" />
            <span className="absolute w-3 h-3 rounded-full bg-[#FF4A00]/20 animate-ping" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest font-bold block flex items-center gap-1">
              ⚡ TACTICAL TERRITORY RADAR SCAN
            </span>
            <span className="font-mono text-[10px] text-[#A3A3A3]">
              Live Territory Discovery • Click map grid or select country & famous cities
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Badge className="font-mono text-[10px] uppercase bg-[#FF4A00]/15 text-[#FF4A00] border-[#FF4A00]/40 flex items-center gap-1 rounded-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A00] animate-pulse" />
            RADAR: ACTIVE
          </Badge>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRotating((prev) => !prev)}
            className="text-[11px] font-mono border-[#262626] bg-[#080808] text-[#E5E0D8] h-7 px-2 flex items-center gap-1 hover:bg-[#FF4A00] hover:text-[#080808] rounded-none"
          >
            {isRotating ? <Pause size={12} /> : <Play size={12} />}
            {isRotating ? 'Freeze' : 'Sweep'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSweepSpeed((prev) => (prev === 'normal' ? 'fast' : 'normal'))}
            className="text-[11px] font-mono border-[#262626] bg-[#080808] text-[#E5E0D8] h-7 px-2 flex items-center gap-1 hover:bg-[#FF4A00] hover:text-[#080808] rounded-none"
          >
            <Lightning size={12} className={sweepSpeed === 'fast' ? 'text-[#FF4A00] font-bold' : ''} />
            {sweepSpeed === 'fast' ? 'Fast (2s)' : '4s Sweep'}
          </Button>
        </div>
      </div>

      {/* Main Radar Screen Display Container */}
      <div
        ref={containerRef}
        onClick={handleMapClick}
        className="relative w-full h-[260px] sm:h-[300px] bg-[#080808] border border-[#262626] cursor-crosshair overflow-hidden select-none group"
      >
        {/* Polar Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 border border-[#262626] rounded-full scale-125" />
          <div className="absolute inset-0 border border-[#262626] rounded-full scale-90" />
          <div className="absolute inset-0 border border-[#262626] rounded-full scale-50" />
          <div className="absolute inset-0 border border-[#262626] rounded-full scale-25" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#FF4A00]/40" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#FF4A00]/40" />
        </div>

        {/* Continental Vector Outlines */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#262626" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#262626" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="250" y1="0" x2="250" y2="500" stroke="#262626" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="750" y1="0" x2="750" y2="500" stroke="#262626" strokeWidth="0.5" strokeDasharray="2 4" />

          {/* North America */}
          <path d="M 120 70 Q 180 60, 240 80 T 320 120 T 260 220 T 180 260 T 140 180 T 90 120 Z" fill="rgba(21, 21, 21, 0.6)" stroke="#404040" strokeWidth="0.8" />
          {/* South America */}
          <path d="M 280 270 Q 340 290, 360 360 T 310 460 T 260 380 T 270 300 Z" fill="rgba(21, 21, 21, 0.6)" stroke="#404040" strokeWidth="0.8" />
          {/* Europe */}
          <path d="M 450 80 Q 520 70, 560 110 T 520 180 T 460 160 T 440 110 Z" fill="rgba(21, 21, 21, 0.6)" stroke="#404040" strokeWidth="0.8" />
          {/* Africa */}
          <path d="M 440 190 Q 540 180, 580 250 T 520 380 T 450 340 T 430 240 Z" fill="rgba(21, 21, 21, 0.6)" stroke="#404040" strokeWidth="0.8" />
          {/* Asia */}
          <path d="M 570 90 Q 720 70, 880 120 T 840 260 T 700 240 T 600 180 Z" fill="rgba(21, 21, 21, 0.6)" stroke="#404040" strokeWidth="0.8" />
          {/* India Subcontinent */}
          <path d="M 640 190 L 710 190 L 680 270 Z" fill="rgba(255, 74, 0, 0.15)" stroke="#FF4A00" strokeWidth="1" />
          {/* Australia */}
          <path d="M 780 340 Q 880 330, 910 390 T 840 450 T 770 410 Z" fill="rgba(21, 21, 21, 0.6)" stroke="#404040" strokeWidth="0.8" />
        </svg>

        {/* 360° Radar Sweep */}
        {isRotating && (
          <div
            className={`absolute left-1/2 top-1/2 w-[600px] h-[600px] -ml-[300px] -mt-[300px] pointer-events-none origin-center ${
              sweepSpeed === 'fast' ? 'animate-[spin_2s_linear_infinite]' : 'animate-[spin_4s_linear_infinite]'
            }`}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(255, 74, 0, 0.35) 0deg, rgba(255, 74, 0, 0.05) 45deg, transparent 90deg, transparent 360deg)',
              }}
            />
            <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-gradient-to-t from-[#FF4A00] via-[#FF4A00] to-transparent shadow-[0_0_8px_#FF4A00]" />
          </div>
        )}

        {/* Distance Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[120px] h-[120px] rounded-full border border-[#FF4A00]/20 border-dashed relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] text-[#FF4A00]/70">1,000 KM</span>
          </div>
          <div className="w-[240px] h-[240px] rounded-full border border-[#FF4A00]/15 border-dashed absolute">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] text-[#FF4A00]/50">5,000 KM</span>
          </div>
        </div>

        {/* Cardinal Markers */}
        <span className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#A3A3A3]/70 pointer-events-none">0° N</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#A3A3A3]/70 pointer-events-none">180° S</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#A3A3A3]/70 pointer-events-none">270° W</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#A3A3A3]/70 pointer-events-none">90° E</span>

        {/* Tactical City Map Nodes - De-cluttered & Filtered */}
        {ALL_PRESET_CITIES.map((city) => {
          const isSelectedCountryCity = city.country === selectedCountry;
          const isCurrent = currentLocation.toLowerCase().includes(city.name.toLowerCase()) || currentLocation.toLowerCase().includes(city.cityName.toLowerCase().split(',')[0]);

          return (
            <div
              key={city.id}
              style={{ left: `${city.x}%`, top: `${city.y}%` }}
              onMouseEnter={() => setHoveredLocation(city)}
              onMouseLeave={() => setHoveredLocation(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCountry(city.country);
                handleSelectCity(city);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1 z-20 group/dot"
            >
              <div className="relative flex items-center justify-center">
                {isSelectedCountryCity ? (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCurrent
                          ? 'bg-[#FF4A00] shadow-[0_0_12px_#FF4A00]'
                          : 'bg-[#FF4A00]/90 hover:bg-[#FF4A00] shadow-[0_0_6px_rgba(255,74,0,0.6)]'
                      } transition-colors`}
                    />
                    <span
                      className={`absolute w-4 h-4 rounded-full ${
                        isCurrent ? 'bg-[#FF4A00]/30 animate-ping' : 'bg-[#FF4A00]/15'
                      }`}
                    />
                  </>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-[#525252] opacity-40 hover:opacity-100 hover:bg-[#FF4A00] hover:scale-150 transition-all" />
                )}
              </div>

              {/* Tactical Tooltip Card */}
              <div className="absolute left-1/2 -translate-x-1/2 top-4 hidden group-hover/dot:block z-30 whitespace-nowrap bg-[#080808] border border-[#FF4A00]/60 px-2.5 py-1.5 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                <p className="font-mono text-[10px] text-[#F4F0E8] font-bold flex items-center gap-1">
                  <span>{city.countryFlag}</span>
                  <span>{city.cityName}</span>
                </p>
                <p className="font-mono text-[9px] text-[#FF4A00]">{formatCoords(city.lat, city.lon)}</p>
              </div>
            </div>
          );
        })}

        {/* Active Lock Crosshair */}
        {activePing && (
          <div
            key={activePing.timestamp}
            style={{ left: `${activePing.x}%`, top: `${activePing.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full border border-[#FF4A00]/80 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] absolute" />
            <div className="w-5 h-5 rounded-full border border-[#FF4A00] flex items-center justify-center bg-[#FF4A00]/15 shadow-[0_0_14px_#FF4A00]">
              <Crosshair size={14} className="text-[#FF4A00] animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Target Readout & Lock Button Bar */}
      <div className="mt-2.5 pt-2.5 border-t border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#080808] p-2.5">
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-[#FF4A00] shrink-0" />
          <div>
            <span className="font-mono text-[9px] uppercase text-[#A3A3A3] tracking-wider block">
              {hoveredLocation ? `TARGET DETECTED: ${hoveredLocation.countryFlag} ${hoveredLocation.country}` : 'TARGET SECTOR LOCKED'}
            </span>
            <span className="font-mono text-xs font-bold text-[#F4F0E8]">
              {hoveredLocation ? hoveredLocation.cityName : activePing ? activePing.locationName : currentLocation}
            </span>
          </div>
        </div>

        {activePing && (
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-[#101010] px-2.5 py-1 border border-[#262626] flex items-center gap-2">
              <Compass size={14} className="text-[#00E599]" />
              <span className="text-[#A3A3A3] text-[10px]">COORDS:</span>
              <span className="text-[#FF4A00] font-bold">{formatCoords(activePing.lat, activePing.lon)}</span>
            </div>

            {onSelectLocation && (
              <Button
                size="sm"
                onClick={() => onSelectLocation(activePing.locationName)}
                className="bg-[#FF4A00] hover:bg-[#FF4A00]/90 text-[#080808] font-bold text-[11px] font-mono h-7 px-3 flex items-center gap-1.5 rounded-none"
              >
                Scan Target Sector ➔
              </Button>
            )}
          </div>
        )}
      </div>

      {/* COUNTRY & FAMOUS CITIES DIRECTORY SELECTOR */}
      <div className="mt-4 pt-4 border-t border-[#262626] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest font-bold flex items-center gap-1.5">
            <Globe size={14} />
            COUNTRY & FAMOUS CITIES DIRECTORY
          </span>
          <span className="font-mono text-[10px] text-[#A3A3A3] uppercase">
            Click country to view famous cities • Click city to lock radar
          </span>
        </div>

        {/* Country Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {COUNTRY_TERRITORIES.map((group) => {
            const isSelected = selectedCountry === group.country;
            return (
              <button
                key={group.countryCode}
                type="button"
                onClick={() => setSelectedCountry(group.country)}
                className={`font-mono text-xs px-3 py-1.5 border transition-colors flex items-center gap-1.5 rounded-none ${
                  isSelected
                    ? 'bg-[#FF4A00]/20 border-[#FF4A00] text-[#FF4A00] font-bold shadow-[0_0_10px_rgba(255,74,0,0.2)]'
                    : 'bg-[#080808] border-[#262626] text-[#E5E0D8] hover:border-[#FF4A00]/50 hover:text-[#F4F0E8]'
                }`}
              >
                <span>{group.flag}</span>
                <span>{group.country}</span>
                <span className="text-[9px] text-[#A3A3A3] font-normal">({group.cities.length})</span>
              </button>
            );
          })}
        </div>

        {/* Famous Cities Pills for Selected Country */}
        <div className="bg-[#080808] border border-[#262626] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A3A3A3] pb-1 border-b border-[#262626]">
            <span className="flex items-center gap-1.5">
              <span>{currentCountryGroup.flag}</span>
              <span className="text-[#F4F0E8] font-bold uppercase">{currentCountryGroup.country}</span>
              <span>— Famous Prospecting Cities:</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {currentCountryGroup.cities.map((city) => {
              const isSelectedCity = currentLocation.toLowerCase().includes(city.name.toLowerCase());
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={`font-mono text-xs px-3 py-1.5 border transition-all flex items-center gap-2 rounded-none ${
                    isSelectedCity
                      ? 'bg-[#FF4A00] text-[#080808] border-[#FF4A00] font-bold shadow-[0_0_12px_#FF4A00]'
                      : 'bg-[#101010] text-[#F4F0E8] border-[#262626] hover:bg-[#FF4A00]/20 hover:border-[#FF4A00] hover:text-[#FF4A00]'
                  }`}
                >
                  <MapPin size={12} className={isSelectedCity ? 'text-[#080808]' : 'text-[#FF4A00]'} />
                  <span>{city.name}</span>
                  {isSelectedCity && <Check size={12} className="text-[#080808] font-bold shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

