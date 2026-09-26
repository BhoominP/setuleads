import { DiscoveryComparison } from './DiscoveryComparison';
import { XRayPipeline } from './XRayPipeline';
import { QueryPatternTabs } from './QueryPatternTabs';
import { SmartTextHarvesterDemo } from './SmartTextHarvesterDemo';
import { LimitationsPanel } from './LimitationsPanel';

export function SocialXRayCaseStudy() {
  return (
    <div className="space-y-8 font-sans">
      {/* Chapter 01: The Discovery Gap */}
      <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest font-bold">
            01. THE DISCOVERY GAP
          </span>
          <span className="font-mono text-[10px] text-[#8E8982] bg-[#080808] border border-[#222222] px-2 py-0.5">
            CASE STUDY CHAPTER
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-[#F4F0E8] font-normal" style={{ color: '#F4F0E8' }}>
          Finding Prospects That Live Beyond Map Coordinates
        </h2>

        <p className="font-sans text-sm text-[#E5E0D8] max-w-3xl leading-relaxed">
          Map discovery was useful for local storefronts, but it had a clear blind spot: businesses that lived primarily on social platforms,Linktree, or independent creator indexes.
        </p>

        <p className="font-sans text-sm text-[#E5E0D8] max-w-3xl leading-relaxed">
          That led to <strong>Social X-Ray</strong> — a targeted discovery strategy built around domain operators, intent terms, location signals, and publicly indexed contact patterns.
        </p>
      </div>

      {/* Chapter 02: Map vs X-Ray Comparison */}
      <DiscoveryComparison />

      {/* Chapter 04: Query → Result Pipeline */}
      <XRayPipeline />

      {/* Chapter 05: Query Patterns */}
      <QueryPatternTabs />

      {/* Chapter 06: Smart Text Harvester */}
      <SmartTextHarvesterDemo />

      {/* Chapter 07: Why It Matters */}
      <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-6">
        <div className="border-b border-[#222222] pb-4">
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest block font-bold">
            07. WHY X-RAY SEARCH MATTERS
          </span>
          <h3 className="font-serif text-2xl text-[#F4F0E8] mt-1" style={{ color: '#F4F0E8' }}>
            Engineering Benefits & Architectural Value
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-[#080808] border border-[#262626] p-4 space-y-2">
            <span className="text-[#FF4A00] font-bold text-sm">01 — DISCOVERY DIVERSITY</span>
            <p className="font-sans text-xs text-[#E5E0D8]">Adds indexed social/digital discovery alongside traditional geospatial sources.</p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-4 space-y-2">
            <span className="text-[#00E599] font-bold text-sm">02 — DIGITAL-FIRST COVERAGE</span>
            <p className="font-sans text-xs text-[#E5E0D8]">Surfaces businesses operating primarily through social media or Linktree without a traditional map listing.</p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-4 space-y-2">
            <span className="text-[#38BDF8] font-bold text-sm">03 — TARGETED SEARCH</span>
            <p className="font-sans text-xs text-[#E5E0D8]">Combines domain, intent, location, and contact patterns for high-precision queries.</p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-4 space-y-2">
            <span className="text-[#FFB800] font-bold text-sm">04 — MULTI-SOURCE SIGNALS</span>
            <p className="font-sans text-xs text-[#E5E0D8]">Social results complement Geoapify and OpenStreetMap candidates to build rich prospect profiles.</p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-4 space-y-2">
            <span className="text-[#FF4A00] font-bold text-sm">05 — LOW-FRICTION DISCOVERY</span>
            <p className="font-sans text-xs text-[#E5E0D8]">The same operator pattern can be adapted across industries, geographic markets, and social networks.</p>
          </div>

          <div className="bg-[#080808] border border-[#262626] p-4 space-y-2">
            <span className="text-[#00E599] font-bold text-sm">06 — HUMAN-IN-THE-LOOP</span>
            <p className="font-sans text-xs text-[#E5E0D8]">Integrates with Smart Text Harvester so users preview and validate extracted candidates before saving.</p>
          </div>
        </div>
      </div>

      {/* Chapter 08: Limitations */}
      <LimitationsPanel />
    </div>
  );
}
