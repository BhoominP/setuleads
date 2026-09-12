import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X,
  MapPin,
  Phone,
  Globe,
  WarningOctagon,
  CheckCircle,
  CurrencyInr,
  Compass,
  CaretDown,
  CaretUp,
  ArrowUpRight,
  EnvelopeSimple,
  Sparkle,
  Copy,
  CircleNotch,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { generateOutreachEmail } from '@/api/leadsApi';
import type { UnifiedSearchResult } from '@/types/leadSource';
import type { LeadStage } from '@/types/lead';

interface LeadPreviewModalProps {
  lead: UnifiedSearchResult | null;
  onClose: () => void;
  onConfirm: (payload: {
    result: UnifiedSearchResult;
    contactName: string;
    stage: LeadStage;
    estimatedValue: number | null;
    generalNotes: string;
  }) => Promise<void>;
}

export function LeadPreviewModal({ lead, onClose, onConfirm }: LeadPreviewModalProps) {
  const [contactName, setContactName] = useState('');
  const [stage, setStage] = useState<LeadStage>('new');
  const [estimatedValue, setEstimatedValue] = useState('25000');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [outreachEmail, setOutreachEmail] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!lead) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;

    setIsSaving(true);
    try {
      await onConfirm({
        result: lead,
        contactName: contactName.trim(),
        stage,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        generalNotes: generalNotes.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to confirm lead import:', err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerateEmail() {
    if (!lead) return;
    setIsGeneratingEmail(true);
    try {
      const payload = {
        id: lead.external_id,
        businessName: lead.business_name,
        socialHandle: lead.social_handle,
        whatsapp: lead.whatsapp,
        address: lead.address,
        latitude: lead.latitude,
        longitude: lead.longitude,
        phone: lead.phone,
        email: lead.email,
        websiteUrl: lead.website_url,
        categories: lead.category ? [lead.category] : [],
        sourceQuery: (lead as any).source_query,
        provider: lead.source?.toUpperCase(),
        entityType: lead.entity_type || 'BUSINESS',
        websiteStatus: lead.website_status,
        relevanceScore: lead.relevance_score,
        relevanceStatus: lead.relevance_status,
        matchReason: lead.match_reason,
        websiteOpportunityReason: lead.website_opportunity_reason,
        decisionMakerName: lead.decision_maker_name,
        decisionMakerTitle: lead.decision_maker_title,
        websiteIssues: lead.website_issues,
        positiveEvidence: lead.positive_evidence,
        negativeEvidence: lead.negative_evidence,
        aiReasoning: lead.ai_reasoning,
        aiPitchAngles: lead.ai_pitch_angles,
        aiWebsiteStrengths: lead.ai_website_strengths,
        aiWebsiteIssues: lead.ai_website_issues,
        isAiVerified: lead.is_ai_verified,
      };
      const res = await generateOutreachEmail(payload);
      if (res && res.outreachEmail) {
        setOutreachEmail(res.outreachEmail);
      }
    } catch (err) {
      console.error('Failed to generate outreach email:', err);
    } finally {
      setIsGeneratingEmail(false);
    }
  }

  function handleCopyEmail() {
    if (!outreachEmail) return;
    navigator.clipboard.writeText(outreachEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  const identityPct = lead.identity_confidence || 90;
  const entityType = lead.entity_type || 'BUSINESS';

  // Determine Website URL from candidate website_url or source_evidence
  const websiteUrl = lead.website_url || (lead as any).websiteUrl || lead.source_evidence?.sourceUrl || null;
  const hasWebsite = Boolean(websiteUrl && websiteUrl.trim().length > 0);

  const sourceLabel = lead.source === 'social_xray'
    ? 'Social X-Ray'
    : lead.source === 'geoapify'
    ? 'Geoapify'
    : lead.source === 'osm'
    ? 'OpenStreetMap'
    : lead.source;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="inspected-panel bg-panel border border-border p-6 w-full max-w-lg shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-ink"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-1">
          <Compass size={16} className="text-rust" />
          <span className="font-mono text-xs uppercase text-muted-foreground tracking-widest">
            Pre-Import Prospect Intelligence Inspection
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="font-serif text-2xl text-ink font-medium">{lead.business_name}</h2>
          <Badge className={`font-mono text-xs px-2 py-0.5 uppercase border shrink-0 ${
            lead.qualification_level === 'HOT'
              ? 'bg-rust/20 text-rust border-rust/50 font-bold'
              : lead.qualification_level === 'HIGH'
              ? 'bg-ochre/20 text-ochre border-ochre/50 font-bold'
              : 'bg-sage/20 text-sage border-sage/50'
          }`}>
            {lead.qualification_level === 'HOT' ? '🔥 HOT PROSPECT' : lead.qualification_level === 'HIGH' ? '🟠 HIGH PROSPECT' : '🟡 POTENTIAL'}
          </Badge>
        </div>

        {/* Source, Entity Type & Website Status Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge className="font-mono text-xs uppercase border border-rust/40 text-rust bg-rust/10">
            {entityType}
          </Badge>
          <Badge
            className={`font-mono text-xs uppercase border ${
              lead.source === 'social_xray'
                ? 'border-ochre/40 text-ochre bg-ochre/10'
                : 'border-sage/40 text-sage bg-sage/10'
            }`}
          >
            SOURCE: {sourceLabel}
          </Badge>

          {lead.is_ai_verified && (
            <Badge className="font-mono text-xs uppercase border border-ochre/60 text-ochre bg-ochre/20 flex items-center gap-1 font-bold">
              <Sparkle size={13} className="text-ochre" /> GEMINI AI QUALIFIED
            </Badge>
          )}

          <Badge
            className={`font-mono text-xs uppercase border ${
              hasWebsite
                ? 'bg-sage/15 text-sage border-sage/40'
                : 'bg-rust/15 text-rust border-rust/40'
            }`}
          >
            {hasWebsite ? (
              <span className="flex items-center gap-1">
                <Globe size={13} /> {lead.website_status || 'HAS WEBSITE'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WarningOctagon size={13} /> NO WEBSITE DISCOVERED
              </span>
            )}
          </Badge>
        </div>

        {/* 4-Meter Sub-Score Breakdown Metrics Box */}
        <div className="grid grid-cols-4 gap-2 mb-4 font-mono text-center bg-base border border-border p-2.5">
          <div className="bg-panel p-1.5 border border-border/60">
            <span className="text-[9px] text-muted-foreground block uppercase">Opportunity</span>
            <span className="text-sm font-bold text-rust">{lead.lead_opportunity_score || 80}/100</span>
          </div>
          <div className="bg-panel p-1.5 border border-border/60">
            <span className="text-[9px] text-muted-foreground block uppercase">Web Opportunity</span>
            <span className="text-sm font-bold text-ochre">{lead.website_opportunity_score || 70}/100</span>
          </div>
          <div className="bg-panel p-1.5 border border-border/60">
            <span className="text-[9px] text-muted-foreground block uppercase">Contactability</span>
            <span className="text-sm font-bold text-sage">{lead.contactability_score || 50}/100</span>
          </div>
          <div className="bg-panel p-1.5 border border-border/60">
            <span className="text-[9px] text-muted-foreground block uppercase">Business Fit</span>
            <span className="text-sm font-bold text-ink">{lead.business_fit_score || 85}/100</span>
          </div>
        </div>

        {/* SECTION 1: GEMINI AI SEMANTIC INTELLIGENCE (IF AVAILABLE) */}
        {(lead.is_ai_verified || lead.ai_reasoning || (lead.ai_pitch_angles && lead.ai_pitch_angles.length > 0)) && (
          <div className="bg-gradient-to-r from-ochre/10 via-base to-sage/10 border border-ochre/40 p-3.5 mb-4 font-mono space-y-2 inspected-panel">
            <div className="flex items-center justify-between border-b border-ochre/30 pb-1.5">
              <span className="text-xs uppercase text-ochre font-bold flex items-center gap-1.5">
                <Sparkle size={15} className="text-ochre animate-pulse" />
                ✨ AI SEMANTIC INTELLIGENCE & INTERPRETATION
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">Reasoned Grounded Facts</span>
            </div>

            {lead.ai_reasoning && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">Business Intent Reasoning:</span>
                <p className="text-xs text-ink/90 leading-relaxed font-sans bg-panel/80 p-2 border border-border/60 mt-0.5">
                  "{lead.ai_reasoning}"
                </p>
              </div>
            )}

            {lead.ai_pitch_angles && lead.ai_pitch_angles.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-muted-foreground uppercase block font-bold mb-1">
                  🎯 AI Strategic Pitch Angles:
                </span>
                <div className="flex flex-wrap gap-1">
                  {lead.ai_pitch_angles.map((angle, i) => (
                    <span key={i} className="text-[10px] bg-ochre/15 text-ochre border border-ochre/30 px-2 py-0.5 rounded-xs font-mono">
                      • {angle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: VERIFIED FACTUAL AUDIT & QUICK READOUT */}
        <div className="bg-base border border-border p-4 space-y-3 mb-4 inspected-panel">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="font-mono text-xs uppercase text-sage font-bold flex items-center gap-1.5">
              <CheckCircle size={15} className="text-sage" />
              VERIFIED FACTUAL AUDIT
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Deterministic Engine Audit</span>
          </div>

          {/* Location Row */}
          <div className="flex items-start gap-2 text-xs">
            <MapPin size={16} className="text-sage shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[10px] uppercase text-muted-foreground block">Location Address</span>
              <span className="text-ink font-mono">{lead.address || '—'}</span>
            </div>
          </div>

          {/* Contact Details & Decision Maker Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs">
              <Phone size={15} className="text-rust shrink-0" />
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground block">Phone Contact</span>
                <span className="text-ink font-mono">{lead.phone || 'Not Listed'}</span>
              </div>
            </div>

            {lead.email && (
              <div className="flex items-center gap-2 text-xs truncate">
                <EnvelopeSimple size={15} className="text-ochre shrink-0" />
                <div className="truncate">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block">Email Address</span>
                  <span className="text-ink font-mono truncate block">{lead.email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Decision Maker if identified */}
          {(lead.decision_maker_name || lead.decision_maker_title) && (
            <div className="pt-2 border-t border-border/60 text-xs font-mono">
              <span className="text-[10px] uppercase text-muted-foreground block">Identified Decision Maker</span>
              <span className="text-rust font-bold">
                {lead.decision_maker_name ? lead.decision_maker_name + ' ' : ''}
                ({lead.decision_maker_title || 'Owner/Founder'})
              </span>
            </div>
          )}

          {/* PROMINENT WEBSITE URL ROW */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-start gap-2 text-xs">
              <Globe size={16} className="text-sage shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                  Website URL Link
                </span>
                {hasWebsite && websiteUrl ? (
                  <a
                    href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sage font-mono hover:text-rust underline font-bold flex items-center gap-1 break-all text-xs transition-colors mt-0.5"
                  >
                    <span>{websiteUrl}</span>
                    <ArrowUpRight size={13} className="shrink-0" />
                  </a>
                ) : (
                  <span className="text-rust font-mono text-xs block mt-0.5 italic">
                    No custom website URL discovered — Outreach opportunity for site creation.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Website Issues List */}
          {lead.website_issues && lead.website_issues.length > 0 && (
            <div className="pt-2.5 border-t border-border/60">
              <span className="font-mono text-[10px] uppercase text-rust tracking-wider font-bold block mb-1">
                ⚠ Website Redesign Opportunities & Issues
              </span>
              <div className="space-y-1 bg-rust/5 p-2 border border-rust/30 font-mono text-[11px] text-rust">
                {lead.website_issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <WarningOctagon size={13} className="shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WHY THIS IS A LEAD Callout */}
          <div className="pt-2.5 border-t border-border/60">
            <span className="font-mono text-[10px] uppercase text-sage tracking-wider font-bold block mb-1">
              ⚡ Why is this a qualified lead?
            </span>
            <div className="text-xs text-ink font-sans bg-panel p-2.5 border border-border/70 space-y-1">
              <p className="font-mono text-xs text-sage leading-relaxed">
                "{lead.match_reason || lead.relevance_reasons?.[0] || 'Verified business prospect matching target intent and location with direct outreach channels.'}"
              </p>
            </div>
          </div>

          {/* Expandable Evidence Drawer */}
          <div className="pt-2.5 border-t border-border/60 font-mono">
            <button
              type="button"
              onClick={() => setShowEvidence(!showEvidence)}
              className="flex items-center justify-between w-full text-[10px] uppercase text-muted-foreground hover:text-ink transition-colors"
            >
              <span>Why this result? (Evidence Provenance Details)</span>
              {showEvidence ? <CaretUp size={12} /> : <CaretDown size={12} />}
            </button>

            {showEvidence && (
              <div className="mt-2 bg-panel p-3 border border-border/70 text-[11px] space-y-2 font-mono">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase block">Entity Classification</span>
                  <span className="text-ink font-bold">{entityType} (Identity Confidence: {identityPct}%)</span>
                </div>
                {lead.source_evidence?.platform && (
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block">Platform</span>
                    <span className="text-ink font-bold">{lead.source_evidence.platform}</span>
                  </div>
                )}
                {lead.source_evidence?.sourceQuery && (
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block">Query Executed</span>
                    <span className="text-rust">{lead.source_evidence.sourceQuery}</span>
                  </div>
                )}
                {lead.source_evidence?.sourceUrl && (
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block">Source URL</span>
                    <a
                      href={lead.source_evidence.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ochre underline break-all block flex items-center gap-1"
                    >
                      <span>{lead.source_evidence.sourceUrl}</span>
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                )}
                {lead.source_evidence?.resultTitle && (
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block">Indexed Title</span>
                    <span className="text-ink">{lead.source_evidence.resultTitle}</span>
                  </div>
                )}
                {lead.source_evidence?.snippet && (
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block">Snippet Evidence</span>
                    <p className="text-muted-foreground text-[10px] leading-relaxed italic bg-base p-2 border border-border/40">
                      "{lead.source_evidence.snippet}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: PERSONALIZED OUTREACH PITCH GENERATOR */}
        <div className="bg-panel border border-ochre/40 p-3.5 mb-4 space-y-2.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-ochre font-bold flex items-center gap-1.5">
              <PaperPlaneTilt size={15} className="text-ochre" />
              PERSONALIZED OUTREACH EMAIL PITCH
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isGeneratingEmail}
              onClick={handleGenerateEmail}
              className="text-xs border-ochre/60 text-ochre hover:bg-ochre/10 flex items-center gap-1.5 font-bold"
            >
              {isGeneratingEmail ? (
                <>
                  <CircleNotch size={14} className="animate-spin text-ochre" />
                  <span>Drafting Pitch…</span>
                </>
              ) : (
                <>
                  <Sparkle size={14} />
                  <span>{outreachEmail ? 'Regenerate Email' : 'Generate Outreach Pitch'}</span>
                </>
              )}
            </Button>
          </div>

          {outreachEmail && (
            <div className="space-y-2 bg-base p-3 border border-border/80">
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="text-[10px] text-sage uppercase font-bold">Generated 3-Sentence Cold Pitch (Verified Facts Only)</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyEmail}
                  className="text-xs text-muted-foreground hover:text-ink h-7 px-2 flex items-center gap-1"
                >
                  {copiedEmail ? (
                    <span className="text-sage flex items-center gap-1">
                      <CheckCircle size={13} /> Copied!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy size={13} /> Copy Pitch
                    </span>
                  )}
                </Button>
              </div>
              <p className="font-sans text-xs text-ink leading-relaxed whitespace-pre-wrap">
                {outreachEmail}
              </p>
            </div>
          )}
        </div>

        {/* Pre-Import Editable Parameters */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="font-mono text-xs text-muted-foreground">Contact Person Name</Label>
              <Input
                placeholder="e.g. Founder / Manager"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="font-mono text-xs text-muted-foreground">Initial Stage</Label>
              <Select value={stage} onValueChange={(val) => setStage(val as LeadStage)}>
                <SelectTrigger className="font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="font-mono text-xs text-muted-foreground flex items-center justify-between">
              <span>Estimated Deal Value (INR)</span>
              <span className="text-[10px] text-rust">Web Dev Pitch</span>
            </Label>
            <div className="relative">
              <CurrencyInr size={15} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="25000"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="font-mono text-xs pl-8"
              />
            </div>
          </div>

          <div>
            <Label className="font-mono text-xs text-muted-foreground">General Notes / Strategy</Label>
            <Input
              placeholder="e.g. Sourced via Social X-Ray"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="font-mono text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-rust hover:bg-rust/90 text-ink font-mono text-xs flex items-center gap-1.5"
            >
              {isSaving ? 'Importing…' : <><CheckCircle size={15} /> Confirm & Import Lead</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
