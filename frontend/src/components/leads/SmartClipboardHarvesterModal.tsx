import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { harvestPasteLeads } from '@/api/leadsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  X,
  ClipboardText,
  Plus,
  Envelope,
  Phone,
  Globe,
  InstagramLogo,
  CheckCircle,
  WarningOctagon,
  CheckSquare,
  Square,
} from '@phosphor-icons/react';

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
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/g;
const INSTA_REGEX = /(?:https?:\/\/(?:www\.)?instagram\.com\/|(?:^|[^a-zA-Z0-9._%+-])@)([a-zA-Z0-9._]{3,30})(?![a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
const LINKEDIN_REGEX = /(https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+)/gi;
const LINKTREE_REGEX = /(https?:\/\/(?:www\.)?linktr\.ee\/[a-zA-Z0-9_-]+)/gi;
const URL_REGEX = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s"'<>]*)?/gi;

const JUNK_PHRASES = [
  'skip to main content',
  'accessibility help',
  'try without personalisation',
  'based on your past activity',
  'update location',
  'send feedback',
  'privacy',
  'terms',
  'about google',
  'google search',
  'search results',
  'help',
];

const IGNORED_IG_HANDLES = new Set([
  'com',
  'p',
  'reels',
  'gmail',
  'yahoo',
  'hotmail',
  'outlook',
  'icloud',
  'gmail.com',
  'yahoo.com',
  'email',
  'contact',
]);

function cleanBusinessName(
  line: string,
  email: string | null,
  insta: string | null,
  website: string | null,
  idx: number
): string {
  let name = line
    .replace(/^\d+[\.\)]\s*/, '')
    .replace(/^(?:instagram|linkedin|facebook|twitter|x)\s*[·\-\|]\s*/i, '')
    .replace(/\(@[a-zA-Z0-9._]+\)/g, '')
    .split(/\s*[\-\|·]\s*/)[0]
    .trim();

  const lower = name.toLowerCase();
  const isJunk =
    JUNK_PHRASES.some((j) => lower.includes(j)) ||
    lower.startsWith('@') ||
    lower.includes('@gmail.com') ||
    lower.includes('@yahoo');

  if (isJunk || name.length < 2 || name.length > 70 || lower.startsWith('http')) {
    if (insta && !insta.toLowerCase().includes('gmail')) {
      name = insta
        .replace(/^@/, '')
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (email && email.includes('@')) {
      const uname = email.split('@')[0].replace(/[._-]/g, ' ');
      name = uname.replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (website) {
      try {
        const host = new URL(website).hostname.replace(/^www\./, '').split('.')[0];
        name = host.replace(/\b\w/g, (c) => c.toUpperCase());
      } catch {
        name = `Prospect Candidate #${idx + 1}`;
      }
    } else {
      name = `Prospect Candidate #${idx + 1}`;
    }
  }

  return name;
}

export function SmartClipboardHarvesterModal({ isOpen, onClose }: SmartClipboardHarvesterModalProps) {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState('');
  const [location, setLocation] = useState('Vadodara, Gujarat');
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [unselectedSet, setUnselectedSet] = useState<Set<string>>(new Set());

  const parsedItems = useMemo(() => {
    if (!rawText.trim()) return [];

    const blocks = rawText.split(/(?:\r?\n\s*\r?\n|\n(?=\d+\.|[A-Z][a-z]+ - |https?:\/\/))/);
    const items: ExtractedItem[] = [];

    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.length < 15) return;

      const lowerBlock = trimmed.toLowerCase();
      if (
        JUNK_PHRASES.some((j) => lowerBlock.includes(j)) &&
        !trimmed.includes('@') &&
        !trimmed.includes('http')
      ) {
        return;
      }

      const emails = trimmed.match(EMAIL_REGEX);
      const phones = trimmed.match(PHONE_REGEX);

      const instas: string[] = [];
      let match;
      const instaRegexCopy = new RegExp(INSTA_REGEX.source, 'gi');
      while ((match = instaRegexCopy.exec(trimmed)) !== null) {
        const handle = match[1];
        if (handle && !IGNORED_IG_HANDLES.has(handle.toLowerCase())) {
          instas.push(handle);
        }
      }

      const linkedin = trimmed.match(LINKEDIN_REGEX);
      const linktree = trimmed.match(LINKTREE_REGEX);
      const urls = trimmed.match(URL_REGEX);

      const email = emails ? emails[0].toLowerCase() : null;
      const phone = phones ? phones.find((p) => p.replace(/[^0-9+]/g, '').length >= 10) || null : null;
      const instagramHandle = instas.length > 0 ? `@${instas[0]}` : null;
      const linkedinUrl = linkedin ? linkedin[0] : null;
      const linktreeUrl = linktree ? linktree[0] : null;

      let websiteUrl: string | null = null;
      if (urls) {
        const customUrl = urls.find((u) => {
          const l = u.toLowerCase();
          return (
            !l.includes('instagram.com') &&
            !l.includes('facebook.com') &&
            !l.includes('linkedin.com') &&
            !l.includes('google.com') &&
            !l.includes('twitter.com') &&
            !l.includes('x.com')
          );
        });
        if (customUrl) websiteUrl = customUrl;
      }

      const firstLine = trimmed.split('\n')[0];
      const businessName = cleanBusinessName(firstLine, email, instagramHandle, websiteUrl, idx);

      if (email || phone || websiteUrl || instagramHandle || linkedinUrl || linktreeUrl) {
        items.push({
          id: `item_${idx}_${businessName.substring(0, 10)}`,
          businessName,
          email,
          phone,
          websiteUrl,
          instagramHandle,
          linkedinUrl,
          linktreeUrl,
        });
      }
    });

    return items;
  }, [rawText]);

  const selectedItems = useMemo(() => {
    return parsedItems.filter((i) => !unselectedSet.has(i.id));
  }, [parsedItems, unselectedSet]);

  function toggleItem(id: string) {
    setUnselectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectAll() {
    setUnselectedSet(new Set());
  }

  function handleDeselectAll() {
    setUnselectedSet(new Set(parsedItems.map((i) => i.id)));
  }

  async function handleImport() {
    if (selectedItems.length === 0) return;

    setIsImporting(true);
    setErrorMessage(null);

    try {
      const candidatesPayload = selectedItems.map((item) => ({
        businessName: item.businessName && item.businessName.trim() ? item.businessName.trim() : 'Social Prospect',
        email: item.email || null,
        phone: item.phone || null,
        websiteUrl: item.websiteUrl || null,
        instagramHandle: item.instagramHandle || null,
        linkedinUrl: item.linkedinUrl || null,
        linktreeUrl: item.linktreeUrl || null,
        location: location || 'Vadodara, Gujarat',
      }));

      const created = await harvestPasteLeads({
        location: location || 'Vadodara, Gujarat',
        parsedCandidates: candidatesPayload,
      });

      const count = created?.length || selectedItems.length;
      setSuccessCount(count);

      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      await queryClient.invalidateQueries({ queryKey: ['lead-stats'] });

      setTimeout(() => {
        setSuccessCount(null);
        setRawText('');
        setUnselectedSet(new Set());
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error('Failed to import clipboard candidates:', err);
      setErrorMessage(err.message || 'Failed to import candidates to CRM. Please verify connection.');
    } finally {
      setIsImporting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/90 backdrop-blur-sm p-4">
      <div className="inspected-panel bg-[#101010] border border-[#222222] p-6 w-full max-w-3xl shadow-2xl relative max-h-[92vh] flex flex-col group">
        {/* Subtle radial light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF4A00]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isImporting}
          className="absolute top-4 right-4 text-[#8E8982] hover:text-[#F4F0E8] disabled:opacity-30 p-1 cursor-pointer"
        >
          <X size={20} style={{ color: '#F4F0E8' }} />
        </button>

        {/* Header Title with High-Contrast Forced Light Color */}
        <div className="flex items-center gap-3 mb-3 border-b border-[#222222] pb-4">
          <div className="w-9 h-9 border border-[#FF4A00] text-[#FF4A00] flex items-center justify-center bg-[#FF4A00]/10 font-mono text-xs font-bold shrink-0">
            <ClipboardText size={20} style={{ color: '#FF4A00' }} />
          </div>
          <div>
            <h2 className="font-mono text-sm md:text-base font-bold uppercase tracking-wider" style={{ color: '#F4F0E8' }}>
              <span style={{ color: '#FF4A00' }}>SMART WEB CLIPBOARD</span> & CANDIDATE HARVESTER
            </h2>
            <p className="font-mono text-xs mt-0.5" style={{ color: '#A09B93' }}>
              Paste raw search engine results, Instagram/LinkedIn profiles, or Linktree bios to extract CRM leads.
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#7F1D1D]/40 border border-[#7F1D1D] font-mono text-xs flex items-center gap-2" style={{ color: '#F4F0E8' }}>
            <WarningOctagon size={16} className="shrink-0" style={{ color: '#FF4A00' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {/* Raw Text Input */}
          <div className="md:col-span-2 space-y-1.5">
            <Label className="font-mono text-[11px] uppercase tracking-wider block font-bold" style={{ color: '#FF4A00' }}>
              PASTE COPIED WEB / SOCIAL TEXT
            </Label>
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setErrorMessage(null);
              }}
              spellCheck={false}
              placeholder={`Paste copied web text here, e.g.:\n\n1. Acme Web Studio (@acmestudio) - Surat, Gujarat\nContact: hello@acmeweb.com | +91 98765 43210\nWebsite: https://acmeweb.com\n\n2. Creative Bakers - Vadodara\nEmail: contact@creativebakers.in | Linktree: linktr.ee/creativebakers`}
              rows={6}
              className="w-full bg-[#080808] border border-[#333333] p-3 text-xs font-mono placeholder:text-[#666666] focus:outline-none focus:border-[#FF4A00] leading-relaxed resize-none"
              style={{ color: '#F4F0E8', backgroundColor: '#080808' }}
            />
          </div>

          {/* Location & Parser Info */}
          <div className="space-y-3">
            <div>
              <Label className="font-mono text-[11px] uppercase tracking-wider block font-bold mb-1" style={{ color: '#FF4A00' }}>
                TARGET LOCATION
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Vadodara, Gujarat"
                className="bg-[#080808] border-[#333333] text-xs font-mono focus:border-[#FF4A00]"
                style={{ color: '#F4F0E8', backgroundColor: '#080808' }}
              />
            </div>

            <div className="bg-[#080808] border border-[#222222] p-3 text-[11px] font-mono space-y-1.5" style={{ color: '#A09B93' }}>
              <p className="font-bold uppercase tracking-wider text-[10px] mb-1" style={{ color: '#F4F0E8' }}>PARSER ENGINE:</p>

              <div className="flex items-center gap-2" style={{ color: '#FF4A00' }}>
                <Envelope size={13} />
                <span>Email Regex (@domain)</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#00E599' }}>
                <Phone size={13} />
                <span>Phone / WhatsApp</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#FFB800' }}>
                <InstagramLogo size={13} />
                <span>IG / Linktree Handles</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#F4F0E8' }}>
                <Globe size={13} />
                <span>Direct Website URLs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parsed Prospects Section */}
        <div className="flex-1 overflow-y-auto min-h-[180px] max-h-[260px] border border-[#222222] bg-[#080808] p-3 my-3 space-y-2">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2 sticky top-0 bg-[#080808] z-10">
            <span className="font-mono text-xs uppercase font-bold tracking-wider" style={{ color: '#F4F0E8' }}>
              PARSED PROSPECT CANDIDATES ({selectedItems.length} / {parsedItems.length})
            </span>

            {parsedItems.length > 0 && (
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="hover:underline uppercase tracking-wider font-bold cursor-pointer"
                  style={{ color: '#FF4A00' }}
                >
                  Select All
                </button>
                <span style={{ color: '#333333' }}>|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="hover:text-white uppercase tracking-wider cursor-pointer"
                  style={{ color: '#A09B93' }}
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>

          {parsedItems.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono italic" style={{ color: '#8E8982' }}>
              Paste raw search results or social text above to preview parsed candidates.
            </div>
          ) : (
            parsedItems.map((item) => {
              const isSelected = !unselectedSet.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#FF4A00]/60 bg-[#151515]'
                      : 'border-[#222222] bg-[#080808] opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center gap-2.5">
                      <button type="button" style={{ color: '#FF4A00' }}>
                        {isSelected ? <CheckSquare size={16} weight="fill" /> : <Square size={16} style={{ color: '#8E8982' }} />}
                      </button>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: '#F4F0E8' }}>
                        {item.businessName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono pl-6" style={{ color: '#A09B93' }}>
                      {item.email && (
                        <span className="flex items-center gap-1 bg-[#FF4A00]/10 px-1.5 py-0.5 border border-[#FF4A00]/20" style={{ color: '#FF4A00' }}>
                          <Envelope size={11} /> {item.email}
                        </span>
                      )}
                      {item.phone && (
                        <span className="flex items-center gap-1 bg-[#00E599]/10 px-1.5 py-0.5 border border-[#00E599]/20" style={{ color: '#00E599' }}>
                          <Phone size={11} /> {item.phone}
                        </span>
                      )}
                      {item.instagramHandle && (
                        <span className="flex items-center gap-1 bg-[#FFB800]/10 px-1.5 py-0.5 border border-[#FFB800]/20" style={{ color: '#FFB800' }}>
                          <InstagramLogo size={11} /> {item.instagramHandle}
                        </span>
                      )}
                      {item.websiteUrl && (
                        <span className="flex items-center gap-1 underline truncate max-w-[220px]" style={{ color: '#F4F0E8' }}>
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
        <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
          <span className="font-mono text-xs" style={{ color: '#CFC8BE' }}>
            {successCount !== null ? (
              <span className="flex items-center gap-1.5 font-bold animate-pulse" style={{ color: '#00E599' }}>
                <CheckCircle size={15} /> Successfully imported {successCount} candidates into CRM!
              </span>
            ) : (
              `Ready to import ${selectedItems.length} leads`
            )}
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isImporting}
              className="font-mono text-xs border-[#333333] hover:bg-[#222222]"
              style={{ color: '#F4F0E8' }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleImport}
              disabled={isImporting || selectedItems.length === 0}
              className="bg-[#FF4A00] hover:bg-[#FF5A00] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,74,0,0.25)] disabled:opacity-40"
              style={{ color: '#F4F0E8' }}
            >
              <Plus size={14} style={{ color: '#F4F0E8' }} />
              {isImporting ? 'Importing to CRM...' : 'Import Candidates to CRM'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
