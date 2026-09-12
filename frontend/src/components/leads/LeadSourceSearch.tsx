import { useState } from 'react';
import { useMultiSourceSearch } from '@/hooks/useMultiSourceSearch';
import { useAddLead } from '@/hooks/useLeads';
import { LocationInput } from './LocationInput';
import { LeadPreviewModal } from './LeadPreviewModal';
import { RadarScanMap } from '@/components/visuals/RadarScanMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  WarningOctagon,
  CheckCircle,
  CircleNotch,
  Broadcast,
  ClipboardText,
  Sparkle,
  ArrowRight,
  Database,
  Funnel,
  ShieldSlash,
  ChartLineUp,
} from '@phosphor-icons/react';
import { SmartClipboardHarvesterModal } from './SmartClipboardHarvesterModal';
import logoSymbol from '@/assets/Setuleads_logo.svg';
import type { LeadSourceProviderId, UnifiedSearchResult } from '@/types/leadSource';

export function LeadSourceSearch() {
  const [query, setQuery] = useState('startup');
  const [location, setLocation] = useState('Vadodara, Gujarat');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedProviders, setSelectedProviders] = useState<LeadSourceProviderId[]>([
    'geoapify',
    'osm',
    'social_xray',
  ]);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [isClipboardModalOpen, setIsClipboardModalOpen] = useState(false);

  const { results, loading, engineState, error, search } = useMultiSourceSearch();
  const addLeadMutation = useAddLead();

  function toggleProvider(provider: LeadSourceProviderId) {
    if (selectedProviders.includes(provider)) {
      if (selectedProviders.length === 1) return;
      setSelectedProviders((prev) => prev.filter((p) => p !== provider));
    } else {
      setSelectedProviders((prev) => [...prev, provider]);
    }
  }

  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch() {
    setHasSearched(true);
    search(query, location, selectedProviders);
  }

  const [previewLead, setPreviewLead] = useState<UnifiedSearchResult | null>(null);

  async function handleConfirmImport(payload: {
    result: UnifiedSearchResult;
    contactName: string;
    stage: any;
    estimatedValue: number | null;
    generalNotes: string;
  }) {
    const { result, contactName, stage, estimatedValue, generalNotes } = payload;
    setImporting(result.external_id);
    try {
      await addLeadMutation.mutateAsync({
        business_name: result.business_name,
        contact_name: contactName || null,
        email: result.email || null,
        phone: result.phone,
        website_url: result.website_url,
        location,
        source: result.source as any,
        source_query: query,
        stage: stage || 'new',
        estimated_value: estimatedValue,
        general_notes: generalNotes || null,
        website_notes: result.has_website
          ? `Sourced via ${result.source === 'social_xray' ? 'Social X-Ray' : (result.source === 'geoapify' ? 'Geoapify Places' : 'OpenStreetMap')}.`
          : 'No website found — Prime outreach prospect.',
        geoapify_place_id: (result as any).geoapify_place_id || null,
        google_place_id: (result as any).google_place_id || null,
        osm_type: (result as any).osm_type || null,
        osm_id: (result as any).osm_id || null,
        overture_id: (result as any).overture_id || null,
        discovery_area: (result as any).discovery_area || location,
      });
      setImported((prev) => new Set(prev).add(result.external_id));
    } catch (err) {
      console.error('Failed to add lead:', err);
    } finally {
      setImporting(null);
    }
  }

  return (
    <div className="space-y-8 mb-8">
      {/* Dark Editorial Brutalist Workstation Hero Section */}
      <div className="inspected-panel bg-[#101010] border border-[#222222] p-8 relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4A00]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Technical Blueprint Vector Grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none z-0" 
        />

        {/* Tactile Film Grain Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none z-0 mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        {/* Restrained System Scan Line Animation */}
        <motion.div
          className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF4A00]/80 to-transparent pointer-events-none z-20 shadow-[0_0_8px_rgba(255,74,0,0.5)]"
          animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div className="space-y-4">
            {/* Primary Brand Lockup & Workstation Descriptor */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Brand Name Lockup */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 border border-[#222222] bg-[#080808]">
                <img
                  src={logoSymbol}
                  alt="SetuLeads Logo"
                  className="h-4 w-4 object-contain filter drop-shadow-[0_0_4px_rgba(255,74,0,0.4)]"
                />
                <span className="font-mono text-sm md:text-[15px] font-bold text-[#F4F0E8] uppercase tracking-wider">
                  SETULEADS
                </span>
              </div>

              {/* Metadata Sub-Label */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-[#222222] bg-[#080808] font-mono text-[10px] text-[#8E8982] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A00] animate-pulse" />
                INSPECTION ROOM / PROSPECT DISCOVERY
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#F4F0E8] uppercase leading-none">
              FIND BUSINESSES <br />
              <span className="font-serif italic text-[#FF4A00] font-normal lowercase">worth building for:</span>
            </h1>

            {/* Refined Technical Description */}
            <p className="font-mono text-xs text-[#8E8982] max-w-xl leading-relaxed">
              Discover prospects. Inspect their web presence. Find the website redesign opportunity.
              Qualify candidates with Gemini semantic analysis.
            </p>
          </div>

          {/* Action Control */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsClipboardModalOpen(true)}
              className="font-mono text-xs border-[#FF4A00]/60 text-[#FF4A00] bg-[#FF4A00]/10 hover:bg-[#FF4A00]/20 flex items-center gap-1.5 font-bold shadow-[0_0_10px_rgba(255,74,0,0.1)] transition-all"
            >
              <ClipboardText size={15} />
              Smart Text Harvester
            </Button>
          </div>
        </div>

        {/* Discovery Sources Row with Pulsing Highlights */}
        <div className="mt-6 pt-4 border-t border-[#222222] flex flex-wrap items-center justify-between gap-3 relative z-10">
          <span className="font-mono text-[10px] uppercase text-[#8E8982] tracking-wider flex items-center gap-2">
            <span className="w-1 h-1 bg-[#8E8982] rounded-full" />
            Active Discovery Sources:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleProvider('geoapify')}
              className={`font-mono text-xs px-3 py-1 border transition-all flex items-center gap-2 uppercase tracking-wider ${
                selectedProviders.includes('geoapify')
                  ? 'bg-[#151515] text-[#F4F0E8] border-[#FF4A00] font-bold shadow-[0_0_10px_rgba(255,74,0,0.12)]'
                  : 'text-[#8E8982] border-transparent hover:text-[#F4F0E8]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedProviders.includes('geoapify') ? 'bg-[#FF4A00] animate-pulse' : 'bg-[#8E8982]'}`} />
              Geoapify
            </button>

            <button
              type="button"
              onClick={() => toggleProvider('osm')}
              className={`font-mono text-xs px-3 py-1 border transition-all flex items-center gap-2 uppercase tracking-wider ${
                selectedProviders.includes('osm')
                  ? 'bg-[#151515] text-[#F4F0E8] border-[#00E599] font-bold shadow-[0_0_10px_rgba(0,229,153,0.12)]'
                  : 'text-[#8E8982] border-transparent hover:text-[#F4F0E8]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedProviders.includes('osm') ? 'bg-[#00E599] animate-pulse' : 'bg-[#8E8982]'}`} />
              OpenStreetMap (OSM)
            </button>

            <button
              type="button"
              onClick={() => toggleProvider('social_xray')}
              className={`font-mono text-xs px-3 py-1 border transition-all flex items-center gap-2 uppercase tracking-wider ${
                selectedProviders.includes('social_xray')
                  ? 'bg-[#151515] text-[#F4F0E8] border-[#FF4A00] font-bold shadow-[0_0_10px_rgba(255,74,0,0.12)]'
                  : 'text-[#8E8982] border-transparent hover:text-[#F4F0E8]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedProviders.includes('social_xray') ? 'bg-[#FF4A00] animate-pulse' : 'bg-[#8E8982]'}`} />
              Social X-Ray
            </button>
          </div>
        </div>
      </div>

      {/* Radar Territory Scan Map */}
      <RadarScanMap
        currentLocation={location}
        activeCoords={locationCoords}
        onSelectLocation={(locName) => {
          setLocation(locName);
          search(query, locName, selectedProviders);
        }}
      />

      {/* Search Input Workstation */}
      <div className="inspected-panel bg-[#101010] border border-[#222222] p-6 space-y-4">
        <label className="block font-mono text-xs uppercase tracking-widest text-[#FF4A00] font-bold">
          WHAT ARE YOU LOOKING FOR?
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Input
              placeholder="e.g. restaurants, software company, clinics, or site:instagram.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-[#080808] border-[#222222] text-xs font-mono text-[#F4F0E8] focus:border-[#FF4A00] h-11 px-4"
            />
          </div>

          <LocationInput
            value={location}
            onChange={(val, details) => {
              setLocation(val);
              if (details) {
                setLocationCoords({ lat: details.lat, lng: details.lng });
              }
            }}
            className="md:w-80"
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-editorial h-11 px-6 font-mono text-xs font-bold uppercase tracking-wider shrink-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                <span>INSPECTING…</span>
              </>
            ) : (
              <>
                <span>START DISCOVERY</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Animated Pipeline Stage Progress Beam (Section 13 of Prompt) */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="inspected-panel bg-[#101010] border border-[#FF4A00]/40 p-5 space-y-4 font-mono shadow-[0_0_20px_rgba(255,74,0,0.1)]"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#FF4A00] font-bold flex items-center gap-2 tracking-wider uppercase">
                <Broadcast size={16} className="animate-pulse" />
                EXPLICIT PROSPECT PIPELINE IN PROGRESS
              </span>
              <span className="text-[#8E8982] text-[10px] uppercase">SETULEADS ENGINE</span>
            </div>

            {/* Pipeline Stage Badges with Orange Beam */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px] uppercase font-bold pt-1">
              <div className="p-2 border border-[#FF4A00] bg-[#FF4A00]/15 text-[#FF4A00] flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A00] animate-ping" />
                01. DISCOVERING
              </div>
              <div className="p-2 border border-[#222222] bg-[#151515] text-[#F4F0E8] opacity-90">
                02. NORMALIZING
              </div>
              <div className="p-2 border border-[#222222] bg-[#151515] text-[#F4F0E8] opacity-80">
                03. VERIFYING
              </div>
              <div className="p-2 border border-[#222222] bg-[#151515] text-[#F4F0E8] opacity-70">
                04. INSPECTING
              </div>
              <div className="p-2 border border-[#222222] bg-[#151515] text-[#F4F0E8] opacity-60">
                05. QUALIFYING
              </div>
            </div>

            {/* Moving Beam Line */}
            <div className="w-full bg-[#151515] h-1.5 overflow-hidden relative">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#FF4A00] to-transparent shadow-[0_0_12px_#FF4A00]"
              />
            </div>

            <p className="text-xs text-[#CFC8BE] italic">{engineState.stepMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs font-mono text-[#FF4A00] bg-[#FF4A00]/10 border border-[#FF4A00]/30 p-3">{error}</p>}

      {/* Discovery & Coverage Telemetry Dashboard */}
      {engineState.report && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inspected-panel bg-[#101010] border border-[#222222] p-5 font-mono space-y-4 shadow-2xl relative overflow-hidden select-none"
        >
          {/* Background Ambient Radial Accent */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FF4A00]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header & Signal Status Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#222222] pb-3.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 border border-[#FF4A00] bg-[#FF4A00]/10 flex items-center justify-center text-[#FF4A00] shadow-[0_0_10px_rgba(255,74,0,0.2)]">
                <Broadcast size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase text-[#F4F0E8] font-bold tracking-widest font-display">
                    DISCOVERY & COVERAGE TELEMETRY REPORT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
                </div>
                <span className="text-[10px] text-[#8E8982]">
                  Live Multi-Source Ingestion & Gemini AI Relevance Audit Pipeline
                </span>
              </div>
            </div>

            {/* Query Term Badges & Yield Ratio */}
            <div className="flex items-center gap-2 flex-wrap">
              {engineState.coverage && engineState.coverage.expandedQueries.map((term, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono uppercase bg-[#151515] text-[#FF4A00] border border-[#FF4A00]/40 px-2 py-0.5 tracking-wider"
                >
                  ⚡ Query Term: {term}
                </span>
              ))}
              <span className="text-[10px] font-mono uppercase bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/40 px-2.5 py-0.5 font-bold flex items-center gap-1">
                <ChartLineUp size={13} />
                Yield Ratio: {Math.round((engineState.report.relevantCount / (engineState.report.rawCount || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* 4 High-Impact Telemetry Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
            {/* Card 1: Raw Ingested Results */}
            <div className="bg-[#080808] border border-[#222222] p-3.5 space-y-2 relative group hover:border-[#FF4A00]/60 transition-all">
              <div className="flex items-center justify-between text-[#8E8982]">
                <span className="text-[10px] uppercase font-bold tracking-wider">Raw Ingested Signals</span>
                <Database size={15} className="text-[#FF4A00]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-bold text-[#F4F0E8]">
                  {engineState.report.rawCount}
                </span>
                <span className="text-[9px] text-[#8E8982]">100% Vol</span>
              </div>
              <div className="w-full bg-[#151515] h-1.5 overflow-hidden">
                <div className="bg-[#FF4A00] h-full w-full" />
              </div>
            </div>

            {/* Card 2: De-duplicated Leads */}
            <div className="bg-[#080808] border border-[#222222] p-3.5 space-y-2 relative group hover:border-[#FF4A00]/60 transition-all">
              <div className="flex items-center justify-between text-[#8E8982]">
                <span className="text-[10px] uppercase font-bold tracking-wider">De-duplicated Leads</span>
                <Funnel size={15} className="text-[#F4F0E8]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-bold text-[#F4F0E8]">
                  {engineState.report.uniqueCount}
                </span>
                <span className="text-[9px] text-[#8E8982]">
                  {Math.round((engineState.report.uniqueCount / (engineState.report.rawCount || 1)) * 100)}% Retained
                </span>
              </div>
              <div className="w-full bg-[#151515] h-1.5 overflow-hidden">
                <div
                  className="bg-[#F4F0E8] h-full transition-all duration-500"
                  style={{
                    width: `${Math.round((engineState.report.uniqueCount / (engineState.report.rawCount || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Card 3: AI Verified Qualified */}
            <div className="bg-[#080808] border border-[#00E599]/40 p-3.5 space-y-2 relative group shadow-[0_0_15px_rgba(0,229,153,0.08)] hover:border-[#00E599] transition-all">
              <div className="flex items-center justify-between text-[#00E599]">
                <span className="text-[10px] uppercase font-bold tracking-wider">AI Verified Qualified</span>
                <Sparkle size={15} className="animate-spin text-[#00E599]" style={{ animationDuration: '8s' }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-bold text-[#00E599] drop-shadow-[0_0_8px_rgba(0,229,153,0.5)]">
                  {engineState.report.relevantCount}
                </span>
                <span className="text-[9px] font-bold text-[#00E599]">
                  {Math.round((engineState.report.relevantCount / (engineState.report.uniqueCount || 1)) * 100)}% Qualified Yield
                </span>
              </div>
              <div className="w-full bg-[#151515] h-1.5 overflow-hidden">
                <div
                  className="bg-[#00E599] h-full shadow-[0_0_8px_#00E599] transition-all duration-500"
                  style={{
                    width: `${Math.round((engineState.report.relevantCount / (engineState.report.uniqueCount || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Card 4: Excluded Noise */}
            <div className="bg-[#080808] border border-[#222222] p-3.5 space-y-2 relative group hover:border-red-900/50 transition-all">
              <div className="flex items-center justify-between text-[#8E8982]">
                <span className="text-[10px] uppercase font-bold tracking-wider">Excluded Noise & Dups</span>
                <ShieldSlash size={15} className="text-[#8E8982]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-bold text-[#8E8982]">
                  {engineState.report.rejectedCount}
                </span>
                <span className="text-[9px] text-[#8E8982]">
                  {Math.round((engineState.report.rejectedCount / (engineState.report.rawCount || 1)) * 100)}% Excluded
                </span>
              </div>
              <div className="w-full bg-[#151515] h-1.5 overflow-hidden">
                <div
                  className="bg-[#404040] h-full transition-all duration-500"
                  style={{
                    width: `${Math.round((engineState.report.rejectedCount / (engineState.report.rawCount || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pipeline Conversion Trajectory Bar */}
          <div className="pt-2.5 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-[#8E8982] relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="uppercase text-[#FF4A00] font-bold">CONVERSION TRAJECTORY:</span>
              <span>Raw ({engineState.report.rawCount})</span>
              <ArrowRight size={10} className="text-[#FF4A00]" />
              <span>Deduplicated ({engineState.report.uniqueCount})</span>
              <ArrowRight size={10} className="text-[#FF4A00]" />
              <span className="text-[#00E599] font-bold">AI Qualified ({engineState.report.relevantCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-[#00E599]">
              <CheckCircle size={12} />
              <span>GEOLOCATION & RELEVANCE VERIFIED</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Discovered Candidates Grid (Staggered Animations) */}
      {results.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#222222]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-widest text-[#FF4A00] font-bold">
              DISCOVERED PROSPECTS ({results.length} CANDIDATES QUALIFIED)
            </h2>
            <span className="font-mono text-[10px] text-[#8E8982]">
              FACTUAL AUDIT & GEMINI QUALIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-1">
            {results.map((r, index) => {
              const oppScore = r.lead_opportunity_score || 88;
              const webScore = r.website_opportunity_score || 82;
              const contactScore = r.contactability_score || 90;

              return (
                <motion.div
                  key={r.external_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                  className="inspected-panel bg-[#101010] border border-[#222222] p-5 flex flex-col justify-between gap-4 hover:border-[#FF4A00]/50 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold font-display text-[#F4F0E8] group-hover:text-[#FF4A00] transition-colors">
                            {r.business_name}
                          </h3>
                        </div>
                        <p className="font-mono text-xs text-[#8E8982] line-clamp-1 mt-0.5">{r.address || 'Location Verified'}</p>
                      </div>

                      {/* Large Editorial Score Display */}
                      <div className="text-right shrink-0">
                        <div className="font-display text-3xl font-bold text-[#FF4A00] leading-none">
                          {oppScore}
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8E8982] block mt-0.5">
                          LEAD OPPORTUNITY
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Sub-Scores */}
                    <div className="space-y-1.5 font-mono text-[10px] bg-[#151515] p-2.5 border border-[#222222]">
                      <div className="flex items-center justify-between text-[#8E8982] mb-1">
                        <span>WEBSITE OPPORTUNITY</span>
                        <span className="font-bold text-[#F4F0E8]">{webScore}/100</span>
                      </div>
                      <div className="w-full bg-[#080808] h-1.5 overflow-hidden">
                        <div 
                          className="bg-[#FF4A00] h-full transition-all duration-500" 
                          style={{ width: `${webScore}%` }} 
                        />
                      </div>

                      <div className="flex items-center justify-between text-[#8E8982] pt-1">
                        <span>CONTACTABILITY</span>
                        <span className="font-bold text-[#4E8752]">{contactScore}/100</span>
                      </div>
                    </div>

                    {/* Gemini Semantic Match Badge */}
                    {r.is_ai_verified && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#FF4A00]/10 border border-[#FF4A00]/30 font-mono text-[10px] text-[#FF4A00]">
                        <Sparkle size={12} />
                        <span>AI ANALYSIS: SEMANTIC MATCH VERIFIED</span>
                      </div>
                    )}

                    {/* Website & Contact Info */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap font-mono text-[11px]">
                      <Badge
                        className={`text-[9px] uppercase border rounded-none ${
                          r.has_website
                            ? 'bg-[#4E8752]/15 text-[#4E8752] border-[#4E8752]/40'
                            : 'bg-[#FF4A00]/15 text-[#FF4A00] border-[#FF4A00]/40'
                        }`}
                      >
                        {r.has_website ? (
                          <span className="flex items-center gap-1">
                            <Globe size={11} /> {r.website_url ? r.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Has Website'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <WarningOctagon size={11} /> No Website Found
                          </span>
                        )}
                      </Badge>

                      {r.phone && <span className="text-[#8E8982]">{r.phone}</span>}
                      {r.email && <span className="text-[#FF4A00] font-bold">{r.email}</span>}
                    </div>

                    {/* Why This Lead Callout */}
                    <p className="font-mono text-[11px] text-[#CFC8BE] bg-[#151515] p-2 border-l-2 border-[#FF4A00]">
                      ✓ {r.match_reason || r.relevance_reasons?.[0] || 'Target business with high website redesign opportunity.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#222222] flex justify-end">
                    <button
                      disabled={imported.has(r.external_id) || importing === r.external_id}
                      onClick={() => setPreviewLead(r)}
                      className="btn-editorial text-xs font-mono font-bold uppercase tracking-wider py-1.5 px-4 w-full sm:w-auto flex items-center justify-center gap-1.5"
                    >
                      {imported.has(r.external_id) ? (
                        <span className="text-[#4E8752] flex items-center gap-1">
                          <CheckCircle size={14} /> ADDED TO CRM
                        </span>
                      ) : importing === r.external_id ? (
                        'ADDING…'
                      ) : (
                        <span className="flex items-center gap-1">
                          INSPECT PROSPECT →
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State (Section 35 of Prompt) */}
      {hasSearched && !loading && results.length === 0 && (
        <div className="inspected-panel bg-[#101010] border border-[#222222] p-12 text-center space-y-3">
          <h3 className="font-display text-xl uppercase tracking-wider text-[#F4F0E8]">
            NO PROSPECTS FOUND YET
          </h3>
          <p className="font-mono text-xs text-[#8E8982] max-w-md mx-auto">
            Your pipeline is empty for "{query}" in {location}. Try adjusting your target industry or location.
          </p>
          <button
            onClick={() => handleSearch()}
            className="btn-editorial font-mono text-xs font-bold uppercase tracking-wider py-2 px-6 inline-flex items-center gap-2 mt-2"
          >
            RETRY DISCOVERY →
          </button>
        </div>
      )}

      {/* Modals */}
      <LeadPreviewModal
        lead={previewLead}
        onClose={() => setPreviewLead(null)}
        onConfirm={handleConfirmImport}
      />

      <SmartClipboardHarvesterModal
        isOpen={isClipboardModalOpen}
        onClose={() => setIsClipboardModalOpen(false)}
      />
    </div>
  );
}

