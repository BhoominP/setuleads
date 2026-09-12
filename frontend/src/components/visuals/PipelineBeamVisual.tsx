import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  Globe,
  ChatTeardropText,
  FileXls,
  Sparkle,
  Play,
  CheckCircle,
  Cpu,
  ArrowRight,
  Lightning,
  ArrowsClockwise,
} from '@phosphor-icons/react';

interface PipelineStep {
  id: string;
  number: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  glowColor: string;
  accentBg: string;
  badge: string;
  latency: string;
  throughput: string;
  techStack: string[];
  payload: Record<string, any>;
}

export function PipelineBeamVisual() {
  const [selectedStepIndex, setSelectedStepIndex] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activePulseIndex, setActivePulseIndex] = useState<number | null>(null);

  const steps: PipelineStep[] = [
    {
      id: 'sourcing',
      number: '01',
      name: 'Geo Discovery',
      desc: 'Geoapify + OSM + X-Ray',
      icon: MagnifyingGlass,
      color: '#FF4A00',
      glowColor: 'rgba(255, 74, 0, 0.4)',
      accentBg: 'bg-[#FF4A00]/10',
      badge: 'GEO SPATIAL',
      latency: '115ms',
      throughput: '1,240 records/sec',
      techStack: ['Geoapify REST API', 'Overpass OSM Query', 'Spatial Radius Bounding Box'],
      payload: {
        target_location: 'Austin, TX (30.2672, -97.7431)',
        radius_km: 25,
        discovery_sources: ['Geoapify Places API', 'Overpass OpenStreetMap Nodes'],
        records_found: 48,
        filter_has_website: true,
      },
    },
    {
      id: 'gemini',
      number: '02',
      name: 'Gemini 1.5 Pro',
      desc: 'Semantic Intent & Fit',
      icon: Sparkle,
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.4)',
      accentBg: 'bg-[#FFD700]/10',
      badge: 'SEMANTIC AI',
      latency: '340ms',
      throughput: '98.6% qualification accuracy',
      techStack: ['Google Gemini 1.5 Pro', 'Structured Output JSON Schema', 'Zero-Shot Classifier'],
      payload: {
        model: 'gemini-1.5-pro-latest',
        intent_analysis: 'HIGH_UPGRADE_POTENTIAL',
        classified_category: 'Local HVAC & Emergency Contracting',
        qualification_confidence: 0.96,
        opportunity_hook: 'Modernize legacy non-responsive booking form & add SSL trust badge.',
      },
    },
    {
      id: 'inspection',
      number: '03',
      name: 'Site Inspection',
      desc: 'Factual Quality Audit',
      icon: Globe,
      color: '#00E599',
      glowColor: 'rgba(0, 229, 153, 0.4)',
      accentBg: 'bg-[#00E599]/10',
      badge: 'AUDIT ENGINE',
      latency: '180ms',
      throughput: '12 site checks/sec',
      techStack: ['HTTP HEAD Header Prober', 'Mobile Viewport Parser', 'SSL & DNS Verification'],
      payload: {
        website_url: 'https://example-hvac-austin.com',
        http_status: 200,
        ssl_valid: false,
        mobile_responsive: false,
        overall_flaw_score: 38,
        detected_flaws: ['MISSING_SSL', 'NON_RESPONSIVE_VIEWPORT', 'SLOW_LCP_3.4S'],
      },
    },
    {
      id: 'crm',
      number: '04',
      name: 'CRM Pipeline',
      desc: 'Pipeline & Timeline',
      icon: ChatTeardropText,
      color: '#38BDF8',
      glowColor: 'rgba(56, 189, 248, 0.4)',
      accentBg: 'bg-[#38BDF8]/10',
      badge: 'STAGE ENGINE',
      latency: '45ms',
      throughput: 'ACID Transactional Sync',
      techStack: ['Spring Boot JPA Repository', 'PostgreSQL 15 DB', 'Activity Event Auditor'],
      payload: {
        lead_id: '8f7a2c1b-9e4d-4a11-8c5e-3b2a1f9e8d7c',
        stage: 'QUALIFIED',
        activity_type: 'STAGE_CHANGE',
        audit_note: 'Automated Gemini audit completed. High-value prospect persisted.',
        assigned_user: 'BHOOMIN PATEL',
      },
    },
    {
      id: 'export',
      number: '05',
      name: 'Binary Export',
      desc: 'SheetJS (.xlsx)',
      icon: FileXls,
      color: '#E5E0D8',
      glowColor: 'rgba(229, 224, 216, 0.4)',
      accentBg: 'bg-[#E5E0D8]/10',
      badge: 'BINARY STREAM',
      latency: '12ms',
      throughput: 'Instant Client Export',
      techStack: ['SheetJS (xlsx) Binary Compiler', 'Client-side Blob Stream', 'Telemetry Log Record'],
      payload: {
        export_format: 'XLSX (Microsoft Excel)',
        record_count: 48,
        columns_exported: ['business_name', 'phone', 'website_url', 'website_score', 'opportunity_hook'],
        telemetry_logged: true,
      },
    },
  ];

  // Pipeline packet simulation loop
  useEffect(() => {
    if (!isSimulating) {
      setActivePulseIndex(null);
      return;
    }

    let current = 0;
    setActivePulseIndex(0);
    setSelectedStepIndex(0);

    const interval = setInterval(() => {
      current++;
      if (current >= steps.length) {
        current = 0;
      }
      setActivePulseIndex(current);
      setSelectedStepIndex(current);
    }, 1600);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const activeStep = steps[selectedStepIndex];
  const StepIcon = activeStep.icon;

  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-4 sm:p-6 mb-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-[#FF4A00] uppercase tracking-widest bg-[#FF4A00]/10 border border-[#FF4A00]/30 px-2 py-0.5 font-bold">
              SYSTEM ARCHITECTURE & DATA FLOW
            </span>
            <span className="font-mono text-[10px] text-[#00E599] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" /> LIVE TELEMETRY
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#F4F0E8] font-normal tracking-tight">
            End-to-End Prospect Intelligence Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`font-mono text-xs px-3.5 py-1.5 border transition-all flex items-center gap-2 rounded-none cursor-pointer ${
              isSimulating
                ? 'bg-[#FF4A00] text-[#080808] border-[#FF4A00] font-bold shadow-[0_0_12px_rgba(255,74,0,0.4)]'
                : 'bg-[#080808] text-[#E5E0D8] border-[#333333] hover:border-[#FF4A00] hover:text-[#FF4A00]'
            }`}
          >
            {isSimulating ? (
              <>
                <ArrowsClockwise size={14} className="animate-spin text-[#080808]" />
                <span>PACKET STREAM ACTIVE</span>
              </>
            ) : (
              <>
                <Play size={14} className="text-[#FF4A00]" />
                <span>SIMULATE DATA PACKET</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Pipeline Conduit Grid */}
      <div className="relative pt-2 pb-4 overflow-hidden rounded-none">
        {/* Strictly Clipped Conduit Beam Track behind step cards */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 hidden lg:block h-[2px] bg-[#1a1a1a] z-0 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-[#FF4A00] to-transparent shadow-[0_0_14px_#FF4A00]"
            animate={{
              x: ['-100%', '250%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ width: '40%' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = selectedStepIndex === idx;
            const isPulsing = activePulseIndex === idx;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setSelectedStepIndex(idx);
                  setIsSimulating(false);
                }}
                className={`relative text-left p-3.5 border transition-all cursor-pointer rounded-none group ${
                  isSelected
                    ? 'bg-[#0d0d0d] border-[#FF4A00] shadow-[0_0_16px_rgba(255,74,0,0.25)]'
                    : 'bg-[#0d0d0d] border-[#222222] hover:border-[#444444]'
                }`}
                style={{
                  borderColor: isSelected ? step.color : undefined,
                }}
              >
                {/* Active Indicator Pulse Ring */}
                {isPulsing && (
                  <motion.div
                    layoutId="pulseRing"
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF4A00] shadow-[0_0_10px_#FF4A00]"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-[#8E8982]">
                    {step.number} • {step.badge}
                  </span>
                  {isSelected && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: step.color, boxShadow: `0 0 8px ${step.glowColor}` }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 border flex items-center justify-center shrink-0 font-mono transition-transform group-hover:scale-105"
                    style={{
                      borderColor: step.color,
                      color: step.color,
                      backgroundColor: `${step.color}15`,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="font-mono text-xs font-bold truncate transition-colors"
                      style={{ color: isSelected ? '#F4F0E8' : '#CFC8BE' }}
                    >
                      {step.name}
                    </p>
                    <p className="font-mono text-[10px] text-[#8E8982] truncate mt-0.5">{step.desc}</p>
                  </div>
                </div>

                {/* Step Connector Arrow for mobile grid readability */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block lg:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-[#333333]">
                    <ArrowRight size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detailed Diagnostic Readout Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="bg-[#080808] border border-[#222222] p-4 sm:p-5 inspected-panel grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left Column: Diagnostics & Tech Stack */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 border flex items-center justify-center font-mono text-xs"
                  style={{
                    borderColor: activeStep.color,
                    color: activeStep.color,
                    backgroundColor: `${activeStep.color}20`,
                  }}
                >
                  <StepIcon size={16} />
                </div>
                <div>
                  <h4 className="font-mono text-xs font-bold text-[#F4F0E8] uppercase tracking-wider">
                    NODE {activeStep.number}: {activeStep.name}
                  </h4>
                  <span className="font-mono text-[10px] text-[#8E8982]">{activeStep.desc}</span>
                </div>
              </div>

              <span
                className="font-mono text-[10px] px-2 py-0.5 border font-bold uppercase tracking-wider"
                style={{
                  color: activeStep.color,
                  borderColor: `${activeStep.color}60`,
                  backgroundColor: `${activeStep.color}15`,
                }}
              >
                ONLINE
              </span>
            </div>

            {/* Micro Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#101010] border border-[#1f1f1f] p-3 space-y-1">
                <span className="font-mono text-[10px] text-[#8E8982] uppercase block">LATENCY BENCHMARK</span>
                <p className="font-mono text-xs font-bold text-[#00E599] flex items-center gap-1.5">
                  <Cpu size={14} className="text-[#00E599]" /> {activeStep.latency}
                </p>
              </div>

              <div className="bg-[#101010] border border-[#1f1f1f] p-3 space-y-1">
                <span className="font-mono text-[10px] text-[#8E8982] uppercase block">THROUGHPUT CAPACITY</span>
                <p className="font-mono text-xs font-bold text-[#FF4A00] flex items-center gap-1.5">
                  <Lightning size={14} className="text-[#FF4A00]" /> {activeStep.throughput}
                </p>
              </div>
            </div>

            {/* Architecture Protocol Stack */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-[#8E8982] uppercase tracking-wider block">
                ENGINEERING PROTOCOL STACK
              </span>
              <div className="space-y-1.5">
                {activeStep.techStack.map((tech, idx) => (
                  <div
                    key={idx}
                    className="font-mono text-xs text-[#E5E0D8] bg-[#101010] border border-[#1f1f1f] px-3 py-1.5 flex items-center gap-2"
                  >
                    <CheckCircle size={14} style={{ color: activeStep.color }} className="shrink-0" />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Data Schema & JSON Payload Inspector */}
          <div className="lg:col-span-7 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#FF4A00] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Lightning size={14} className="text-[#FF4A00]" /> PIPELINE SCHEMA PAYLOAD (JSON)
              </span>
              <span className="font-mono text-[10px] text-[#8E8982]">PROTOCOL_VER: 1.5.0-PROD</span>
            </div>

            <div className="bg-[#050505] border border-[#1f1f1f] p-4 font-mono text-xs text-[#F4F0E8] overflow-x-auto flex-1 max-h-[240px] leading-relaxed shadow-inner">
              <pre className="text-[#E5E0D8]">
                <code>
                  <span className="text-[#8E8982]">/* Telemetry payload - Node {activeStep.number} */</span>
                  {'\n'}
                  <span className="text-[#FF4A00]">&#123;</span>
                  {'\n'}
                  {Object.entries(activeStep.payload).map(([key, val], i, arr) => (
                    <span key={key}>
                      {'  '}
                      <span className="text-[#38BDF8]">"{key}"</span>:
                      {typeof val === 'string' ? (
                        <span className="text-[#00E599]"> "{val}"</span>
                      ) : typeof val === 'number' ? (
                        <span className="text-[#FFD700]"> {val}</span>
                      ) : Array.isArray(val) ? (
                        <span className="text-[#E5E0D8]"> [{val.map((item) => `"${item}"`).join(', ')}]</span>
                      ) : (
                        <span className="text-[#E5E0D8]"> {JSON.stringify(val)}</span>
                      )}
                      {i < arr.length - 1 ? ',' : ''}
                      {'\n'}
                    </span>
                  ))}
                  <span className="text-[#FF4A00]">&#125;</span>
                </code>
              </pre>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8982] pt-1">
              <span>STATUS: 200 OK</span>
              <span>DATA FLOW INTEGRITY: 100% DETERMINISTIC</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
