import { query } from '../config/db.js';
import { sendBookingNotification, sendBookingConfirmed, sendBookingCancelled } from '../services/email.service.js';
import { format } from 'date-fns';

const formatDate = (date) => format(new Date(date), 'dd.MM.yyyy');

// POST /api/bookings — public
export const createBooking = async (req, res, next) => {
  try {
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = req.body;

    const propResult = await query(
      `SELECT p.*, u.first_name, u.last_name, u.email as user_email FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1 AND p.is_active = true AND p.is_approved = true`,
      [propertyId]
    );

    if (propResult.rows.length === 0) {
      return res.status(404).json({ error: 'Огласот не е пронајден' });
    }

    const property = propResult.rows[0];

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Датумот на заминување мора да биде после пристигнувањето' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * parseFloat(property.price_per_night);

    const result = await query(
      `INSERT INTO bookings (property_id, check_in, check_out, guests, total_price, currency, guest_name, guest_email, guest_phone, special_requests, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending') RETURNING *`,
      [propertyId, checkIn, checkOut, guests, totalPrice, property.currency || 'MKD', guestName, guestEmail, guestPhone, specialRequests || null]
    );

    // Send email to owner
    if (property.owner_email || property.user_email) {
      sendBookingNotification({
        ownerEmail: property.owner_email || property.user_email,
        ownerName: property.owner_name || `${property.first_name} ${property.last_name}`,
        guestName, guestEmail, guestPhone,
        propertyTitle: property.title,
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        guests,
        totalPrice: totalPrice.toLocaleString(),
        specialRequests,
      }).catch(console.error);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// GET /api/bookings/:id
export const getBooking = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT b.*, p.title as property_title, p.city FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Резервацијата не е пронајдена' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// PATCH /api/bookings/:id/status — owner updates status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await query(
      `SELECT b.*, p.title as property_title, p.owner_name, p.owner_phone, p.owner_email,
              u.first_name, u.last_name, u.email as user_email
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (booking.rows.length === 0) return res.status(404).json({ error: 'Резервацијата не е пронајдена' });

    const b = booking.rows[0];

    const result = await query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    // Send email to guest based on new status
    if (status === 'confirmed') {
      sendBookingConfirmed({
        guestEmail: b.guest_email,
        guestName: b.guest_name,
        propertyTitle: b.property_title,
        ownerName: b.owner_name || `${b.first_name} ${b.last_name}`,
        ownerPhone: b.owner_phone,
        ownerEmail: b.owner_email || b.user_email,
        checkIn: formatDate(b.check_in),
        checkOut: formatDate(b.check_out),
        guests: b.guests,
        totalPrice: parseInt(b.total_price).toLocaleString(),
      }).catch(console.error);
    }

    if (status === 'cancelled') {
      sendBookingCancelled({
        guestEmail: b.guest_email,
        guestName: b.guest_name,
        propertyTitle: b.property_title,
        checkIn: formatDate(b.check_in),
        checkOut: formatDate(b.check_out),
      }).catch(console.error);
    }

    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
