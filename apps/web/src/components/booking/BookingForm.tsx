'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PropertyData {
  id: string;
  title: string;
  image: string;
  pricePerNight: number;
  deposit: number;
  commission: number;
  hostWallet: string;
}

interface BookingFormProps {
  onSubmit: (data: {
    property: PropertyData;
    dates: { from: Date; to: Date };
    guests: number;
    totalAmount: number;
    depositAmount: number;
  }) => void;
  propertyId: string;
}

// Fallback property when backend is unavailable
const FALLBACK_PROPERTY: PropertyData = {
  id: 'demo',
  title: 'Demo Property',
  image: '/images/house1.webp',
  pricePerNight: 150,
  deposit: 300,
  commission: 0.00001,
  hostWallet: 'GCO2IP3MJNUOKS4PUDI4C7LGGMQDJGXG3COYX3WSB4HHNAHKYV5YL3VC',
};

export function BookingForm({ onSubmit, propertyId }: BookingFormProps) {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);

  // Fetch real property data
  useEffect(() => {
    if (!propertyId) { setProperty(FALLBACK_PROPERTY); setPropertyLoading(false); return; }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/properties/${propertyId}`, {
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        const raw = json?.data ?? json;
        setProperty({
          id: String(raw.id ?? propertyId),
          title: raw.title ?? 'Property',
          image: raw.images?.[0] ?? raw.image ?? '/images/house1.webp',
          pricePerNight: Number(raw.price_per_night ?? raw.pricePerNight ?? raw.price ?? 150),
          deposit: Number(raw.deposit ?? 300),
          commission: Number(raw.commission ?? 0.00001),
          hostWallet: raw.owner_stellar_address ?? raw.hostWallet ?? FALLBACK_PROPERTY.hostWallet,
        });
      } catch {
        console.warn('Could not fetch property, using fallback');
        setProperty({ ...FALLBACK_PROPERTY, id: propertyId });
      } finally {
        setPropertyLoading(false);
      }
    })();
  }, [propertyId]);

  const calculateTotal = () => {
    if (!selectedDates?.from || !selectedDates?.to || !property) return 0;
    const nights = Math.ceil(
      (selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights * property.pricePerNight + property.deposit;
  };

  const handleSubmit = async () => {
    if (!selectedDates?.from || !selectedDates?.to) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (!property) return;

    onSubmit({
      property,
      dates: { from: selectedDates.from, to: selectedDates.to },
      guests,
      totalAmount: calculateTotal(),
      depositAmount: property.deposit,
    });
  };

  if (propertyLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Left — Booking Summary */}
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="mb-4 text-2xl font-bold">{property.title}</h1>
          <div className="relative mb-4 aspect-video rounded-lg overflow-hidden">
            <img
              src={property.image}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Selected Dates</h2>
              {selectedDates?.from && selectedDates?.to ? (
                <p className="text-muted-foreground">
                  {format(selectedDates.from, 'MMM dd, yyyy')} —{' '}
                  {format(selectedDates.to, 'MMM dd, yyyy')}
                </p>
              ) : (
                <p className="text-muted-foreground">Please select dates on the right</p>
              )}
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Guests</h2>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))}>
                  −
                </Button>
                <span className="w-8 text-center font-medium">{guests}</span>
                <Button variant="outline" size="icon" onClick={() => setGuests(guests + 1)}>
                  +
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right — Calendar & Payment */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Select Dates</h2>
          <Calendar
            mode="range"
            selected={selectedDates}
            onSelect={setSelectedDates}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Cost Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nightly Rate</span>
              <span className="font-medium">${property.pricePerNight}/night</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Deposit</span>
              <span className="font-medium">${property.deposit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="font-medium">${property.commission} USDC</span>
            </div>
            <div className="mt-3 border-t pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">${calculateTotal()}</span>
            </div>
          </div>
          <Button
            className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSubmit}
            disabled={!selectedDates?.from || !selectedDates?.to}
          >
            Proceed to Payment
          </Button>
        </Card>
      </div>
    </div>
  );
}
