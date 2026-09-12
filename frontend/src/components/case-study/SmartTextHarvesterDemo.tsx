import { useState } from 'react';
import { ClipboardText, CheckCircle, Envelope, Globe, InstagramLogo } from '@phosphor-icons/react';

const DEMO_INPUT = `1. Acme Web Studio (@acmewebstudio) - Vadodara, Gujarat
Contact: hello@acmewebstudio.in | +91 98765 43210
Website: https://acmewebstudio.in
Bio: Crafting custom web infrastructure & branding for modern SMBs.`;

export function SmartTextHarvesterDemo() {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  function startSimulation() {
    setIsSimulating(true);
    setStep(1);
    setTimeout(() => setStep(2), 700);
    setTimeout(() => setStep(3), 1400);
    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  }

  return (
    <div className="inspected-panel bg-[#101010] border border-[#262626] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div>
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-widest block font-bold">
            06. SMART TEXT HARVESTER DEMO
          </span>
          <h3 className="font-serif text-2xl text-[#F4F0E8] mt-1" style={{ color: '#F4F0E8' }}>
            Transforming Discovery Evidence into Structured Leads
          </h3>
        </div>

        <div className="font-mono text-[10px] text-[#8E8982] bg-[#080808] border border-[#222222] px-3 py-1">
          <span>ENDPOINT: </span>
          <code className="text-[#00E599]">POST /api/v1/leads/harvest-paste</code>
        </div>
      </div>

      <p className="font-sans text-xs text-[#E5E0D8] leading-relaxed">
        Search engine results are discovery evidence, not automatically structured CRM records. SetuLeads provides a human-in-the-loop Smart Text Harvester that extracts structured data vectors from raw web text.
      </p>

      {/* Interactive Simulation Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Raw Input Stream */}
        <div className="bg-[#080808] border border-[#262626] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-[#8E8982] tracking-wider font-bold">
              RAW UNSTRUCTURED WEB TEXT
            </span>
            <span className="font-mono text-[9px] text-[#FF4A00] bg-[#FF4A00]/10 border border-[#FF4A00]/30 px-1.5 py-0.5 font-bold">
              DEMONSTRATION DATA
            </span>
          </div>

          <textarea
            readOnly
            value={DEMO_INPUT}
            rows={5}
            className="w-full bg-[#101010] border border-[#222222] p-3 text-xs font-mono text-[#F4F0E8] leading-relaxed resize-none focus:outline-none select-none"
          />

          <button
            type="button"
            onClick={startSimulation}
            disabled={isSimulating}
            className="w-full bg-[#FF4A00] hover:bg-[#FF5A00] text-[#F4F0E8] font-mono text-xs font-bold py-2 border border-[#FF4A00] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-[0_0_10px_rgba(255,74,0,0.2)] transition-all"
          >
            <ClipboardText size={16} />
            <span>{isSimulating ? 'PARSING TEXT STREAM...' : 'SIMULATE TEXT HARVESTING'}</span>
          </button>
        </div>

        {/* Right: Extracted Structured Fields */}
        <div className="bg-[#080808] border border-[#262626] p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="font-mono text-[10px] uppercase text-[#00E599] tracking-wider font-bold">
              PARSED STRUCTURED FIELDS
            </span>
            {step >= 3 && (
              <span className="font-mono text-[9px] text-[#00E599] flex items-center gap-1 font-bold">
                <CheckCircle size={12} /> READY FOR CRM
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 bg-[#101010] border border-[#222222]">
              <span className="text-[#8E8982] uppercase text-[10px]">BUSINESS:</span>
              <span className="text-[#F4F0E8] font-bold">
                {step >= 1 ? 'Acme Web Studio' : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#101010] border border-[#222222]">
              <span className="text-[#8E8982] uppercase text-[10px]">LOCATION:</span>
              <span className="text-[#38BDF8] font-bold">
                {step >= 1 ? 'Vadodara, Gujarat' : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#101010] border border-[#222222]">
              <span className="text-[#8E8982] uppercase text-[10px] flex items-center gap-1">
                <Envelope size={12} className="text-[#FF4A00]" /> EMAIL:
              </span>
              <span className="text-[#FF4A00] font-bold">
                {step >= 2 ? 'hello@acmewebstudio.in' : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#101010] border border-[#222222]">
              <span className="text-[#8E8982] uppercase text-[10px] flex items-center gap-1">
                <InstagramLogo size={12} className="text-[#FFB800]" /> SOCIAL:
              </span>
              <span className="text-[#FFB800] font-bold">
                {step >= 2 ? '@acmewebstudio' : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#101010] border border-[#222222]">
              <span className="text-[#8E8982] uppercase text-[10px] flex items-center gap-1">
                <Globe size={12} className="text-[#00E599]" /> WEBSITE:
              </span>
              <span className="text-[#00E599] font-bold">
                {step >= 3 ? 'https://acmewebstudio.in (Detected)' : '—'}
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#8E8982] pt-2 border-t border-[#222222] flex items-center justify-between">
            <span>QUALIFICATION ENGINE:</span>
            <span className="text-[#00E599] font-bold">Passed Gemini Relevance & Dedupe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
