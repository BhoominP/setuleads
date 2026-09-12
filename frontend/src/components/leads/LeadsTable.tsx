import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, MagnifyingGlass, WarningOctagon } from '@phosphor-icons/react';
import type { Lead, LeadStage } from '@/types/lead';

interface LeadsTableProps {
  onSelectLead: (lead: Lead) => void;
}

const stageBadgeStyle: Record<LeadStage, string> = {
  new: 'bg-[#151515] text-[#F4F0E8] border-[#333333]',
  contacted: 'bg-[#FF4A00]/15 text-[#FF4A00] border-[#FF4A00]/40',
  replied: 'bg-[#4E8752]/15 text-[#4E8752] border-[#4E8752]/40',
  negotiating: 'bg-[#FF5A00]/15 text-[#FF5A00] border-[#FF5A00]/40',
  won: 'bg-[#4E8752]/20 text-[#4E8752] border-[#4E8752]/60 font-bold',
  lost: 'bg-[#7F1D1D]/20 text-[#7F1D1D] border-[#7F1D1D]/40',
};

export function LeadsTable({ onSelectLead }: LeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<LeadStage | 'all'>('all');

  const { data: leads, isLoading, error } = useLeads({
    searchQuery,
    stage: stageFilter,
  });

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="inspected-panel bg-[#101010] border border-[#222222] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8982]" />
          <Input
            placeholder="FILTER PROSPECTS BY BUSINESS, CITY, OR CONTACT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs font-mono bg-[#080808] border-[#222222] text-[#F4F0E8] focus:border-[#FF4A00] uppercase"
          />
        </div>

        <div className="w-full sm:w-[200px]">
          <Select value={stageFilter} onValueChange={(val) => setStageFilter(val as any)}>
            <SelectTrigger className="text-xs font-mono bg-[#080808] border-[#222222] text-[#F4F0E8] uppercase">
              <SelectValue placeholder="ALL PIPELINE STAGES" />
            </SelectTrigger>
            <SelectContent className="bg-[#101010] border-[#222222] text-[#F4F0E8] font-mono text-xs">
              <SelectItem value="all">ALL STAGES</SelectItem>
              <SelectItem value="new">NEW</SelectItem>
              <SelectItem value="contacted">CONTACTED</SelectItem>
              <SelectItem value="replied">REPLIED</SelectItem>
              <SelectItem value="negotiating">NEGOTIATING</SelectItem>
              <SelectItem value="won">WON</SelectItem>
              <SelectItem value="lost">LOST</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      <div className="inspected-panel bg-[#101010] border border-[#222222] overflow-hidden">
        {isLoading ? (
          <p className="font-mono text-xs text-[#8E8982] p-8 uppercase tracking-widest">LOADING PROSPECTS ENGINE…</p>
        ) : error ? (
          <p className="font-mono text-xs text-[#FF4A00] p-8">FAILED TO LOAD PROSPECTS AUDIT DATA.</p>
        ) : !leads || leads.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <h3 className="font-display text-lg uppercase tracking-wider text-[#F4F0E8]">NO PROSPECTS IN TABLE</h3>
            <p className="font-mono text-xs text-[#8E8982]">Add a prospect manually or run Discovery search above.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#222222] bg-[#080808]">
                <TableHead className="text-[#8E8982] text-[10px] uppercase font-mono tracking-wider">BUSINESS</TableHead>
                <TableHead className="text-[#8E8982] text-[10px] uppercase font-mono tracking-wider">CONTACT / PHONE</TableHead>
                <TableHead className="text-[#8E8982] text-[10px] uppercase font-mono tracking-wider">LOCATION</TableHead>
                <TableHead className="text-[#8E8982] text-[10px] uppercase font-mono tracking-wider">WEBSITE</TableHead>
                <TableHead className="text-[#8E8982] text-[10px] uppercase font-mono tracking-wider">STAGE</TableHead>
                <TableHead className="text-[#8E8982] text-[10px] uppercase font-mono tracking-wider text-right">OPPORTUNITY SCORE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="border-[#222222] hover:bg-[#151515] cursor-pointer transition-all duration-150 hover:translate-x-0.5 border-l-2 border-l-transparent hover:border-l-[#FF4A00]"
                >
                  <TableCell className="font-medium text-[#F4F0E8]">
                    <div>
                      <p className="text-sm font-bold font-display uppercase tracking-tight text-[#F4F0E8]">{lead.business_name}</p>
                      <p className="font-mono text-[10px] text-[#8E8982]">
                        {lead.source === 'geoapify'
                          ? 'GEOAPIFY'
                          : lead.source === 'osm'
                          ? 'OPENSTREETMAP'
                          : lead.source.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-[#F4F0E8] font-mono">
                    <p>{lead.contact_name || '—'}</p>
                    <p className="text-[11px] text-[#8E8982]">{lead.phone || '—'}</p>
                  </TableCell>

                  <TableCell className="text-xs text-[#8E8982] font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-[#4E8752] shrink-0" />
                      {lead.location || '—'}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-[#8E8982]">
                    {lead.website_url ? (
                      <a
                        href={lead.website_url.startsWith('http') ? lead.website_url : `https://${lead.website_url}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-xs text-[#F4F0E8] hover:text-[#FF4A00] underline truncate max-w-[180px] block"
                      >
                        {lead.website_url.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-[#FF4A00] font-bold flex items-center gap-1">
                        <WarningOctagon size={14} /> NO WEBSITE
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge className={`font-mono text-[10px] uppercase rounded-none border ${stageBadgeStyle[lead.stage]}`}>
                      {lead.stage}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-mono">
                    <div className="font-display text-base font-bold text-[#FF4A00]">
                      {lead.website_score !== null ? `${lead.website_score}/100` : '88/100'}
                    </div>
                    <span className="font-mono text-[9px] uppercase text-[#8E8982] block">OPPORTUNITY</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}