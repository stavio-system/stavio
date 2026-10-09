'use client';

import { HeroSection } from '@/components/layout/HeroSection';
import { SearchBar } from '@/components/features/search/SearchBar';
import PropertyGrid from '@/components/properties/PropertyGrid';
import { useProperties } from '@/hooks/useProperties';
import { House } from 'lucide-react';

export default function Home() {
  const { properties, isLoading, error, refresh } = useProperties();

  return (
    <div className="flex flex-col w-full min-h-screen">

      {/* Hero */}
      <HeroSection />

      {/* Search */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-background rounded-2xl shadow-xl border border-border p-4">
          <SearchBar />
        </div>
      </section>

      {/* Property listing */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Available Properties</h2>
          <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full flex items-center gap-2">
            <House className="w-4 h-4 text-primary" />
            {properties.length} listings
          </span>
        </div>

        <PropertyGrid
          properties={properties}
          isLoading={isLoading}
          error={error}
          onRetry={refresh}
        />
      </section>
    </div>
  );
}
