import { MapPin, Globe, CheckCircle } from '@phosphor-icons/react';

export function DiscoveryComparison() {
  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div>
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest block font-bold">
            02. DISCOVERY METAPHOR
          </span>
          <h3 className="font-serif text-2xl text-[#F4F0E8] mt-1" style={{ color: '#F4F0E8' }}>
            Why Map Search Is Not Enough
          </h3>
        </div>
      </div>

      <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed">
        Traditional map-based business discovery (Geoapify, OpenStreetMap, Google Places) excels at physical storefronts with registered address markers. However, it leaves a significant blind spot for digital-first SMBs, freelancers, creators, and early-stage startups that live primarily on social networks or Linktree before establishing a physical map listing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Map Search */}
        <div className="bg-[#080808] border border-[#262626] p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="text-[#38BDF8] uppercase font-bold flex items-center gap-1.5">
              <MapPin size={16} /> TRADITIONAL MAP SEARCH
            </span>
            <span className="text-[10px] text-[#8E8982]">GEOAPIFY / OSM</span>
          </div>

          <div className="space-y-2 text-[#E5E0D8] font-sans text-xs">
            <div className="p-2 bg-[#101010] border border-[#222222] font-mono text-[11px] text-[#38BDF8]">
              MAP POI ──► Physical Storefronts ──► Address Listing
            </div>
            <ul className="space-y-1.5 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-[#38BDF8]">•</span> Best for restaurants, clinics, repair shops, & physical stores.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#38BDF8]">•</span> Requires registered physical address or geo coordinates.
              </li>
              <li className="flex items-start gap-1.5 opacity-60">
                <span>✕</span> Misses early-stage startups without registered map listings.
              </li>
            </ul>
          </div>
        </div>

        {/* Social X-Ray */}
        <div className="bg-[#080808] border border-[#FF4A00]/40 p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="text-[#FF4A00] uppercase font-bold flex items-center gap-1.5">
              <Globe size={16} /> SOCIAL X-RAY DISCOVERY
            </span>
            <span className="text-[10px] text-[#FF4A00] bg-[#FF4A00]/10 px-1.5 py-0.5 border border-[#FF4A00]/30 font-bold">
              DIGITAL FIRST
            </span>
          </div>

          <div className="space-y-2 text-[#E5E0D8] font-sans text-xs">
            <div className="p-2 bg-[#101010] border border-[#FF4A00]/30 font-mono text-[11px] text-[#FF4A00]">
              SOCIAL X-RAY ──► Indexed Profiles ──► Digital Candidates
            </div>
            <ul className="space-y-1.5 pt-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle size={14} className="text-[#00E599] shrink-0 mt-0.5" />
                <span>Surfaces creators, design studios, startups, & Linktree users.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle size={14} className="text-[#00E599] shrink-0 mt-0.5" />
                <span>Targeted operators: domain + intent + location + contact signals.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle size={14} className="text-[#00E599] shrink-0 mt-0.5" />
                <span>Complements map POI discovery to eliminate prospect blind spots.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
