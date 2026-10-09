'use client';

import { ArrowRight, BadgeCheck, MapPin, Square, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { FullPropertyProps } from 'public/mock-data';

interface PropertyCardProps {
  property: FullPropertyProps;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <div className="bg-card text-card-foreground rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-border transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 group">

      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={property.images?.[0] || '/images/house1.webp'}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        {/* Verified badge — sky blue */}
        <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
          <BadgeCheck className="w-3.5 h-3.5" />
          Verified
        </div>
      </div>

      {/* Content */}
      <div className="p-4">

        {/* Title */}
        <h3 className="font-bold text-base leading-tight mb-1 truncate">{property.title}</h3>

        {/* Location */}
        <p className="text-muted-foreground text-sm mb-3 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
          {property.location}
        </p>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-muted-foreground text-xs gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary/70" />
            <span>Up to {property.maxGuests}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-xs gap-1.5">
            <Square className="w-3.5 h-3.5 text-primary/70" />
            <span>{property.bedrooms} Bedrooms</span>
          </div>
          <div className="flex items-center text-xs gap-1.5 col-span-2">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="font-medium">{property.rating}</span>
            <span className="text-muted-foreground">(100+ reviews)</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="font-bold text-base text-primary">
              ${property.price.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-xs"> / night</span>
          </div>
          <Link href={`/property/${property.id}`}>
            <button
              type="button"
              aria-label="View property"
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              View
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
