import { query } from '../config/db.js';

// POST /api/bookings — no auth required
export const createBooking = async (req, res, next) => {
  try {
    const {
      propertyId, checkIn, checkOut, guests,
      guestName, guestEmail, guestPhone, specialRequests,
    } = req.body;

    if (!guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ error: 'Потребни се: ime, e-mail и телефон' });
    }

    const propResult = await query(
      `SELECT * FROM properties WHERE id = $1 AND is_active = true AND is_approved = true`,
      [propertyId]
    );
    if (propResult.rows.length === 0) {
      return res.status(404).json({ error: 'Огласот не е пронајден или не е достапен' });
    }

    const property = propResult.rows[0];

    if (guests > property.max_guests) {
      return res.status(400).json({ error: `Максимум ${property.max_guests} гости` });
    }

    // Check availability
    const conflict = await query(
      `SELECT id FROM bookings
       WHERE property_id = $1
       AND status IN ('pending','confirmed')
       AND check_in < $3::date AND check_out > $2::date`,
      [propertyId, checkIn, checkOut]
    );
    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Огласот не е достапен за избраните датуми' });
    }

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    if (nights < 1) {
      return res.status(400).json({ error: 'Датумот на заминување мора да биде по пристигнувањето' });
    }

    const totalPrice = nights * parseFloat(property.price_per_night);

    const result = await query(
      `INSERT INTO bookings
        (property_id, check_in, check_out, guests, total_price, currency,
         guest_name, guest_email, guest_phone, special_requests)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        propertyId, checkIn, checkOut, guests, totalPrice,
        property.currency || 'MKD',
        guestName, guestEmail, guestPhone,
        specialRequests || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/property/:propertyId — admin only (checked in route)
export const getPropertyBookings = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const result = await query(
      `SELECT b.*, p.title as property_title, p.city
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.property_id = $1
       ORDER BY b.created_at DESC`,
      [propertyId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/admin — all bookings, admin only
export const getAdminBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let statusFilter = '';

    if (status) {
      params.push(status);
      statusFilter = `WHERE b.status = $${params.length}`;
    }

    params.push(parseInt(limit), offset);

    const result = await query(
      `SELECT b.*, p.title as property_title, p.city
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       ${statusFilter}
       ORDER BY b.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM bookings b ${statusFilter}`,
      params.slice(0, -2)
    );

    res.json({ bookings: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/status — admin only
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const result = await query(
      `UPDATE bookings SET status = $1, cancellation_reason = $2 WHERE id = $3 RETURNING *`,
      [status, cancellationReason || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Резервацијата не е пронајдена' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT b.*, p.title as property_title, p.city, p.address
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Резервацијата не е пронајдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
