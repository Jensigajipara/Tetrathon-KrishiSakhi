import fs from 'fs';
import path from 'path';
import { pool, isMock } from './db.js';

export const initializeDatabase = async () => {
  if (isMock || !pool) {
    console.log('ℹ️  Database running in Mock Mode. Skipping PostgreSQL table initialization.');
    return;
  }

  try {
    // Check if tables already exist
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('✅ PostgreSQL database tables are already initialized.');
      
      // Ensure ai_interactions logging table is created in existing DBs
      const checkAI = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ai_interactions'
        );
      `);
      
      if (!checkAI.rows[0].exists) {
        console.log('⏳ Creating ai_interactions logging table...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS ai_interactions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            prompt TEXT NOT NULL,
            system_prompt TEXT NOT NULL,
            context TEXT,
            model_name VARCHAR(100) NOT NULL,
            tokens_used INTEGER DEFAULT 0,
            response TEXT NOT NULL,
            confidence DECIMAL(5, 2) DEFAULT 100.0,
            processing_time INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ ai_interactions table created successfully.');
      }

      // Ensure ai_recommendations caching table is created in existing DBs
      const checkRec = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ai_recommendations'
        );
      `);
      
      if (!checkRec.rows[0].exists) {
        console.log('⏳ Creating ai_recommendations table...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS ai_recommendations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
            crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
            recommendation_type VARCHAR(50) NOT NULL,
            input_hash VARCHAR(64) NOT NULL,
            input_snapshot JSONB NOT NULL,
            weather_snapshot JSONB,
            market_snapshot JSONB,
            ai_response JSONB NOT NULL,
            model VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            confidence DECIMAL(5, 2),
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ ai_recommendations table created successfully.');
      }

      // Alter columns to TEXT type to prevent varchar(100) errors for long AI recommendations
      await pool.query(`
        ALTER TABLE fertilizer_recommendations 
        ALTER COLUMN fertilizer_name TYPE TEXT,
        ALTER COLUMN schedule TYPE TEXT;
      `);
      console.log('✅ Altered fertilizer_recommendations column types to TEXT.');

      // Dynamic alter for new soil and irrigation parameters
      await pool.query(`
        ALTER TABLE farms ADD COLUMN IF NOT EXISTS nitrogen INTEGER DEFAULT 120;
        ALTER TABLE farms ADD COLUMN IF NOT EXISTS phosphorus INTEGER DEFAULT 50;
        ALTER TABLE farms ADD COLUMN IF NOT EXISTS potassium INTEGER DEFAULT 60;
        ALTER TABLE farms ADD COLUMN IF NOT EXISTS npk_ratio VARCHAR(50) DEFAULT '120-50-60';
        ALTER TABLE farms ADD COLUMN IF NOT EXISTS soil_ph DECIMAL(3, 1) DEFAULT 6.5;
        ALTER TABLE farms ADD COLUMN IF NOT EXISTS irrigation_source VARCHAR(50) DEFAULT 'Tube Well';
        ALTER TABLE farms ADD COLUMN IF NOT EXISTS water_availability VARCHAR(50) DEFAULT 'High';
      `);
      console.log('✅ Updated farms schema dynamically with new fields.');

      // Dynamic alter for base64 and user-independent scans on crop_images
      await pool.query(`
        ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS image_data TEXT;
        ALTER TABLE crop_images ALTER COLUMN crop_id DROP NOT NULL;
        ALTER TABLE crop_images ALTER COLUMN image_url DROP NOT NULL;
      `);
      console.log('✅ Updated crop_images schema dynamically for global base64 scans.');

      // Create new tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS equipment (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            image_url TEXT,
            rental_cost DECIMAL(10, 2) NOT NULL,
            availability BOOLEAN DEFAULT TRUE,
            nearby_rental_center VARCHAR(150),
            contact VARCHAR(20)
        );

        CREATE TABLE IF NOT EXISTS equipment_rentals (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
            rental_date DATE DEFAULT CURRENT_DATE,
            duration_days INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'booked'
        );

        CREATE TABLE IF NOT EXISTS crop_plans (
            id SERIAL PRIMARY KEY,
            farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
            recommended_crop VARCHAR(100) NOT NULL,
            rotation_advice TEXT,
            expected_profit DECIMAL(10, 2),
            water_requirement VARCHAR(50),
            fertilizer_requirement TEXT,
            timeline JSONB,
            tasks JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Verified equipment, rentals, and crop_plans tables.');

      // Seed equipment if empty
      const checkEquip = await pool.query('SELECT COUNT(*) FROM equipment');
      if (Number(checkEquip.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO equipment (name, image_url, rental_cost, availability, nearby_rental_center, contact) VALUES
          ('Combine Harvester', 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400', 2500.00, TRUE, 'Karnal Agri Center', '+919876543201'),
          ('Tractor with Rotavator', 'https://images.unsplash.com/photo-1594136976694-df0a28f87050?auto=format&fit=crop&q=80&w=400', 1200.00, TRUE, 'Shamgarh Cooperative', '+919876543202'),
          ('Grain Dryer', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400', 800.00, TRUE, 'Gharaunda Warehouse', '+919876543203'),
          ('Laser Land Leveler', 'https://images.unsplash.com/photo-1605173484045-90aeb43c4cfd?auto=format&fit=crop&q=80&w=400', 1500.00, TRUE, 'Karnal Agri Center', '+919876543201'),
          ('Multicrop Thresher', 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400', 1000.00, TRUE, 'Nilokheri Cooperative', '+919876543204');
        `);
        console.log('✅ Seeded default equipment inventory.');
      }

      return;
    }

    console.log('⏳ Provisioning PostgreSQL Neon Database...');

    // Read schema and seed files
    const schemaPath = path.join(process.cwd(), '../database/schema.sql');
    const seedPath = path.join(process.cwd(), '../database/seed.sql');

    if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
      console.warn('⚠️  schema.sql or seed.sql not found at standard workspace paths.');
      return;
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Run schema migrations
    await pool.query(schemaSql);
    console.log('✅ PostgreSQL tables created successfully.');

    // Run seeds
    await pool.query(seedSql);
    console.log('✅ PostgreSQL seed records inserted successfully.');

  } catch (error) {
    console.error('❌ Failed to auto-provision PostgreSQL database:', error.message);
  }
};
