import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

const seed = async () => {
  console.log('Seeding database...');

  const adminHash = await bcrypt.hash('Admin123!', 12);
  await query(`INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES ('admin@smestime.mk', $1, 'Admin', 'SmestiMe', 'admin', true) ON CONFLICT (email) DO NOTHING;`, [adminHash]);

  const ownerHash = await bcrypt.hash('Owner123!', 12);
  const ownerRes = await query(`INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) VALUES ('owner@smestime.mk', $1, 'Марко', 'Ристески', '+389 71 234 567', 'owner', true) ON CONFLICT (email) DO NOTHING RETURNING id;`, [ownerHash]);

  if (ownerRes.rows.length > 0) {
    const ownerId = ownerRes.rows[0].id;
    await query(`INSERT INTO properties (owner_id, title, description, property_type, city, address, price_per_night, max_guests, bedrooms, bathrooms, amenities, owner_name, owner_phone, owner_email, is_active, is_approved) VALUES ($1, 'Уютен апартман во центарот на Скопје', 'Модерен апартман со сè потребно за удобен престој.', 'apartment', 'Скопје', 'Бул. Партизански Одреди 12', 2500, 4, 2, 1, $2, 'Марко Ристески', '+389 71 234 567', 'owner@smestime.mk', true, true)`, [ownerId, JSON.stringify(['WiFi','Клима','Паркинг','Кујна'])]);
    await query(`INSERT INTO properties (owner_id, title, description, property_type, city, address, price_per_night, max_guests, bedrooms, bathrooms, amenities, owner_name, owner_phone, owner_email, is_active, is_approved) VALUES ($1, 'Вила со поглед на Охридско Езеро', 'Прекрасна вила со директен поглед на езерото.', 'villa', 'Охрид', 'Кеј Македонија 45', 5500, 8, 4, 3, $2, 'Марко Ристески', '+389 71 234 567', 'owner@smestime.mk', true, true)`, [ownerId, JSON.stringify(['WiFi','Базен','Поглед на езеро','Паркинг'])]);
  }

  console.log('✅ Seed complete.');
  console.log('  Admin: admin@smestime.mk / Admin123!');
  console.log('  Owner: owner@smestime.mk / Owner123!');
  process.exit(0);
};

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
