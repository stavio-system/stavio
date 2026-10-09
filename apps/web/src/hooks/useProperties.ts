import { type FullPropertyProps, MOCK_PROPERTIES } from 'public/mock-data';
import { useCallback, useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Maps backend property shape → FullPropertyProps used in the UI
const mapProperty = (p: any): FullPropertyProps => ({
  id: String(p.id),
  title: p.title ?? 'Untitled',
  images: Array.isArray(p.images) && p.images.length ? p.images : ['/images/house1.webp'],
  price: Number(p.price_per_night ?? p.price ?? 0),
  rating: Number(p.rating ?? 4.0),
  maxGuests: Number(p.max_guests ?? p.maxGuests ?? 2),
  bedrooms: Number(p.bedrooms ?? 1),
  distance: p.distance ?? '',
  location: p.location ?? p.city ?? '',
  amenities: Array.isArray(p.amenities) ? p.amenities : [],
});

interface UsePropertiesReturn {
  properties: FullPropertyProps[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useProperties = (): UsePropertiesReturn => {
  const [properties, setProperties] = useState<FullPropertyProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/properties`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const json = await res.json();
      // Backend may return { data: [...] } or a plain array
      const raw: any[] = Array.isArray(json) ? json : json?.data ?? [];
      if (raw.length > 0) {
        setProperties(raw.map(mapProperty));
        return;
      }
      // Backend returned empty — fall back to mock data so the UI isn't blank
      setProperties(MOCK_PROPERTIES);
    } catch (err) {
      // Backend not running locally — use mock data silently
      console.warn('Properties API unavailable, using mock data:', err);
      setProperties(MOCK_PROPERTIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, isLoading, error, refresh: fetchProperties };
};
