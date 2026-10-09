'use client';

import { format } from 'date-fns/format';
import { CalendarDays, Loader2, MapPin, Minus, Plus, Search, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { InlineError } from '@/components/ui/error-display';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

const searchSchema = z.object({
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location is too long'),
  date: z.string().optional(),
  adults: z.number().int().min(1, 'At least 1 adult required').max(16, 'Maximum 16 adults allowed'),
  kids: z.number().int().min(0).max(10, 'Maximum 10 kids allowed'),
});

type SearchFormData = z.infer<typeof searchSchema>;

const LOCATIONS = [
  'Luján, Buenos Aires',
  'San Isidro, Buenos Aires',
  'Palermo, Buenos Aires',
  'Córdoba, Argentina',
  'Mendoza, Argentina',
  'Rosario, Santa Fe',
  'New York, NY',
  'Los Angeles, CA',
  'Miami, FL',
  'Seattle, WA',
  'San Francisco, CA',
  'Chicago, IL',
  'Austin, TX',
];

export const SearchBar = () => {
  const [formData, setFormData] = useState<SearchFormData>({
    location: '',
    date: '',
    adults: 1,
    kids: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGuestsPopover, setShowGuestsPopover] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const router = useRouter();
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, location: value }));
    if (value.length > 1) {
      const filtered = LOCATIONS.filter((loc) => loc.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    setFormData((prev) => ({ ...prev, location: suggestion }));
    setShowSuggestions(false);
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
    if (date) setFormData((prev) => ({ ...prev, date: date.toISOString() }));
  }, []);

  const updateGuests = useCallback((type: 'adults' | 'kids', increment: boolean) => {
    setFormData((prev) => {
      const cur = prev[type];
      const next = increment
        ? type === 'adults' ? Math.min(cur + 1, 16) : Math.min(cur + 1, 10)
        : type === 'adults' ? Math.max(cur - 1, 1) : Math.max(cur - 1, 0);
      return { ...prev, [type]: next };
    });
  }, []);

  const totalGuests = formData.adults + formData.kids;
  const guestsLabel = `${totalGuests} Guest${totalGuests !== 1 ? 's' : ''} · ${formData.adults} Adult${formData.adults !== 1 ? 's' : ''}${formData.kids > 0 ? `, ${formData.kids} Kid${formData.kids !== 1 ? 's' : ''}` : ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.location || formData.location.length < 2) {
        setError('Please enter a valid location');
        setIsSubmitting(false);
        return;
      }
      const validated = searchSchema.parse(formData);
      const params = new URLSearchParams();
      params.set('location', validated.location);
      if (validated.date) params.set('date', validated.date);
      params.set('guests', (validated.adults + validated.kids).toString());
      params.set('adults', validated.adults.toString());
      params.set('kids', validated.kids.toString());
      router.push(`/search?${params.toString()}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsSubmitting(false);
    }
  };

  const divider = <div className="hidden lg:block w-px h-10 bg-border self-center shrink-0" />;

  return (
    <div className="w-full" ref={searchBarRef}>
      <div className="bg-card border border-border rounded-2xl p-2 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2"
        >
          {/* Location */}
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors cursor-text">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <label htmlFor="location-input" className="text-xs font-semibold text-foreground cursor-pointer">
                  Location
                </label>
                <input
                  id="location-input"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => formData.location.length > 1 && setShowSuggestions(suggestions.length > 0)}
                  placeholder="Search by city or country"
                  className="text-sm text-muted-foreground bg-transparent outline-none placeholder:text-muted-foreground/60 w-full mt-0.5"
                  autoComplete="off"
                />
              </div>
            </div>
            {showSuggestions && (
              <div className="absolute left-0 top-full mt-1 z-50 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => selectSuggestion(s)}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary/60" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {divider}

          {/* Date */}
          <div className="lg:w-44 shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full hover:bg-accent/50 transition-colors text-left"
                >
                  <CalendarDays className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">Check-in</span>
                    <span className="text-sm text-muted-foreground mt-0.5">
                      {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select date'}
                    </span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          {divider}

          {/* Guests */}
          <div className="lg:w-52 shrink-0">
            <Popover open={showGuestsPopover} onOpenChange={setShowGuestsPopover}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full hover:bg-accent/50 transition-colors text-left"
                >
                  <Users className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">Guests</span>
                    <span className="text-sm text-muted-foreground mt-0.5 truncate">{guestsLabel}</span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 bg-card border-border" align="start">
                <div className="space-y-4">
                  {(['adults', 'kids'] as const).map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{type}</p>
                        <p className="text-xs text-muted-foreground">
                          {type === 'adults' ? 'Ages 13+' : 'Ages 2–12'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateGuests(type, false)}
                          disabled={type === 'adults' ? formData.adults <= 1 : formData.kids <= 0}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-medium text-foreground w-5 text-center">
                          {formData[type]}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateGuests(type, true)}
                          disabled={type === 'adults' ? formData.adults >= 16 : formData.kids >= 10}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => setShowGuestsPopover(false)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="lg:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-6 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>{isSubmitting ? 'Searching...' : 'Search'}</span>
          </Button>
        </form>

        {error && (
          <div className="mt-3 px-2">
            <InlineError message={error} />
          </div>
        )}
      </div>
    </div>
  );
};
