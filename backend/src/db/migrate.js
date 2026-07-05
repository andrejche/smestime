import { query } from '../config/db.js';

const migrate = async () => {
  console.log('Running migrations...');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(50),
      role VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','admin')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add phone column if it doesn't exist (for existing databases)
  await query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS properties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('apartment','house','room','villa','studio','hostel')),
      city VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      price_per_night DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'MKD',
      max_guests INTEGER NOT NULL DEFAULT 2,
      bedrooms INTEGER NOT NULL DEFAULT 1,
      bathrooms INTEGER NOT NULL DEFAULT 1,
      amenities JSONB DEFAULT '[]',
      rules TEXT,
      check_in_time VARCHAR(10) DEFAULT '14:00',
      check_out_time VARCHAR(10) DEFAULT '11:00',
      owner_name VARCHAR(150),
      owner_phone VARCHAR(50),
      owner_email VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      is_approved BOOLEAN DEFAULT FALSE,
      rating_avg DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS property_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      public_id VARCHAR(255),
      is_primary BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      total_price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'MKD',
      guest_name VARCHAR(150) NOT NULL,
      guest_email VARCHAR(255) NOT NULL,
      guest_phone VARCHAR(50) NOT NULL,
      special_requests TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
      cancellation_reason TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT check_dates CHECK (check_out > check_in)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      guest_name VARCHAR(150),
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(512) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_properties_approved ON properties(is_active, is_approved);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);`);

  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ language 'plpgsql';
  `);

  for (const table of ['users','properties','bookings']) {
    await query(`
      DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
      CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  await query(`
    CREATE OR REPLACE FUNCTION update_property_rating()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE properties SET
        rating_avg = (SELECT COALESCE(AVG(rating),0) FROM reviews WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)),
        review_count = (SELECT COUNT(*) FROM reviews WHERE property_id = COALESCE(NEW.property_id, OLD.property_id))
      WHERE id = COALESCE(NEW.property_id, OLD.property_id);
      RETURN COALESCE(NEW, OLD);
    END;
    $$ language 'plpgsql';
  `);

  await query(`
    DROP TRIGGER IF EXISTS update_rating_on_review ON reviews;
    CREATE TRIGGER update_rating_on_review
      AFTER INSERT OR UPDATE OR DELETE ON reviews
      FOR EACH ROW EXECUTE FUNCTION update_property_rating();
  `);

  console.log('✅ Migrations complete.');
  process.exit(0);
};

migrate().catch((err) => { console.error('Migration failed:', err); process.exit(1); });
