import { useState, useEffect } from 'react';
import { useUpdateLead, useUpdateLeadStage, useDeleteLead } from '@/hooks/useLeads';
import { WebsiteAuditPanel } from './WebsiteAuditPanel';
import { ActivityTimeline } from './ActivityTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Trash, Phone, EnvelopeSimple, MapPin, CurrencyInr, PencilSimple, Check } from '@phosphor-icons/react';
import type { Lead, LeadStage } from '@/types/lead';

import logoIcon from '@/assets/Setuleads_logo.svg';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  onClose: () => void;
}

const stageColor: Record<LeadStage, string> = {
  new: 'bg-accent text-ink border-border',
  contacted: 'bg-ochre/20 text-ochre border-ochre/40',
  replied: 'bg-sage/20 text-sage border-sage/40',
  negotiating: 'bg-ochre/20 text-ochre border-ochre/40',
  won: 'bg-sage/20 text-sage border-sage/40',
  lost: 'bg-rust/20 text-rust border-rust/40',
};

export function LeadDetailsDrawer({ lead, onClose }: LeadDetailsDrawerProps) {
  const updateStageMutation = useUpdateLeadStage();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();

  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  useEffect(() => {
    if (lead) {
      setBusinessName(lead.business_name || '');
      setContactName(lead.contact_name || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setWebsiteUrl(lead.website_url || '');
      setEstimatedValue(lead.estimated_value ? String(lead.estimated_value) : '');
      setGeneralNotes(lead.general_notes || '');
      setIsEditing(false);
    }
  }, [lead]);

  if (!lead) return null;

  async function handleStageChange(newStage: LeadStage) {
    if (!lead) return;
    await updateStageMutation.mutateAsync({ id: lead.id, newStage });
  }

  async function handleSaveEdits() {
    if (!lead) return;
    await updateLeadMutation.mutateAsync({
      id: lead.id,
      updates: {
        business_name: businessName.trim(),
        contact_name: contactName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        website_url: websiteUrl.trim() || null,
        estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
        general_notes: generalNotes.trim() || null,
      },
    });
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!lead || !window.confirm(`Are you sure you want to delete lead "${lead.business_name}"?`)) {
      return;
    }
    await deleteLeadMutation.mutateAsync(lead.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-base/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-base border-l border-border h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="bg-[#101010] border-b border-[#222222] p-6 flex items-start justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <img src={logoIcon} alt="SetuLeads" className="w-5 h-5 object-contain" />
              <Badge className={stageColor[lead.stage]}>{lead.stage.toUpperCase()}</Badge>
              <span className="font-mono text-xs text-[#8E8982]">
                Source: {lead.source === 'google_places' ? 'Google Places' : lead.source === 'osm' ? 'OpenStreetMap' : lead.source.replace('_', ' ')}
              </span>
            </div>
            {isEditing ? (
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="font-serif text-xl font-medium text-ink mt-1"
              />
            ) : (
              <h2 className="font-serif text-2xl text-ink font-medium">{lead.business_name}</h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button
                size="sm"
                onClick={handleSaveEdits}
                disabled={updateLeadMutation.isPending}
                className="bg-sage hover:bg-sage/90 text-ink text-xs font-mono"
              >
                <Check size={14} className="mr-1" /> Save
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="text-xs font-mono border-border"
              >
                <PencilSimple size={14} className="mr-1" /> Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              title="Delete Lead"
              className="text-rust hover:bg-rust/10"
            >
              <Trash size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-muted-foreground">
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Stage Switcher */}
          <div className="inspected-panel bg-panel border border-border p-4">
            <Label className="font-mono text-xs uppercase text-muted-foreground tracking-wider mb-2 block">
              Pipeline Stage
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(['new', 'contacted', 'replied', 'negotiating', 'won', 'lost'] as LeadStage[]).map(
                (stg) => (
                  <button
                    key={stg}
                    onClick={() => handleStageChange(stg)}
                    disabled={updateStageMutation.isPending}
                    className={`font-mono text-xs py-1.5 border transition-all ${
                      lead.stage === stg
                        ? `${stageColor[stg]} font-bold`
                        : 'border-border text-muted-foreground hover:text-ink hover:border-muted-foreground/50'
                    }`}
                  >
                    {stg.charAt(0).toUpperCase() + stg.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Business & Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="inspected-panel bg-panel border border-border p-4 space-y-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest block mb-1">
                Contact Parameters
              </span>
              <div className="text-xs text-ink space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono w-20 shrink-0">Person:</span>
                  {isEditing ? (
                    <Input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <span>{lead.contact_name || '—'}</span>
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-rust shrink-0" />
                  <span className="text-muted-foreground font-mono w-20 shrink-0">Phone:</span>
                  {isEditing ? (
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <span className="font-mono">{lead.phone || '—'}</span>
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <EnvelopeSimple size={14} className="text-ochre shrink-0" />
                  <span className="text-muted-foreground font-mono w-20 shrink-0">Email:</span>
                  {isEditing ? (
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <span className="font-mono">{lead.email || '—'}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="inspected-panel bg-panel border border-border p-4 space-y-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest block mb-1">
                Location & Value
              </span>
              <div className="text-xs text-ink space-y-1.5">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-sage shrink-0" />
                  <span className="text-muted-foreground font-mono w-20 shrink-0">Location:</span>
                  <span>{lead.location || '—'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CurrencyInr size={14} className="text-rust shrink-0" />
                  <span className="text-muted-foreground font-mono w-20 shrink-0">Est. Value:</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="h-7 text-xs font-mono"
                    />
                  ) : (
                    <span className="font-mono font-medium text-sage">
                      {lead.estimated_value ? `₹${lead.estimated_value.toLocaleString()}` : '—'}
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                  <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Website Audit Readout Module */}
          <WebsiteAuditPanel lead={lead} />

          {/* General Lead Notes */}
          <div className="inspected-panel bg-panel border border-border p-4">
            <span className="font-mono text-xs uppercase text-muted-foreground tracking-wider mb-1 block">
              General Client Notes
            </span>
            {isEditing ? (
              <Input
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="text-xs"
              />
            ) : (
              <p className="text-xs text-ink font-sans whitespace-pre-wrap">
                {lead.general_notes || 'No general notes recorded for this lead yet.'}
              </p>
            )}
          </div>

          {/* Timeline & Activities Component */}
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
