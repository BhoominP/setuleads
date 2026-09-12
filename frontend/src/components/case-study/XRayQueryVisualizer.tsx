import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Compass, MapPin, EnvelopeSimple, CursorClick } from '@phosphor-icons/react';

interface QuerySegment {
  id: string;
  token: string;
  badge: string;
  icon: any;
  title: string;
  color: string;
  description: string;
  technicalRole: string;
}

const SEGMENTS: QuerySegment[] = [
  {
    id: 'domain',
    token: 'site:instagram.com',
    badge: 'DOMAIN TARGET',
    icon: Target,
    title: 'Domain Operator Restriction',
    color: '#FF4A00',
    description: 'Instructs index search engines to strictly restrict query matches to publicly indexed pages within instagram.com.',
    technicalRole: 'Narrows index scope from billions of general web pages to specific platform profile indexes.',
  },
  {
    id: 'intent',
    token: '"startup"',
    badge: 'INTENT TERM',
    icon: Compass,
    title: 'Exact-Match Category Constraint',
    color: '#00E599',
    description: 'Defines the prospect category or business niche to locate within candidate bio descriptions.',
    technicalRole: 'Constrains semantic target to relevant software, startup, or service provider entities.',
  },
  {
    id: 'location',
    token: '"Los Angeles"',
    badge: 'LOCATION SIGNAL',
    icon: MapPin,
    title: 'Geographic Context Anchor',
    color: '#38BDF8',
    description: 'Filters indexed profile bio text and location tags for explicit city or regional mentions.',
    technicalRole: 'Adds territorial context to prevent non-local prospects from populating target region feeds.',
  },
  {
    id: 'contact',
    token: '"@gmail.com"',
    badge: 'CONTACT SIGNAL',
    icon: EnvelopeSimple,
    title: 'Public Contact Pattern Match',
    color: '#FFB800',
    description: 'Surfaces indexed profile snippets containing explicit public contact email pattern strings.',
    technicalRole: 'Filters for outreach-ready prospects with publicly listed contact vectors.',
  },
];

export function XRayQueryVisualizer() {
  const [activeSegmentId, setActiveSegmentId] = useState<string>('domain');

  const activeSegment = SEGMENTS.find((s) => s.id === activeSegmentId) || SEGMENTS[0];

  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div>
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest block font-bold">
            03. QUERY ANATOMY VISUALIZER
          </span>
          <h3 className="font-serif text-2xl text-[#F4F0E8] mt-1" style={{ color: '#F4F0E8' }}>
            Interactive Query Parser & Token Segmentation
          </h3>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#8E8982] bg-[#080808] border border-[#222222] px-2.5 py-1">
          <CursorClick size={14} className="text-[#FF4A00] animate-bounce" />
          <span>Click any segment to inspect engineering telemetry</span>
        </div>
      </div>

      {/* Segment Tokens Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {SEGMENTS.map((seg) => {
          const Icon = seg.icon;
          const isActive = seg.id === activeSegmentId;
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => setActiveSegmentId(seg.id)}
              className={`p-4 border transition-all text-left relative flex flex-col justify-between min-h-[110px] cursor-pointer group ${
                isActive
                  ? 'border-[#FF4A00] bg-[#151515] shadow-[0_0_15px_rgba(255,74,0,0.15)]'
                  : 'border-[#222222] bg-[#080808] hover:border-[#444444]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 border"
                  style={{
                    color: seg.color,
                    borderColor: `${seg.color}40`,
                    backgroundColor: `${seg.color}10`,
                  }}
                >
                  {seg.badge}
                </span>
                <Icon size={16} style={{ color: isActive ? seg.color : '#8E8982' }} />
              </div>

              <div className="font-mono text-sm font-bold tracking-tight text-[#F4F0E8] truncate">
                {seg.token}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Segment Inspection Detail Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSegment.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-[#080808] border border-[#262626] p-5 relative overflow-hidden"
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-20"
            style={{ backgroundColor: activeSegment.color }}
          />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <activeSegment.icon size={20} style={{ color: activeSegment.color }} />
              <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-[#F4F0E8]">
                {activeSegment.title}
              </h4>
              <span className="font-mono text-[10px] text-[#8E8982] ml-auto">
                TOKEN: <code className="text-[#FF4A00]">{activeSegment.token}</code>
              </span>
            </div>

            <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed">
              {activeSegment.description}
            </p>

            <div className="pt-2 border-t border-[#222222] font-mono text-[11px] text-[#8E8982] flex items-start gap-2">
              <span className="text-[#FF4A00] font-bold">TECHNICAL ROLE:</span>
              <span className="text-[#F4F0E8]">{activeSegment.technicalRole}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
