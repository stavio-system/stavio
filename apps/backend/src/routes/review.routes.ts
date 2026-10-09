import { Router, type Request, type Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/reviews?propertyId=xxx  — fetch reviews for a property
router.get('/', async (req: Request, res: Response) => {
  const { propertyId, userId } = req.query;

  if (!propertyId && !userId) {
    return res.status(400).json({ success: false, message: 'propertyId or userId required' });
  }

  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (propertyId) query = query.eq('property_id', propertyId);
    if (userId) query = query.eq('reviewee_id', userId);

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews — submit a review (auth required)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const { property_id, reviewee_id, rating, comment, booking_id } = req.body;
  const reviewer_id = (req as any).user?.id;

  if (!property_id || !reviewee_id || !rating || !reviewer_id) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }

  try {
    // Prevent duplicate reviews for the same booking
    if (booking_id) {
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', booking_id)
        .eq('reviewer_id', reviewer_id)
        .single();

      if (existing) {
        return res.status(409).json({ success: false, message: 'Review already submitted for this booking' });
      }
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ property_id, reviewee_id, reviewer_id, rating, comment, booking_id }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
