import { useState } from 'react';
import { useExportLeads } from '@/hooks/useExportLeads';
import { useLeads } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, DownloadSimple, CheckCircle, Spinner } from '@phosphor-icons/react';
import type { Lead, LeadStage } from '@/types/lead';

import logoMonochrome from '@/assets/SetuLeads_Monochrome.svg';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads?: Lead[];
}

export function ExportModal({ isOpen, onClose, leads }: ExportModalProps) {
  const { data: storeLeads = [] } = useLeads();
  const { triggerExport, exporting, lastExport, error } = useExportLeads();
  const [selectedStage, setSelectedStage] = useState<LeadStage | 'all'>('all');

  if (!isOpen) return null;

  const activeLeads = (leads && leads.length > 0) ? leads : storeLeads;

  const filteredLeads = selectedStage === 'all'
    ? activeLeads
    : activeLeads.filter((l: Lead) => l.stage === selectedStage);

  async function handleExport() {
    await triggerExport(filteredLeads, { stage: selectedStage });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/85 backdrop-blur-sm p-4 select-none">
      <div className="inspected-panel bg-[#101010] border border-[#222222] p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E8982] hover:text-[#F4F0E8] transition-colors p-1"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1.5">
          <img src={logoMonochrome} alt="SetuLeads" className="h-5 w-auto object-contain brightness-125" />
          <span className="font-mono text-xs uppercase text-[#FF4A00] tracking-wider font-bold">• SheetJS Integration</span>
        </div>
        <h2 className="font-serif text-2xl text-[#F4F0E8] mb-4">Export Leads to Excel (.xlsx)</h2>

        {error && (
          <div className="border border-red-900/60 bg-red-950/20 p-2.5 mb-4 text-xs font-mono text-red-400">
            ⚠ {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-xs font-mono text-[#8E8982] uppercase tracking-wider mb-1.5 block">
              Filter Stage for Export
            </Label>
            <Select value={selectedStage} onValueChange={(val) => setSelectedStage(val as any)}>
              <SelectTrigger className="w-full h-10 border border-[#333333] bg-[#080808] text-xs font-mono text-[#F4F0E8] rounded-none focus:border-[#FF4A00]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" alignItemWithTrigger={false} className="z-[9999]">
                <SelectItem value="all">All Stages ({activeLeads.length} leads)</SelectItem>
                <SelectItem value="new">New Stage Only</SelectItem>
                <SelectItem value="contacted">Contacted Stage Only</SelectItem>
                <SelectItem value="replied">Replied Stage Only</SelectItem>
                <SelectItem value="negotiating">Negotiating Stage Only</SelectItem>
                <SelectItem value="won">Won Stage Only</SelectItem>
                <SelectItem value="lost">Lost Stage Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border border-[#222222] bg-[#080808] p-4 space-y-2">
            <span className="font-mono text-[10px] uppercase text-[#8E8982] tracking-wider block">
              Export Package Details
            </span>
            <div className="text-xs text-[#F4F0E8] space-y-1.5 font-mono">
              <p className="flex justify-between border-b border-[#222222] pb-1">
                <span className="text-[#8E8982]">Target Filter:</span>
                <span className="font-bold text-[#FF4A00] uppercase">{selectedStage}</span>
              </p>
              <p className="flex justify-between border-b border-[#222222] pb-1">
                <span className="text-[#8E8982]">Record Count:</span>
                <span className="font-bold text-[#00E599]">{filteredLeads.length} leads</span>
              </p>
              <p className="flex justify-between border-b border-[#222222] pb-1">
                <span className="text-[#8E8982]">File Format:</span>
                <span>Microsoft Excel (.xlsx)</span>
              </p>
              <p className="flex justify-between">
                <span className="text-[#8E8982]">Engine:</span>
                <span className="text-[#00E599]">SheetJS XLSX Engine</span>
              </p>
            </div>
          </div>

          {lastExport && (
            <div className="border border-[#00E599]/40 bg-[#00E599]/10 p-3 text-xs text-[#00E599] flex items-center gap-2.5 font-mono">
              <CheckCircle size={18} className="shrink-0 text-[#00E599]" />
              <div>
                <p className="font-bold text-[#F4F0E8]">Export generated & downloaded!</p>
                <p className="text-[10px] text-[#8E8982]">{lastExport.fileName} ({lastExport.count} records)</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#222222] pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border border-[#333333] bg-[#080808] text-[#8E8982] hover:text-[#F4F0E8] font-mono text-xs h-10 px-4 rounded-none"
          >
            Close
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || filteredLeads.length === 0}
            className="bg-[#FF4A00] hover:bg-[#FF4A00]/90 text-[#080808] font-mono text-xs font-bold h-10 px-4 flex items-center gap-2 rounded-none transition-all"
          >
            {exporting ? (
              <>
                <Spinner size={16} className="animate-spin text-[#080808]" />
                Generating…
              </>
            ) : (
              <>
                <DownloadSimple size={16} weight="bold" />
                Download {filteredLeads.length} Leads (.xlsx)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
