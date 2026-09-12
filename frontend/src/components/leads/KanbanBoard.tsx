import { useUpdateLeadStage } from '@/hooks/useLeads';
import { motion } from 'framer-motion';
import { Globe, MapPin, CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { Lead, LeadStage } from '@/types/lead';

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const STAGES: { key: LeadStage; label: string; color: string }[] = [
  { key: 'new', label: 'NEW PROSPECTS', color: 'border-[#333333] text-[#F4F0E8]' },
  { key: 'contacted', label: 'CONTACTED', color: 'border-[#FF4A00] text-[#FF4A00]' },
  { key: 'replied', label: 'REPLIED', color: 'border-[#4E8752] text-[#4E8752]' },
  { key: 'negotiating', label: 'NEGOTIATING', color: 'border-[#FF5A00] text-[#FF5A00]' },
  { key: 'won', label: 'WON DEALS', color: 'border-[#4E8752] text-[#4E8752] font-bold' },
  { key: 'lost', label: 'LOST / CLOSED', color: 'border-[#7F1D1D] text-[#7F1D1D]' },
];

export function KanbanBoard({ leads, onSelectLead }: KanbanBoardProps) {
  const updateStageMutation = useUpdateLeadStage();

  function getLeadsByStage(stage: LeadStage): Lead[] {
    return leads.filter((l) => l.stage === stage);
  }

  function handleMoveStage(lead: Lead, direction: 'prev' | 'next') {
    const currentIndex = STAGES.findIndex((s) => s.key === lead.stage);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < STAGES.length) {
      updateStageMutation.mutate({
        id: lead.id,
        newStage: STAGES[nextIndex].key,
      });
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
      {STAGES.map((col, colIdx) => {
        const stageLeads = getLeadsByStage(col.key);

        return (
          <div
            key={col.key}
            className="inspected-panel bg-[#101010] border border-[#222222] p-4 flex flex-col min-h-[550px]"
          >
            {/* Column Header */}
            <div className={`border-b-2 ${col.color} pb-2 mb-4 flex items-center justify-between`}>
              <h3 className="font-display text-xs font-bold uppercase tracking-wider">{col.label}</h3>
              <span className="font-mono text-xs text-[#FF4A00] bg-[#080808] px-2 py-0.5 border border-[#222222]">
                {stageLeads.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {stageLeads.length === 0 ? (
                <div className="border border-dashed border-[#222222] p-6 text-center">
                  <p className="font-mono text-[11px] text-[#8E8982] uppercase tracking-wider">NO PROSPECTS</p>
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="inspected-panel bg-[#080808] border border-[#222222] p-3.5 hover:border-[#FF4A00]/60 transition-all group cursor-pointer space-y-2"
                    onClick={() => onSelectLead(lead)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-xs font-bold uppercase text-[#F4F0E8] group-hover:text-[#FF4A00] transition-colors line-clamp-1">
                        {lead.business_name}
                      </h4>
                      <div className="font-display text-xs font-bold text-[#FF4A00] shrink-0">
                        {lead.website_score ?? 88}/100
                      </div>
                    </div>

                    <div className="space-y-1 font-mono text-[10px] text-[#8E8982]">
                      {lead.location && (
                        <p className="flex items-center gap-1 line-clamp-1">
                          <MapPin size={12} className="text-[#4E8752] shrink-0" />
                          <span>{lead.location}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1">
                        <Globe size={12} className={lead.website_url ? 'text-[#FF4A00]' : 'text-[#7F1D1D]'} />
                        <span className="truncate">
                          {lead.website_url ? lead.website_url.replace(/^https?:\/\//, '') : 'NO WEBSITE'}
                        </span>
                      </p>
                    </div>

                    {/* Quick Stage Shift Buttons */}
                    <div
                      className="flex items-center justify-between border-t border-[#222222] pt-2 text-[10px] font-mono text-[#8E8982]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        disabled={colIdx === 0}
                        onClick={() => handleMoveStage(lead, 'prev')}
                        className="p-1 hover:text-[#FF4A00] disabled:opacity-30 transition-colors"
                        title="Move Left"
                      >
                        <CaretLeft size={14} />
                      </button>

                      <span className="uppercase text-[9px] font-bold tracking-wider text-[#CFC8BE]">
                        {lead.stage}
                      </span>

                      <button
                        disabled={colIdx === STAGES.length - 1}
                        onClick={() => handleMoveStage(lead, 'next')}
                        className="p-1 hover:text-[#FF4A00] disabled:opacity-30 transition-colors"
                        title="Move Right"
                      >
                        <CaretRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

