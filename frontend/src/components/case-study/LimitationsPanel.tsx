import { WarningOctagon, ShieldCheck } from '@phosphor-icons/react';

const LIMITATIONS = [
  'Search engine indexing coverage varies across social platforms and regions.',
  'Public search engine snippets can occasionally contain stale or truncated text.',
  'Social network profiles may represent personal creators rather than operating commercial businesses.',
  'Similar business names across different cities can produce false-positive matches.',
  'Search engine ranking and indexing algorithms change dynamically over time.',
  'Automated search queries are subject to provider terms, rate limits, and anti-bot protections.',
  'Extracted contact details require human preview and semantic AI qualification before outreach.',
];

export function LimitationsPanel() {
  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div>
          <span className="font-mono text-xs uppercase text-[#FFB800] tracking-widest block font-bold">
            08. HONEST ENGINEERING LIMITATIONS
          </span>
          <h3 className="font-serif text-2xl text-[#F4F0E8] mt-1" style={{ color: '#F4F0E8' }}>
            System Constraints & Trade-Offs
          </h3>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/30 px-2.5 py-1 font-bold">
          <WarningOctagon size={14} />
          <span>EVIDENCE LAYER, NOT GROUND TRUTH</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed">
          SetuLeads explicitly treats Social X-Ray as a <strong>candidate discovery & evidence layer</strong> rather than an absolute ground truth database. No false claims of "100% extraction" or "guaranteed leads" are made.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {LIMITATIONS.map((item, idx) => (
            <div key={idx} className="bg-[#080808] border border-[#222222] p-3 flex items-start gap-2.5 font-mono text-xs text-[#E5E0D8]">
              <span className="text-[#FFB800] font-bold shrink-0">{idx + 1}.</span>
              <span className="font-sans text-xs leading-normal">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#080808] border border-[#00E599]/30 p-4 flex items-center justify-between font-mono text-xs text-[#00E599]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} />
          <span className="font-bold">DESIGN PRINCIPLE: SEARCH RESULT ≠ QUALIFIED BUSINESS</span>
        </div>
        <span className="text-[#8E8982] text-[10px] hidden sm:inline">Requires Gemini Qualification & Inspection</span>
      </div>
    </div>
  );
}
