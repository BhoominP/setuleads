import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, CircleNotch, WarningCircle, Check } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';

export interface LocationDetails {
  placeId?: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export interface LocationSuggestion {
  place_id: string;
  text: string;
  main_text?: string;
  secondary_text?: string;
}

interface LocationInputProps {
  value: string;
  onChange: (val: string, details?: LocationDetails) => void;
  className?: string;
  placeholder?: string;
}

function generateSessionToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'st_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function LocationInput({
  value,
  onChange,
  className = '',
  placeholder = 'Search any city, state or country...',
}: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [sessionToken, setSessionToken] = useState<string>(() => generateSessionToken());

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (inputValue: string, token: string) => {
      const trimmed = inputValue.trim();
      if (trimmed.length < 2) {
        setSuggestions([]);
        setLoading(false);
        setErrorState(null);
        return;
      }

      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setErrorState(null);

      try {
        const { data, error } = await supabase.functions.invoke('search-locations', {
          body: { input: trimmed, sessionToken: token },
        });

        if (error) {
          throw error;
        }

        const results: LocationSuggestion[] = data?.results || [];
        setSuggestions(results);
        setSelectedIndex(-1);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('Location autocomplete quiet error:', err);
        setErrorState('Search unavailable, try typing custom location');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newValue.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      setErrorState(null);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue, sessionToken);
    }, 250);
  }

  async function resolvePlaceSelection(suggestion: LocationSuggestion) {
    const selectedText = suggestion.text || suggestion.main_text || value;
    onChange(selectedText);
    setIsOpen(false);

    // Call get-place-details Edge Function to resolve lat/lng
    try {
      const { data, error } = await supabase.functions.invoke('get-place-details', {
        body: {
          placeId: suggestion.place_id,
          sessionToken,
          addressHint: selectedText,
        },
      });

      if (!error && data?.location) {
        const details: LocationDetails = {
          placeId: suggestion.place_id,
          formattedAddress: data.formatted_address || selectedText,
          lat: data.location.latitude,
          lng: data.location.longitude,
        };
        onChange(selectedText, details);
      }
    } catch (err) {
      console.warn('Failed resolving place details:', err);
    } finally {
      // Regenerate session token after completed selection
      setSessionToken(generateSessionToken());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    const totalItems = suggestions.length + (value.trim().length >= 2 ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 >= totalItems ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 < 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        resolvePlaceSelection(suggestions[selectedIndex]);
      } else {
        // Fallback custom location select
        setIsOpen(false);
        setSessionToken(generateSessionToken());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <MapPin size={14} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim().length >= 2) {
              setIsOpen(true);
              if (suggestions.length === 0 && !loading) {
                fetchSuggestions(value, sessionToken);
              }
            }
          }}
          placeholder={placeholder}
          className="pl-8 pr-8 text-xs font-mono bg-base"
        />
        {loading ? (
          <CircleNotch size={14} className="absolute right-2.5 text-rust animate-spin pointer-events-none" />
        ) : (
          <span className="absolute right-2.5 text-[9px] font-mono text-muted-foreground/60 uppercase pointer-events-none">
            GLOBAL
          </span>
        )}
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-panel border border-border shadow-2xl p-1.5 font-mono text-xs">
          {/* Loading Indicator Header */}
          {loading && (
            <div className="p-2 border-b border-border/50 flex items-center gap-2 text-muted-foreground">
              <CircleNotch size={12} className="animate-spin text-rust shrink-0" />
              <span className="text-[10px] uppercase tracking-wider">Searching global places…</span>
            </div>
          )}

          {/* Quiet Error Indicator */}
          {errorState && (
            <div className="p-2 border-b border-rust/30 bg-rust/10 flex items-center gap-2 text-rust">
              <WarningCircle size={14} className="shrink-0" />
              <span className="text-[10px] font-medium">{errorState}</span>
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-0.5">
              {suggestions.map((item, index) => {
                const isHighlighted = selectedIndex === index;
                const isSelected = value.toLowerCase() === item.text.toLowerCase();

                return (
                  <button
                    key={item.place_id || index}
                    type="button"
                    onClick={() => resolvePlaceSelection(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-2 transition-colors flex items-start justify-between gap-2 border-l-2 ${
                      isHighlighted
                        ? 'bg-rust/15 border-rust text-ink'
                        : isSelected
                        ? 'bg-base border-sage text-ink'
                        : 'border-transparent text-ink hover:bg-base'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin size={14} className={`mt-0.5 shrink-0 ${isHighlighted ? 'text-rust' : 'text-muted-foreground'}`} />
                      <div className="min-w-0">
                        <p className="font-sans text-xs text-ink font-semibold truncate">
                          {item.main_text || item.text}
                        </p>
                        {item.secondary_text && (
                          <p className="font-mono text-[10px] text-muted-foreground truncate">
                            {item.secondary_text}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={12} className="text-rust shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !errorState && value.trim().length >= 2 && suggestions.length === 0 && (
            <div className="p-3 text-center text-muted-foreground bg-base/40">
              <p className="font-mono text-xs text-ink font-medium">No matching locations</p>
              <p className="font-mono text-[10px] mt-0.5">
                Press <kbd className="px-1 py-0.5 bg-panel border border-border text-[9px]">Enter</kbd> to search custom area "{value}"
              </p>
            </div>
          )}

          {/* Fallback Custom Location Button */}
          {value.trim().length >= 2 && (
            <div className="mt-1 pt-1 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSessionToken(generateSessionToken());
                }}
                className={`w-full text-left font-mono text-[11px] p-2 flex items-center justify-between gap-2 transition-colors ${
                  selectedIndex === suggestions.length
                    ? 'bg-rust/20 border border-rust text-rust font-semibold'
                    : 'bg-base/80 hover:bg-base text-muted-foreground hover:text-ink'
                }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  <MapPin size={12} className="text-rust shrink-0" />
                  Target Custom Region: "{value}"
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider bg-rust/15 px-1.5 py-0.5 border border-rust/30 text-rust shrink-0">
                  Select ↵
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
