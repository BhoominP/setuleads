import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InstagramLogo, LinkedinLogo, TreeStructure, FacebookLogo, Copy, Check } from '@phosphor-icons/react';

interface PatternTab {
  id: string;
  name: string;
  query: string;
  icon: any;
  color: string;
  targetPurpose: string;
  usefulSignals: string[];
  limitations: string[];
}

const PATTERNS: PatternTab[] = [
  {
    id: 'instagram',
    name: 'INSTAGRAM',
    query: 'site:instagram.com "startup" "Los Angeles" "@gmail.com"',
    icon: InstagramLogo,
    color: '#FF4A00',
    targetPurpose: 'Surfaces creators, local boutiques, design agencies, & visual SMBs.',
    usefulSignals: ['Bio contact email & phone text', 'Linktree landing URLs', 'Direct message indicators', 'City location hashtags'],
    limitations: ['Client-side JS rendering can obscure bio details', 'Indexing latency for newly created accounts'],
  },
  {
    id: 'linkedin',
    name: 'LINKEDIN',
    query: 'site:linkedin.com/company "startup" "Los Angeles"',
    icon: LinkedinLogo,
    color: '#00E599',
    targetPurpose: 'Discovers corporate B2B service agencies, tech startups, & B2B vendors.',
    usefulSignals: ['Employee headcount size', 'Official company domain link', 'Industry classification & tagline', 'Executive contact names'],
    limitations: ['Gated profile details behind login', 'Strict search snippet length truncation'],
  },
  {
    id: 'linktree',
    name: 'LINKTREE',
    query: 'site:linktr.ee "startup" "Los Angeles"',
    icon: TreeStructure,
    color: '#FFB800',
    targetPurpose: 'Finds micro-businesses using Linktree as their sole web presence.',
    usefulSignals: ['Direct Shopify / Etsy store links', 'Booking & scheduling links', 'Cross-platform social profiles', 'WhatsApp direct outreach'],
    limitations: ['Limited textual context on root linktree landing page', 'Short bio snippet text'],
  },
  {
    id: 'facebook',
    name: 'FACEBOOK',
    query: 'site:facebook.com "startup" "Los Angeles" "email"',
    icon: FacebookLogo,
    color: '#38BDF8',
    targetPurpose: 'Targets local service contractors & community-oriented SMBs.',
    usefulSignals: ['Operating hours & address', 'Direct public email address', 'Phone & WhatsApp numbers', 'Customer review counts'],
    limitations: ['Strict privacy restrictions', 'Algorithmic snippet truncation by search engines'],
  },
];

export function QueryPatternTabs() {
  const [activeId, setActiveId] = useState<string>('instagram');
  const [copied, setCopied] = useState<boolean>(false);

  const active = PATTERNS.find((p) => p.id === activeId) || PATTERNS[0];

  function copyQuery(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div>
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest block font-bold">
            05. X-RAY QUERY PATTERNS
          </span>
          <h3 className="font-serif text-2xl text-[#F4F0E8] mt-1" style={{ color: '#F4F0E8' }}>
            Multi-Platform Operator Examples
          </h3>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PATTERNS.map((p) => {
          const Icon = p.icon;
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(p.id)}
              className={`font-mono text-xs px-4 py-2 border transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#FF4A00] bg-[#151515] text-[#F4F0E8] font-bold shadow-[0_0_10px_rgba(255,74,0,0.15)]'
                  : 'border-[#222222] bg-[#080808] text-[#8E8982] hover:text-[#F4F0E8]'
              }`}
            >
              <Icon size={16} style={{ color: isActive ? p.color : '#8E8982' }} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Pattern Breakdown */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="bg-[#080808] border border-[#262626] p-5 space-y-5"
        >
          {/* Query Code Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[#8E8982] tracking-wider font-bold">
                OPERATOR QUERY SYNTAX:
              </span>
              <button
                type="button"
                onClick={() => copyQuery(active.query)}
                className="font-mono text-[10px] text-[#FF4A00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'COPIED' : 'COPY QUERY'}</span>
              </button>
            </div>
            <div className="bg-[#101010] border border-[#222222] p-3 font-mono text-xs text-[#00E599] flex items-center gap-2 overflow-x-auto">
              <span className="text-[#FF4A00] select-none">&gt;</span>
              <span>{active.query}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Target Purpose */}
            <div className="space-y-1.5 bg-[#101010] border border-[#222222] p-3">
              <span className="text-[10px] uppercase text-[#FF4A00] font-bold block">TARGET PURPOSE</span>
              <p className="text-[#F4F0E8] font-sans text-xs leading-relaxed">{active.targetPurpose}</p>
            </div>

            {/* Useful Signals */}
            <div className="space-y-1.5 bg-[#101010] border border-[#222222] p-3">
              <span className="text-[10px] uppercase text-[#00E599] font-bold block">USEFUL SIGNALS</span>
              <ul className="space-y-1 text-[#E5E0D8] font-sans text-xs">
                {active.usefulSignals.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-[#00E599]">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            <div className="space-y-1.5 bg-[#101010] border border-[#222222] p-3">
              <span className="text-[10px] uppercase text-[#FFB800] font-bold block">ENGINEERING LIMITATIONS</span>
              <ul className="space-y-1 text-[#E5E0D8] font-sans text-xs">
                {active.limitations.map((l, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-[#FFB800]">•</span> {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
