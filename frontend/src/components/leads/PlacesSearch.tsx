import { useState } from 'react';
import { usePlacesSearch, type PlaceSearchResult } from '@/hooks/usePlacesSearch';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MagnifyingGlass, Globe, WarningOctagon, Plus, CheckCircle } from '@phosphor-icons/react';

export function PlacesSearch() {
  const [query, setQuery] = useState('furniture shops');
  const [location, setLocation] = useState('Vadodara, Gujarat');
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const { results, loading, error, search } = usePlacesSearch();
  const queryClient = useQueryClient();

  async function handleImport(result: PlaceSearchResult) {
    setImporting(result.place_id);
    const { error: insertError } = await supabase.from('leads').insert({
      business_name: result.business_name,
      phone: result.phone,
      website_url: result.website_url,
      location,
      source: 'google_places',
      source_query: query,
      website_notes: result.has_website
        ? 'Website found via Google Places search.'
        : 'No website found — Prime outreach prospect.',
      stage: 'new',
    });

    if (!insertError) {
      setImported((prev) => new Set(prev).add(result.place_id));
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
    setImporting(null);
  }

  return (
    <div className="inspected-panel bg-panel border border-border p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <MagnifyingGlass size={18} className="text-rust" />
        <span className="font-mono text-xs uppercase text-muted-foreground tracking-widest">
          Lead Discovery Engine
        </span>
      </div>
      <h2 className="font-serif text-xl text-ink mb-4">Google Places Business Finder</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Business category e.g. furniture shops, dental clinics, cafes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-xs font-mono flex-1"
        />
        <Input
          placeholder="Location / City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-xs font-mono sm:w-64"
        />
        <Button
          onClick={() => search(query, location)}
          disabled={loading || !query.trim()}
          className="bg-rust hover:bg-rust/90 text-ink text-xs font-mono shrink-0 flex items-center gap-1.5"
        >
          <MagnifyingGlass size={14} />
          {loading ? 'Searching…' : 'Search Places'}
        </Button>
      </div>

      {error && <p className="text-xs font-mono text-rust mb-3">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2 mt-4 border-t border-border pt-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Search Results ({results.length} businesses found)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {results.map((r) => (
              <div
                key={r.place_id}
                className="bg-base border border-border p-3 flex items-start justify-between gap-3 hover:border-muted-foreground/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-xs text-ink font-semibold">{r.business_name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{r.address || '—'}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      className={`font-mono text-[10px] uppercase border ${
                        r.has_website
                          ? 'bg-sage/15 text-sage border-sage/40'
                          : 'bg-rust/15 text-rust border-rust/40'
                      }`}
                    >
                      {r.has_website ? (
                        <span className="flex items-center gap-1">
                          <Globe size={12} /> Has Website
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <WarningOctagon size={12} /> No Website
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={imported.has(r.place_id) || importing === r.place_id}
                  onClick={() => handleImport(r)}
                  className="text-xs font-mono border-border shrink-0"
                >
                  {imported.has(r.place_id) ? (
                    <span className="text-sage flex items-center gap-1">
                      <CheckCircle size={14} /> Added
                    </span>
                  ) : importing === r.place_id ? (
                    'Adding…'
                  ) : (
                    <span className="flex items-center gap-1">
                      <Plus size={14} /> Add Lead
                    </span>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}