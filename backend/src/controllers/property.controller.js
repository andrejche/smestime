import { query } from '../config/db.js';
import { cloudinary } from '../config/cloudinary.js';

const latinToCyrillic = {
  'ohrid': 'Охрид', 'skopje': 'Скопје', 'struga': 'Струга',
  'bitola': 'Битола', 'prilep': 'Прилеп', 'tetovo': 'Тетово', 'krushevo': 'Крушево',
  'mavrovo': 'Маврово', 'gevgelija': 'Гевгелија', 'kumanovo': 'Куманово',
  'kavadarci': 'Кавадарци', 'strumica': 'Струмица', 'shtip': 'Штип',
  'veles': 'Велес', 'kichevo': 'Кичево', 'kochani': 'Кочани',
  'debar': 'Дебар', 'radovish': 'Радовиш', 'negotino': 'Неготино',
  'delchevo': 'Делчево', 'vinica': 'Виница', 'resen': 'Ресен',
  'berovo': 'Берово', 'kratovo': 'Кратово', 'probistip': 'Пробиштип',
  'bogdanci': 'Богданци', 'makedonska kamenica': 'Македонска Каменица',
  'valandovo': 'Валандово', 'makedonski brod': 'Македонски Брод',
  'demir kapija': 'Демир Капија', 'pehchevo': 'Пехчево',
  'demir hisar': 'Демир Хисар',
};

// GET /api/properties — public search
export const getProperties = async (req, res, next) => {
  try {
    const { city, checkIn, checkOut, guests, minPrice, maxPrice, propertyType, page = 1, limit = 16, sort = 'created_at_desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [`p.is_active = true`, `p.is_approved = true`];
    const params = [];

      if (city) {
      const normalized = city.toLowerCase().trim();
      const cyrillic = latinToCyrillic[normalized];
      const searchTerm = cyrillic || city;
      params.push(`%${searchTerm}%`);
      conditions.push(`p.city ILIKE $${params.length}`);
    }
    if (guests) { params.push(parseInt(guests)); conditions.push(`p.max_guests >= $${params.length}`); }
    if (minPrice) { params.push(parseFloat(minPrice)); conditions.push(`p.price_per_night >= $${params.length}`); }
    if (maxPrice) { params.push(parseFloat(maxPrice)); conditions.push(`p.price_per_night <= $${params.length}`); }
    if (propertyType) { params.push(propertyType); conditions.push(`p.property_type = $${params.length}`); }

    if (checkIn && checkOut) {
      conditions.push(`p.id NOT IN (
        SELECT property_id FROM bookings WHERE status IN ('pending','confirmed')
        AND check_in < $${params.length + 2}::date AND check_out > $${params.length + 1}::date
      )`);
      params.push(checkIn, checkOut);
    }

    const sortMap = {
      created_at_desc: 'p.updated_at DESC',
      price_asc: 'p.price_per_night ASC',
      price_desc: 'p.price_per_night DESC',
      rating_desc: 'p.rating_avg DESC',
    };

    const where = `WHERE ${conditions.join(' AND ')}`;
    params.push(parseInt(limit), offset);

    const [propertiesResult, countResult] = await Promise.all([
      query(`
        SELECT p.*,
          (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) as primary_image
        FROM properties p ${where}
        ORDER BY ${sortMap[sort] || 'p.updated_at DESC'}
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params),
      query(`SELECT COUNT(*) FROM properties p ${where}`, params.slice(0, -2)),
    ]);

    res.json({
      properties: propertiesResult.rows,
      pagination: {
        page: parseInt(page), limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/properties/:id
export const getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.* FROM properties p WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Огласот не е пронајден' });

    const [images, reviews] = await Promise.all([
      query(`SELECT * FROM property_images WHERE property_id = $1 ORDER BY sort_order, is_primary DESC`, [id]),
      query(`SELECT * FROM reviews WHERE property_id = $1 ORDER BY created_at DESC LIMIT 10`, [id]),
    ]);

    res.json({ ...result.rows[0], images: images.rows, reviews: reviews.rows });
  } catch (err) { next(err); }
};

// POST /api/properties/public — no auth, anyone can submit listing
export const createPublicProperty = async (req, res, next) => {
  try {
    const {
      title, description, propertyType, city, address,
      pricePerNight, maxGuests, bedrooms, bathrooms,
      amenities, ownerName, ownerPhone, ownerEmail,
    } = req.body;

    const result = await query(
      `INSERT INTO properties
        (title, description, property_type, city, address,
         price_per_night, max_guests, bedrooms, bathrooms, amenities,
         owner_name, owner_phone, owner_email,
         is_active, is_approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,false)
       RETURNING *`,
      [
        title, description, propertyType, city, address,
        pricePerNight, maxGuests, bedrooms, bathrooms,
        JSON.stringify(amenities || []),
        ownerName, ownerPhone, ownerEmail,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// POST /api/properties/:id/images/public — upload images without auth
export const uploadImagesPublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Нема прикачени слики' });

    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const result = await query(
        `INSERT INTO property_images (property_id, url, public_id, is_primary, sort_order)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [id, file.path, file.filename, i === 0, i]
      );
      images.push(result.rows[0]);
    }
    res.status(201).json(images);
  } catch (err) { next(err); }
};

// GET /api/properties/cities
export const getCities = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT DISTINCT city, COUNT(*) as property_count
       FROM properties WHERE is_active = true AND is_approved = true
       GROUP BY city ORDER BY property_count DESC`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// Admin only below

// GET /api/properties/admin/all
export const getAdminProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, approved, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];

    if (approved !== undefined) { params.push(approved === 'true'); conditions.push(`is_approved = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`title ILIKE $${params.length}`); }

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

// PATCH /api/properties/:id/approve
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

// DELETE /api/properties/:id
export const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const images = await query(`SELECT public_id FROM property_images WHERE property_id = $1`, [id]);
    for (const img of images.rows) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id).catch(() => {});
    }
    await query(`DELETE FROM properties WHERE id = $1`, [id]);
    res.json({ message: 'Огласот е избришан' });
  } catch (err) { next(err); }
};
