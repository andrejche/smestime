import { query } from '../config/db.js';
import { deleteFile } from '../config/cloudinary.js';
import { deleteSocialImage } from '../utils/socialImage.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [users, properties, bookings, pending] = await Promise.all([
      query(`SELECT COUNT(*) FROM users WHERE role = 'owner'`),
      query(`SELECT COUNT(*) FROM properties WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM bookings`),
      query(`SELECT COUNT(*) FROM properties WHERE is_approved = false AND is_active = true`),
    ]);
    res.json({
      totalOwners: parseInt(users.rows[0].count),
      totalProperties: parseInt(properties.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      pendingApproval: parseInt(pending.rows[0].count),
    });
  } catch (err) { next(err); }
};

export const getAdminProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, approved, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];
    if (approved !== undefined) { params.push(approved === 'true'); conditions.push(`p.is_approved = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`p.title ILIKE $${params.length}`); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), offset);
    const [result, countResult] = await Promise.all([
      query(`SELECT p.*, (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) as primary_image FROM properties p ${where} ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params),
      query(`SELECT COUNT(*) FROM properties p ${where}`, params.slice(0, -2)),
    ]);
    res.json({ properties: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) { next(err); }
};

export const getPropertyImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const images = await query(`SELECT * FROM property_images WHERE property_id = $1 ORDER BY sort_order, is_primary DESC`, [id]);
    res.json(images.rows);
  } catch (err) { next(err); }
};

export const approveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const result = await query(`UPDATE properties SET is_approved = $1 WHERE id = $2 RETURNING *`, [isApproved, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const images = await query(`SELECT public_id, social_filename FROM property_images WHERE property_id = $1`, [id]);
    for (const img of images.rows) {
      if (img.public_id) deleteFile(img.public_id);
      if (img.social_filename) deleteSocialImage(img.social_filename);
    }
    await query(`DELETE FROM properties WHERE id = $1`, [id]);
    res.json({ message: 'Избришан' });
  } catch (err) { next(err); }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const result = await query(`SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at FROM users ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) { next(err); }
};

export const toggleUserActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, email, is_active`, [id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getAdminBookings = async (req, res, next) => {
  try {
    const result = await query(`SELECT b.*, p.title as property_title, p.city FROM bookings b JOIN properties p ON b.property_id = p.id ORDER BY b.created_at DESC LIMIT 100`);
    res.json(result.rows);
  } catch (err) { next(err); }
};
