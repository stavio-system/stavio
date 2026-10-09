import { Router, type Request, type Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/analytics/overview?userId=&userType=host|tenant
router.get('/overview', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { userType } = req.query;

  try {
    if (userType === 'host') {
      const [propsRes, bookingsRes] = await Promise.all([
        supabase.from('properties').select('id, status').eq('owner_id', userId),
        supabase
          .from('bookings')
          .select('id, status, total_price')
          .eq('host_id', userId),
      ]);

      const props = propsRes.data ?? [];
      const bookings = bookingsRes.data ?? [];

      const totalEarnings = bookings
        .filter((b) => b.status === 'completed')
        .reduce((s: number, b: any) => s + Number(b.total_price ?? 0), 0);

      return res.json({
        success: true,
        data: {
          totalBookings: bookings.length,
          totalEarnings,
          activeListings: props.filter((p: any) => p.status === 'active').length,
          pendingRequests: bookings.filter((b: any) => b.status === 'pending').length,
        },
      });
    } else {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, status, total_price')
        .eq('tenant_id', userId);

      const bk = bookings ?? [];
      const totalSpent = bk
        .filter((b) => b.status === 'completed')
        .reduce((s: number, b: any) => s + Number(b.total_price ?? 0), 0);

      return res.json({
        success: true,
        data: {
          totalBookings: bk.length,
          totalSpent,
          activeBookings: bk.filter((b: any) => b.status === 'confirmed').length,
          pendingBookings: bk.filter((b: any) => b.status === 'pending').length,
        },
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/earnings?userId=
router.get('/earnings', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_price, created_at, status')
      .eq('host_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    // Group by month
    const byMonth: Record<string, number> = {};
    for (const b of bookings ?? []) {
      const month = new Date(b.created_at).toLocaleDateString('en-US', {
        month: 'short', year: '2-digit',
      });
      byMonth[month] = (byMonth[month] ?? 0) + Number(b.total_price ?? 0);
    }

    const data = Object.entries(byMonth).map(([month, amount]) => ({ month, amount }));
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/bookings?userId=&userType=
router.get('/bookings', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { userType } = req.query;

  try {
    const field = userType === 'host' ? 'host_id' : 'tenant_id';
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, status, created_at, total_price')
      .eq(field, userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return res.json({ success: true, data: bookings ?? [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/activity/recent?userId=&userType=
router.get('/recent-activity', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { userType } = req.query;

  try {
    const field = userType === 'host' ? 'host_id' : 'tenant_id';
    const { data } = await supabase
      .from('bookings')
      .select('id, status, created_at, total_price, dates')
      .eq(field, userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return res.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
