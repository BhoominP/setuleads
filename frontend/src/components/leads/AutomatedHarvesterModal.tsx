import { useState } from 'react';
import { useAutoHarvester } from '@/hooks/useAutoHarvester';
import { LocationInput } from './LocationInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Lightning,
  X,
  CheckCircle,
  Pulse,
} from '@phosphor-icons/react';
import type { LeadSourceProviderId } from '@/types/leadSource';

interface AutomatedHarvesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_CATEGORIES = [
  { id: 'furniture', label: 'Furniture Shops', query: 'furniture shops' },
  { id: 'dentists', label: 'Dental Clinics', query: 'dental clinics' },
  { id: 'cafes', label: 'Cafes & Restaurants', query: 'cafes and restaurants' },
  { id: 'hardware', label: 'Hardware Stores', query: 'hardware stores' },
  { id: 'auto', label: 'Auto Repair', query: 'auto repair workshops' },
  { id: 'interior', label: 'Interior Designers', query: 'interior designers' },
];

export function AutomatedHarvesterModal({ isOpen, onClose }: AutomatedHarvesterModalProps) {
  const { startHarvest, isHarvesting, currentStep, summary, error } = useAutoHarvester();

  const [location, setLocation] = useState('Vadodara, Gujarat');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'furniture shops',
    'dental clinics',
  ]);
  const [customCategory, setCustomCategory] = useState('');
  const [targetQuantity, setTargetQuantity] = useState(15);
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(true);
  const [autoAuditWebsites, setAutoAuditWebsites] = useState(true);
  const [sources, setSources] = useState<LeadSourceProviderId[]>(['google_places', 'osm']);

  if (!isOpen) return null;

  function toggleCategory(query: string) {
    if (selectedCategories.includes(query)) {
      if (selectedCategories.length === 1) return;
      setSelectedCategories((prev) => prev.filter((c) => c !== query));
    } else {
      setSelectedCategories((prev) => [...prev, query]);
    }
  }

  function addCustomCategory() {
    if (!customCategory.trim()) return;
    const cat = customCategory.trim().toLowerCase();
    if (!selectedCategories.includes(cat)) {
      setSelectedCategories((prev) => [...prev, cat]);
    }
    setCustomCategory('');
  }

  function toggleSource(src: LeadSourceProviderId) {
    if (sources.includes(src)) {
      if (sources.length === 1) return;
      setSources((prev) => prev.filter((s) => s !== src));
    } else {
      setSources((prev) => [...prev, src]);
    }
  }

  function handleLaunch() {
    startHarvest({
      location,
      categories: selectedCategories,
      targetQuantity,
      sources,
      onlyNoWebsite,
      autoAuditWebsites,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-xs p-4">
      <div className="inspected-panel bg-panel border border-border p-6 w-full max-w-xl shadow-2xl relative overflow-hidden">
        {/* Header */}
        <button
          onClick={onClose}
          disabled={isHarvesting}
          className="absolute top-4 right-4 text-muted-foreground hover:text-ink disabled:opacity-30"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 border border-rust text-rust flex items-center justify-center bg-rust/10 font-mono text-xs">
            <Lightning size={14} weight="fill" />
          </div>
          <span className="font-mono text-xs uppercase text-muted-foreground tracking-widest">
            Automated Sourcing Pipeline
          </span>
        </div>
        <h2 className="font-serif text-2xl text-ink mb-4">Lead Harvester Bot</h2>

        {error && <p className="text-xs font-mono text-rust mb-3">{error}</p>}

        {/* Live Progress View during Harvesting */}
        {isHarvesting || currentStep.id === 'complete' ? (
          <div className="space-y-6 my-4 p-6 border border-border bg-base">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pulse size={20} className="text-rust animate-pulse" />
                <span className="font-mono text-xs font-semibold text-ink">
                  {currentStep.label}
                </span>
              </div>
              <span className="font-mono text-xs text-rust font-bold">
                {currentStep.progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-panel h-3 border border-border overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-rust via-ochre to-sage transition-all duration-300"
                style={{ width: `${currentStep.progressPercent}%` }}
              />
            </div>

            {/* Summary Card when complete */}
            {summary && (
              <div className="border border-sage/40 bg-sage/10 p-4 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-sage">
                  <CheckCircle size={20} weight="fill" />
                  <h4 className="font-serif text-lg text-ink font-medium">Harvest Batch Complete!</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-ink pt-2">
                  <div className="bg-panel p-2 border border-border text-center">
                    <span className="text-[10px] text-muted-foreground uppercase block">Discovered</span>
                    <span className="text-base font-bold text-ink">{summary.totalDiscovered}</span>
                  </div>
                  <div className="bg-panel p-2 border border-border text-center">
                    <span className="text-[10px] text-muted-foreground uppercase block">Imported</span>
                    <span className="text-base font-bold text-sage">{summary.totalImported}</span>
                  </div>
                  <div className="bg-panel p-2 border border-border text-center">
                    <span className="text-[10px] text-muted-foreground uppercase block">No Website</span>
                    <span className="text-base font-bold text-rust">{summary.noWebsiteCount}</span>
                  </div>
                  <div className="bg-panel p-2 border border-border text-center">
                    <span className="text-[10px] text-muted-foreground uppercase block">Avg Score</span>
                    <span className="text-base font-bold text-ochre">
                      {summary.averageScore !== null ? `${summary.averageScore}/100` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={onClose}
                    className="bg-rust hover:bg-rust/90 text-ink text-xs font-mono"
                  >
                    View Imported Leads
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Configuration Controls */
          <div className="space-y-5">
            {/* Target Location */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Target Location / City</Label>
              <LocationInput value={location} onChange={setLocation} />
            </div>

            {/* Target Categories */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Target Business Categories (Select 1 or more)
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.query);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.query)}
                      className={`font-mono text-xs px-2.5 py-1 border transition-all ${
                        isSelected
                          ? 'bg-rust/15 text-rust border-rust/50 font-medium'
                          : 'bg-base text-muted-foreground border-border hover:text-ink'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Category Add */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom keyword (e.g. jewelry shops)"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                  className="text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomCategory}
                  className="text-xs font-mono border-border shrink-0"
                >
                  Add Category
                </Button>
              </div>
            </div>

            {/* Target Quantity & Data Sources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-muted-foreground">Target Lead Quantity</Label>
                  <span className="font-mono text-xs font-bold text-rust">{targetQuantity} leads</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(Number(e.target.value))}
                  className="w-full accent-rust cursor-pointer"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Data Providers</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSource('google_places')}
                    className={`font-mono text-xs px-2 py-1 border flex-1 text-center transition-all ${
                      sources.includes('google_places')
                        ? 'bg-panel text-rust border-rust/40 font-medium'
                        : 'bg-base text-muted-foreground border-border'
                    }`}
                  >
                    Google Places
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSource('osm')}
                    className={`font-mono text-xs px-2 py-1 border flex-1 text-center transition-all ${
                      sources.includes('osm')
                        ? 'bg-panel text-sage border-sage/40 font-medium'
                        : 'bg-base text-muted-foreground border-border'
                    }`}
                  >
                    OpenStreetMap
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunity Filters & Auto-Audit Toggles */}
            <div className="border border-border bg-base p-3 space-y-2">
              <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider block">
                Target Filtering & Automation Options
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-ink font-sans">
                <input
                  type="checkbox"
                  checked={onlyNoWebsite}
                  onChange={(e) => setOnlyNoWebsite(e.target.checked)}
                  className="accent-rust cursor-pointer"
                />
                <span className="font-medium text-rust">
                  ⚡ Target ONLY businesses WITHOUT a website (High opportunity signal)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-ink font-sans">
                <input
                  type="checkbox"
                  checked={autoAuditWebsites}
                  onChange={(e) => setAutoAuditWebsites(e.target.checked)}
                  className="accent-sage cursor-pointer"
                />
                <span>Auto-run 0-100 quality audit on all discovered websites</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs font-mono">
                Cancel
              </Button>
              <Button
                onClick={handleLaunch}
                className="bg-rust hover:bg-rust/90 text-ink text-xs font-mono flex items-center gap-1.5"
              >
                <Lightning size={14} weight="fill" />
                Launch Harvester Bot
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
