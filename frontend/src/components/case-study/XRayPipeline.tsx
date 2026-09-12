import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlass,
  Cpu,
  Globe,
  FileText,
  Funnel,
  CheckCircle,
  Database,
  ArrowRight,
  Play,
  Pause,
} from '@phosphor-icons/react';

interface PipelineStep {
  id: number;
  label: string;
  badge: string;
  status: string;
  icon: any;
  detail: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    label: 'USER INTENT',
    badge: 'INPUT',
    status: '[QUERY BUILT]',
    icon: MagnifyingGlass,
    detail: 'User specifies query intent (e.g. startup in Vadodara or Los Angeles).',
  },
  {
    id: 2,
    label: 'QUERY BUILDER',
    badge: 'TRANSFORM',
    status: '[SEARCHING INDEX]',
    icon: Cpu,
    detail: 'Constructs domain operator query: site:instagram.com "startup" "Los Angeles" "@gmail.com".',
  },
  {
    id: 3,
    label: 'SEARCH ENGINE',
    badge: 'INDEX',
    status: '[RESULTS FOUND]',
    icon: Globe,
    detail: 'Queries public search engine index for matched profile pages & bio snippets.',
  },
  {
    id: 4,
    label: 'RESULT EXTRACTION',
    badge: 'PARSER',
    status: '[EXTRACTING SIGNALS]',
    icon: FileText,
    detail: 'Parses bio snippets to extract emails, phone numbers, websites, and handle vectors.',
  },
  {
    id: 5,
    label: 'NORMALIZATION',
    badge: 'CLEANUP',
    status: '[NORMALIZING]',
    icon: Funnel,
    detail: 'Normalizes entity fields, removes noise text, and standardizes location markers.',
  },
  {
    id: 6,
    label: 'QUALIFICATION',
    badge: 'SEMANTIC AI',
    status: '[QUALIFYING]',
    icon: CheckCircle,
    detail: 'Gemini evaluates relevance: SEARCH RESULT != QUALIFIED BUSINESS.',
  },
  {
    id: 7,
    label: 'SETULEADS CRM',
    badge: 'PERSISTENCE',
    status: '[READY FOR CRM]',
    icon: Database,
    detail: 'Saves deduplicated candidate into sales pipeline workstation for outreach.',
  },
];

export function XRayPipeline() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % PIPELINE_STEPS.length) + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div>
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest block font-bold">
            04. QUERY → RESULT PIPELINE
          </span>
          <h3 className="font-serif text-2xl text-[#F4F0E8] mt-1" style={{ color: '#F4F0E8' }}>
            Data Flow & Processing Lifecycle
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 font-mono text-xs border border-[#FF4A00]/40 text-[#FF4A00] bg-[#FF4A00]/10 hover:bg-[#FF4A00]/20 px-3 py-1 cursor-pointer font-bold"
          >
            {isPlaying ? (
              <>
                <Pause size={13} /> PAUSE FLOW
              </>
            ) : (
              <>
                <Play size={13} /> AUTO PLAY
              </>
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 relative">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          const isPassed = step.id < activeStep;

          return (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Connector line for desktop */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-7 left-1/2 w-full h-[2px] bg-[#222222] z-0">
                  {isPassed && (
                    <motion.div
                      className="h-full bg-[#FF4A00]"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              )}

              {/* Step Node */}
              <button
                type="button"
                onClick={() => {
                  setActiveStep(step.id);
                  setIsPlaying(false);
                }}
                className={`relative z-10 w-14 h-14 border transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isActive
                    ? 'border-[#FF4A00] bg-[#151515] text-[#FF4A00] shadow-[0_0_20px_rgba(255,74,0,0.3)] scale-110'
                    : isPassed
                    ? 'border-[#00E599]/60 bg-[#080808] text-[#00E599]'
                    : 'border-[#222222] bg-[#080808] text-[#8E8982]'
                }`}
              >
                <Icon size={22} />
                <span className="font-mono text-[9px] mt-0.5 font-bold">0{step.id}</span>
              </button>

              {/* Step Label */}
              <div className="mt-3 text-center space-y-1">
                <div
                  className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-[#F4F0E8]' : 'text-[#8E8982]'
                  }`}
                >
                  {step.label}
                </div>
                <div
                  className={`font-mono text-[9px] px-1 py-0.5 border ${
                    isActive
                      ? 'border-[#FF4A00]/40 text-[#FF4A00] bg-[#FF4A00]/10 font-bold'
                      : 'border-[#222222] text-[#8E8982]'
                  }`}
                >
                  {step.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Step Telemetry Box */}
      {(() => {
        const current = PIPELINE_STEPS.find((s) => s.id === activeStep) || PIPELINE_STEPS[0];
        const Icon = current.icon;
        return (
          <div className="bg-[#080808] border border-[#262626] p-5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#FF4A00] text-[#FF4A00] flex items-center justify-center bg-[#FF4A00]/10 shrink-0">
                <Icon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#F4F0E8] uppercase tracking-wider">
                    STAGE 0{current.id}: {current.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#FF4A00] bg-[#FF4A00]/10 px-1.5 py-0.5 border border-[#FF4A00]/30 font-bold">
                    {current.badge}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#E5E0D8] mt-1">{current.detail}</p>
              </div>
            </div>

            <div className="font-mono text-xs text-[#FF4A00] font-bold bg-[#FF4A00]/10 border border-[#FF4A00]/30 px-3 py-1.5 shrink-0 flex items-center gap-2">
              <span>{current.status}</span>
              <ArrowRight size={14} className="animate-pulse" />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
