'use client';

import { Loader2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '~/hooks/auth/use-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewSectionProps {
  propertyId: string;
  bookingId?: string;   // if provided, show submit form
  revieweeId?: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${star} star`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hover || value)
                ? 'fill-primary text-primary'
                : 'fill-none text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ propertyId, bookingId, revieweeId }: ReviewSectionProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews?propertyId=${propertyId}`);
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        setReviews(json.data ?? []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please add a comment'); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          property_id: propertyId,
          booking_id: bookingId,
          reviewee_id: revieweeId,
          rating,
          comment: comment.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit review');
      }
      const json = await res.json();
      setReviews((prev) => [json.data, ...prev]);
      setSubmitted(true);
      toast.success('Review submitted!');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {avgRating && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(Number(avgRating))} />
            <span className="font-semibold">{avgRating}</span>
          </div>
        )}
      </div>

      {/* Submit Form */}
      {isAuthenticated && bookingId && !submitted && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-base">Leave a Review</h3>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Your rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label htmlFor="review-comment" className="text-sm text-muted-foreground mb-1 block">
              Your comment
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share your experience..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{comment.length}/1000</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Review
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <StarRating value={r.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && <p className="text-sm text-foreground/80">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
