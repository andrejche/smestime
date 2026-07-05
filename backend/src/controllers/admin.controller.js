import { query } from '../config/db.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const [properties, bookings, revenue] = await Promise.all([
      query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN is_approved = false THEN 1 ELSE 0 END) as pending_approval
        FROM properties WHERE is_active = true`),
      query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM bookings`),
      query(`SELECT
        COALESCE(SUM(CASE WHEN status IN ('confirmed','completed') THEN total_price ELSE 0 END),0) as total_revenue
        FROM bookings`),
    ]);

    const trend = await query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        COUNT(*) as bookings
      FROM bookings
      WHERE created_at > NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    const topCities = await query(`
      SELECT city, COUNT(*) as property_count
      FROM properties WHERE is_active = true AND is_approved = true
      GROUP BY city ORDER BY property_count DESC LIMIT 5
    `);

    res.json({
      properties: properties.rows[0],
      bookings: bookings.rows[0],
      revenue: revenue.rows[0],
      trend: trend.rows,
      topCities: topCities.rows,
    });
  } catch (err) { next(err); }
};

export const getAdminProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, approved, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];

    if (approved !== undefined) {
      params.push(approved === 'true');
      conditions.push(`is_approved = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), offset);

    const [result, countResult] = await Promise.all([
      query(`
        SELECT p.*,
          (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) as primary_image
        FROM properties p ${where}
        ORDER BY p.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params),
      query(`SELECT COUNT(*) FROM properties p ${where}`, params.slice(0, -2)),
    ]);

    res.json({ properties: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) { next(err); }
};

export const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const result = await query(
      `UPDATE properties SET is_approved = $1 WHERE id = $2 RETURNING *`,
      [isApproved, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const deleteAdminProperty = async (req, res, next) => {
  try {
    await query(`DELETE FROM properties WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Избришан' });
  } catch (err) { next(err); }
};

export const getAdminBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = '';

    if (status) {
      params.push(status);
      where = `WHERE b.status = $${params.length}`;
    }

    params.push(parseInt(limit), offset);

    const [result, countResult] = await Promise.all([
      query(`
        SELECT b.*, p.title as property_title, p.city, p.owner_phone
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        ${where}
        ORDER BY b.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params),
      query(`SELECT COUNT(*) FROM bookings b ${where}`, params.slice(0, -2)),
    ]);

    res.json({ bookings: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) { next(err); }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Не е пронајдена' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const result = await query(`SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC`);
    res.json({ users: result.rows, total: result.rows.length });
  } catch (err) { next(err); }
};