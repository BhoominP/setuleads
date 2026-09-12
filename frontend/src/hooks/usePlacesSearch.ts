import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PlaceSearchResult {
  place_id: string;
  business_name: string;
  address: string | null;
  phone: string | null;
  website_url: string | null;
  has_website: boolean;
}

export function usePlacesSearch() {
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string, location: string) {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('search-places', {
        body: { query, location },
      });
      if (fnError) throw fnError;
      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, search };
}