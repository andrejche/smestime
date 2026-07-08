import { query } from '../config/db.js';
import { deleteFile } from '../config/cloudinary.js';
import path from 'path';

const getImageUrl = (req, filename) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

export const getMyListings = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*,
        (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM bookings WHERE property_id = p.id AND status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE property_id = p.id AND status = 'confirmed') as confirmed_bookings
       FROM properties p WHERE p.owner_id = $1 ORDER BY p.updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

export const getMyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT p.* FROM properties p WHERE p.id = $1 AND p.owner_id = $2`, [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });
    const images = await query(`SELECT * FROM property_images WHERE property_id = $1 ORDER BY sort_order, is_primary DESC`, [id]);
    res.json({ ...result.rows[0], images: images.rows });
  } catch (err) { next(err); }
};

export const createListing = async (req, res, next) => {
  try {
    const { title, description, propertyType, city, address, pricePerNight, maxGuests, bedrooms, bathrooms, amenities, rules, checkInTime, checkOutTime, bookingType } = req.body;
    const user = await query(`SELECT first_name, last_name, phone, email FROM users WHERE id = $1`, [req.user.id]);
    const u = user.rows[0];
    const result = await query(
      `INSERT INTO properties (owner_id, title, description, property_type, city, address, price_per_night, max_guests, bedrooms, bathrooms, amenities, rules, check_in_time, check_out_time, booking_type, owner_name, owner_phone, owner_email, is_active, is_approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,true,false) RETURNING *`,
      [req.user.id, title, description, propertyType, city, address, pricePerNight, maxGuests, bedrooms, bathrooms, JSON.stringify(amenities || []), rules || null, checkInTime || '14:00', checkOutTime || '11:00', bookingType || 'online', `${u.first_name} ${u.last_name}`, u.phone, u.email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

export const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM properties WHERE id = $1 AND owner_id = $2`, [id, req.user.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });
    const { title, description, propertyType, city, address, pricePerNight, maxGuests, bedrooms, bathrooms, amenities, rules, checkInTime, checkOutTime, bookingType } = req.body;
    const result = await query(
      `UPDATE properties SET title=COALESCE($1,title), description=COALESCE($2,description), property_type=COALESCE($3,property_type), city=COALESCE($4,city), address=COALESCE($5,address), price_per_night=COALESCE($6,price_per_night), max_guests=COALESCE($7,max_guests), bedrooms=COALESCE($8,bedrooms), bathrooms=COALESCE($9,bathrooms), amenities=COALESCE($10,amenities), rules=COALESCE($11,rules), check_in_time=COALESCE($12,check_in_time), check_out_time=COALESCE($13,check_out_time), booking_type=COALESCE($14,booking_type), is_approved=false WHERE id=$15 AND owner_id=$16 RETURNING *`,
      [title, description, propertyType, city, address, pricePerNight, maxGuests, bedrooms, bathrooms, amenities ? JSON.stringify(amenities) : null, rules, checkInTime, checkOutTime, bookingType, id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM properties WHERE id = $1 AND owner_id = $2`, [id, req.user.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });
    const images = await query(`SELECT public_id FROM property_images WHERE property_id = $1`, [id]);
    for (const img of images.rows) { if (img.public_id) deleteFile(img.public_id); }
    await query(`DELETE FROM properties WHERE id = $1 AND owner_id = $2`, [id, req.user.id]);
    res.json({ message: 'Избришан' });
  } catch (err) { next(err); }
};

export const uploadImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id FROM properties WHERE id = $1 AND owner_id = $2`, [id, req.user.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Нема слики' });

    const countRes = await query(`SELECT COUNT(*) FROM property_images WHERE property_id = $1`, [id]);
    const currentCount = parseInt(countRes.rows[0].count);
    const hasPrimary = await query(`SELECT id FROM property_images WHERE property_id = $1 AND is_primary = true`, [id]);
    const images = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const url = getImageUrl(req, file.filename);
      const isPrimary = hasPrimary.rows.length === 0 && i === 0;
      const r = await query(
        `INSERT INTO property_images (property_id, url, public_id, is_primary, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [id, url, file.filename, isPrimary, currentCount + i]
      );
      images.push(r.rows[0]);
    }
    res.status(201).json(images);
  } catch (err) { next(err); }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const result = await query(
      `SELECT pi.* FROM property_images pi JOIN properties p ON pi.property_id = p.id WHERE pi.id = $1 AND pi.property_id = $2 AND p.owner_id = $3`,
      [imageId, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Сликата не е пронајдена' });
    const img = result.rows[0];
    if (img.public_id) deleteFile(img.public_id);
    await query(`DELETE FROM property_images WHERE id = $1`, [imageId]);
    if (img.is_primary) {
      await query(`UPDATE property_images SET is_primary = true WHERE id = (SELECT id FROM property_images WHERE property_id = $1 ORDER BY sort_order LIMIT 1)`, [id]);
    }
    res.json({ message: 'Сликата е избришана' });
  } catch (err) { next(err); }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const params = [req.user.id];
    let statusFilter = '';
    if (status) { params.push(status); statusFilter = `AND b.status = $${params.length}`; }
    const result = await query(
      `SELECT b.*, p.title as property_title, p.city FROM bookings b JOIN properties p ON b.property_id = p.id WHERE p.owner_id = $1 ${statusFilter} ORDER BY b.created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const check = await query(
      `SELECT b.id FROM bookings b JOIN properties p ON b.property_id = p.id WHERE b.id = $1 AND p.owner_id = $2`,
      [id, req.user.id]
    );
    if (check.rows.length === 0) return res.status(404).json({ error: 'Резервацијата не е пронајдена' });
    const result = await query(`UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`, [status, id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getProfile = async (req, res, next) => {
  try {
    const result = await query(`SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1`, [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const result = await query(
      `UPDATE users SET first_name=COALESCE($1,first_name), last_name=COALESCE($2,last_name), phone=COALESCE($3,phone) WHERE id=$4 RETURNING id, email, first_name, last_name, phone, role`,
      [firstName, lastName, phone, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const renewListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(`SELECT id, updated_at FROM properties WHERE id = $1 AND owner_id = $2`, [id, req.user.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });
    const hoursSince = (Date.now() - new Date(existing.rows[0].updated_at).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      const hoursLeft = Math.ceil(24 - hoursSince);
      return res.status(429).json({ error: `Можеш да обновиш за ${hoursLeft} ${hoursLeft === 1 ? 'час' : 'часа'}`, hoursLeft });
    }
    await query(`UPDATE properties SET updated_at = NOW() WHERE id = $1 AND owner_id = $2`, [id, req.user.id]);
    res.json({ message: 'Огласот е обновен!' });
  } catch (err) { next(err); }
};
