import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { harvestPasteLeads } from '@/api/leadsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, ClipboardText, Plus, Envelope, Phone, Globe, InstagramLogo, CheckCircle } from '@phosphor-icons/react';

interface SmartClipboardHarvesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExtractedItem {
  id: string;
  businessName: string;
  email: string | null;
  phone: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  linkedinUrl: string | null;
  linktreeUrl: string | null;
  selected: boolean;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/g;
const INSTA_REGEX = /(?:instagram\.com\/|@)([a-zA-Z0-9._]{3,30})/gi;
const LINKEDIN_REGEX = /(https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+)/gi;
const LINKTREE_REGEX = /(https?:\/\/(?:www\.)?linktr\.ee\/[a-zA-Z0-9_-]+)/gi;
const URL_REGEX = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s"'<>]*)?/gi;

export function SmartClipboardHarvesterModal({ isOpen, onClose }: SmartClipboardHarvesterModalProps) {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState('');
  const [location, setLocation] = useState('Vadodara, Gujarat');
  const [isImporting, setIsImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const parsedItems = useMemo(() => {
    if (!rawText.trim()) return [];

    const blocks = rawText.split(/(?:\r?\n\s*\r?\n|\n(?=\d+\.|[A-Z][a-z]+ - |https?:\/\/))/);
    const items: ExtractedItem[] = [];

    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.length < 15) return;

      const emails = trimmed.match(EMAIL_REGEX);
      const phones = trimmed.match(PHONE_REGEX);
      const instas = Array.from(trimmed.matchAll(INSTA_REGEX), m => m[1]);
      const linkedin = trimmed.match(LINKEDIN_REGEX);
      const linktree = trimmed.match(LINKTREE_REGEX);
      const urls = trimmed.match(URL_REGEX);

      let email = emails ? emails[0].toLowerCase() : null;
      let phone = phones ? phones.find(p => p.replace(/[^0-9+]/g, '').length >= 10) || null : null;
      let instagramHandle = instas.length > 0 && !['com', 'p', 'reels'].includes(instas[0].toLowerCase()) ? `@${instas[0]}` : null;
      let linkedinUrl = linkedin ? linkedin[0] : null;
      let linktreeUrl = linktree ? linktree[0] : null;

      let websiteUrl = null;
      if (urls) {
        const customUrl = urls.find(u => {
          const l = u.toLowerCase();
          return !l.includes('instagram.com') && !l.includes('facebook.com') && !l.includes('linkedin.com') && !l.includes('google.com') && !l.includes('twitter.com') && !l.includes('x.com');
        });
        if (customUrl) websiteUrl = customUrl;
      }

      // Name Heuristic
      const firstLine = trimmed.split('\n')[0].replace(/^\d+\.\s*/, '').split('-')[0].split('|')[0].trim();
      let businessName = firstLine.length >= 3 && firstLine.length <= 60 && !firstLine.toLowerCase().startsWith('http')
        ? firstLine
        : (instagramHandle || (email ? email.split('@')[0] : `Social Lead #${idx + 1}`));

      if (email || phone || websiteUrl || instagramHandle || linkedinUrl || linktreeUrl) {
        items.push({
          id: `item_${idx}`,
          businessName,
          email,
          phone,
          websiteUrl,
          instagramHandle,
          linkedinUrl,
          linktreeUrl,
          selected: true,
        });
      }
    });

    return items;
  }, [rawText]);

  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  function toggleItem(id: string) {
    setSelectedMap(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : false,
    }));
  }

  async function handleImport() {
    const toImport = parsedItems.filter(item => selectedMap[item.id] !== false);
    if (toImport.length === 0) return;

    setIsImporting(true);
    try {
      const created = await harvestPasteLeads({
        location,
        parsedCandidates: toImport.map(item => ({
          businessName: item.businessName,
          email: item.email,
          phone: item.phone,
          websiteUrl: item.websiteUrl,
          instagramHandle: item.instagramHandle,
          linkedinUrl: item.linkedinUrl,
          linktreeUrl: item.linktreeUrl,
          location,
        })),
      });

      setSuccessCount(created?.length || toImport.length);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setTimeout(() => {
        setSuccessCount(null);
        setRawText('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to import clipboard candidates', err);
    } finally {
      setIsImporting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/85 backdrop-blur-xs p-4">
      <div className="inspected-panel bg-panel border border-border p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <button
          onClick={onClose}
          disabled={isImporting}
          className="absolute top-4 right-4 text-muted-foreground hover:text-ink disabled:opacity-30"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 border border-rust text-rust flex items-center justify-center bg-rust/10 font-mono text-xs">
            <ClipboardText size={16} />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-wider">
              Smart Web Clipboard & Social Harvester
            </h2>
            <p className="font-sans text-xs text-muted-foreground">
              Paste raw Google search results, Instagram profiles, LinkedIn pages, or Linktree bios to parse leads.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="md:col-span-2">
            <Label className="font-mono text-[10px] uppercase text-muted-foreground mb-1 block">
              Paste Copied Web / Social Text
            </Label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={`Paste copied text here, e.g.:\n1. Acme Clothing (@acme_style) - Los Angeles\nContact: hello@acmeclothing.com | +1 213 555 0199\nWebsite: https://acmeclothing.com\n\n2. Sweet Treats Bakery - Vadodara\nEmail: sweettreats@gmail.com | Linktree: linktr.ee/sweettreats`}
              rows={6}
              className="w-full bg-base border border-border p-3 text-xs font-mono text-ink placeholder:text-muted-foreground focus:outline-hidden focus:border-rust"
            />
          </div>

          <div>
            <Label className="font-mono text-[10px] uppercase text-muted-foreground mb-1 block">
              Default Target Location
            </Label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Vadodara, Gujarat or Los Angeles"
              className="bg-base border-border text-xs font-mono mb-3"
            />

            <div className="bg-base/70 border border-border p-3 text-[11px] font-mono text-muted-foreground space-y-1">
              <p className="font-bold text-ink uppercase mb-1">Parser Highlights:</p>

              <div className="flex items-center gap-1.5 text-rust">
                <Envelope size={12} />
                <span>Auto Email Regex (@gmail/@domain)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sage">
                <Phone size={12} />
                <span>Phone / WhatsApp Numbers</span>
              </div>
              <div className="flex items-center gap-1.5 text-ochre">
                <InstagramLogo size={12} />
                <span>Instagram & Linktree Handles</span>
              </div>
              <div className="flex items-center gap-1.5 text-rust">
                <Globe size={12} />
                <span>Direct Website URLs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parsed Prospects Preview */}
        <div className="flex-1 overflow-y-auto min-h-[150px] border border-border/80 bg-base/50 p-3 mb-4 space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-mono text-xs uppercase text-muted-foreground font-semibold">
              Parsed Prospect Candidates ({parsedItems.filter(i => selectedMap[i.id] !== false).length} / {parsedItems.length})
            </span>
          </div>

          {parsedItems.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-muted-foreground italic">
              Paste raw search results or social text above to preview identified candidates.
            </div>
          ) : (
            parsedItems.map(item => {
              const isChecked = selectedMap[item.id] !== false;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-2.5 border transition-colors cursor-pointer flex items-center justify-between ${
                    isChecked ? 'border-rust/40 bg-rust/5' : 'border-border/60 bg-panel opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="accent-rust shrink-0"
                      />
                      <span className="font-mono text-xs font-bold text-ink">{item.businessName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground pl-5">
                      {item.email && (
                        <span className="flex items-center gap-1 text-rust">
                          <Envelope size={11} /> {item.email}
                        </span>
                      )}
                      {item.phone && (
                        <span className="flex items-center gap-1 text-sage">
                          <Phone size={11} /> {item.phone}
                        </span>
                      )}
                      {item.instagramHandle && (
                        <span className="flex items-center gap-1 text-ochre">
                          <InstagramLogo size={11} /> {item.instagramHandle}
                        </span>
                      )}
                      {item.websiteUrl && (
                        <span className="flex items-center gap-1 text-rust underline truncate max-w-[200px]">
                          <Globe size={11} /> {item.websiteUrl}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="font-mono text-xs text-muted-foreground">
            {successCount !== null ? (
              <span className="text-sage flex items-center gap-1 font-bold">
                <CheckCircle size={14} /> Imported {successCount} prospects into CRM!
              </span>
            ) : (
              `Ready to import ${parsedItems.filter(i => selectedMap[i.id] !== false).length} leads`
            )}
          </span>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onClose} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={isImporting || parsedItems.filter(i => selectedMap[i.id] !== false).length === 0}
              className="bg-rust hover:bg-rust/90 text-panel font-mono text-xs flex items-center gap-1.5"
            >
              <Plus size={14} />
              {isImporting ? 'Importing…' : 'Import Candidates to CRM'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
