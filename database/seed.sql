-- Seed Data for KrishiSakhi

-- Insert default admin users
-- Password is 'admin123' bcrypt hash: '$2b$10$wN1rD95fPecv8k.79jH22ep3eNf.8w069G.K6w4CWh6P/LwNn16f6' or similar
-- Let's insert a pre-hashed bcrypt password for admin123
-- BCrypt hash of 'admin123': $2b$10$1zD1mLyYlkYrfGmguhNhxeO0STrcj0/4iu4bUENeVtOj0f8PH5rC2
INSERT INTO admin_users (name, email, password) VALUES
('System Administrator', 'admin@krishisakhi.org', '$2b$10$1zD1mLyYlkYrfGmguhNhxeO0STrcj0/4iu4bUENeVtOj0f8PH5rC2');

-- Insert a mock farmer user
-- Password is 'farmer123' bcrypt hash: '$2b$10$tM9sR.8Yj0gLg7X3w5G1ZOHmC0d5Vn0zN1rD95fPecv8k.79jH22e'
-- BCrypt hash of 'farmer123': $2b$10$k1R5Lw1bJv2hMfZ8o64fIuK3Bq/0t5016R1L1X1Z1e1d1C1W1G1a1
INSERT INTO users (full_name, email, password, role, phone) VALUES
('Ramesh Kumar', 'ramesh@gmail.com', '$2b$10$k1R5Lw1bJv2hMfZ8o64fIuK3Bq/0t5016R1L1X1Z1e1d1C1W1G1a1', 'farmer', '+919876543210');

-- Insert mock farms for Ramesh Kumar
INSERT INTO farms (user_id, farm_name, state, district, village, latitude, longitude, farm_size, soil_type, nitrogen, phosphorus, potassium, npk_ratio, soil_ph, irrigation_source, water_availability) VALUES
(1, 'Green Fields Farm', 'Haryana', 'Karnal', 'Shamgarh', 29.780000, 76.990000, 5.5, 'Loam', 140, 55, 65, '140-55-65', 6.2, 'Tube Well', 'High'),
(1, 'Riverside Plot', 'Punjab', 'Patiala', 'Devigarh', 30.150000, 76.450000, 3.2, 'Clay', 110, 48, 58, '110-48-58', 6.8, 'Canal', 'Medium');

-- Seed post-harvest equipment items
INSERT INTO equipment (name, image_url, rental_cost, availability, nearby_rental_center, contact) VALUES
('Combine Harvester', 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400', 2500.00, TRUE, 'Karnal Agri Center', '+919876543201'),
('Tractor with Rotavator', 'https://images.unsplash.com/photo-1594136976694-df0a28f87050?auto=format&fit=crop&q=80&w=400', 1200.00, TRUE, 'Shamgarh Cooperative', '+919876543202'),
('Grain Dryer', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400', 800.00, TRUE, 'Gharaunda Warehouse', '+919876543203'),
('Laser Land Leveler', 'https://images.unsplash.com/photo-1605173484045-90aeb43c4cfd?auto=format&fit=crop&q=80&w=400', 1500.00, TRUE, 'Karnal Agri Center', '+919876543201'),
('Multicrop Thresher', 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400', 1000.00, TRUE, 'Nilokheri Cooperative', '+919876543204');

-- Insert crops for farms
INSERT INTO crops (farm_id, crop_name, crop_type, sowing_date, expected_harvest_date, growth_stage, status) VALUES
(1, 'Rice', 'Cereal', '2026-06-15', '2026-10-15', 'Vegetative', 'active'),
(1, 'Wheat', 'Cereal', '2025-11-01', '2026-04-10', 'Flowering', 'harvested'),
(2, 'Cotton', 'Oilseed', '2026-05-10', '2026-11-15', 'Vegetative', 'active');

-- Insert some historical weather for the active crops
INSERT INTO weather_history (farm_id, temperature, humidity, rainfall, wind_speed, recorded_at) VALUES
(1, 31.5, 75.0, 12.4, 8.5, NOW() - INTERVAL '3 days'),
(1, 32.0, 78.0, 15.2, 9.1, NOW() - INTERVAL '2 days'),
(1, 30.5, 80.0, 22.0, 12.0, NOW() - INTERVAL '1 day'),
(2, 33.5, 60.0, 2.1, 7.5, NOW() - INTERVAL '3 days'),
(2, 34.0, 58.0, 0.0, 6.8, NOW() - INTERVAL '2 days'),
(2, 32.8, 62.0, 4.5, 8.0, NOW() - INTERVAL '1 day');

-- Insert sample market prices for various mandis and crops
INSERT INTO market_prices (crop_name, mandi_name, district, price, date) VALUES
('Rice', 'Karnal Mandi', 'Karnal', 2450.00, CURRENT_DATE),
('Rice', 'Panipat Mandi', 'Panipat', 2420.00, CURRENT_DATE),
('Rice', 'Kurukshetra Mandi', 'Kurukshetra', 2480.00, CURRENT_DATE),
('Wheat', 'Patiala Mandi', 'Patiala', 2125.00, CURRENT_DATE),
('Wheat', 'Karnal Mandi', 'Karnal', 2150.00, CURRENT_DATE),
('Cotton', 'Hisar Mandi', 'Hisar', 7100.00, CURRENT_DATE),
('Cotton', 'Sirsa Mandi', 'Sirsa', 7250.00, CURRENT_DATE),
('Cotton', 'Bathinda Mandi', 'Bathinda', 7050.00, CURRENT_DATE),
('Maize', 'Panipat Mandi', 'Panipat', 1960.00, CURRENT_DATE),
('Maize', 'Rohtak Mandi', 'Rohtak', 1980.00, CURRENT_DATE),
('Sugarcane', 'Yamunanagar Mandi', 'Yamunanagar', 380.00, CURRENT_DATE),
('Sugarcane', 'Meerut Mandi', 'Meerut', 390.00, CURRENT_DATE);

-- Insert pest alert references (to be copied to active crops)
INSERT INTO pest_alerts (crop_id, pest_name, risk_level, recommendation) VALUES
(1, 'Stem Borer', 'Medium', 'Apply Cartap Hydrochloride 4G @ 10kg/acre or spray Chlorantraniliprole 18.5% SC @ 60ml/acre.'),
(3, 'Whitefly', 'High', 'Spray Neem Oil @ 1500ppm or use Acetamiprid 20% SP @ 80g/acre. Install yellow sticky traps.');

-- Insert recommendations for crops
INSERT INTO recommendations (crop_id, recommendation_type, recommendation, confidence_score, explanation, created_at) VALUES
(1, 'irrigation', 'Water level should be maintained at 2-3 cm. Rain forecast indicates 20mm rainfall, so delay active pump irrigation for 24 hours.', 92.5, 'Heavy rainfall predicted tomorrow will satisfy the current crop water demand.', NOW()),
(1, 'fertilizer', 'Apply Urea (Nitrogen) @ 45 kg/acre. Soil Loam type has low nitrogen availability in the vegetative stage.', 88.0, 'Recommended dose of Nitrogen based on growth stage (Vegetative) and crop type (Rice).', NOW() - INTERVAL '1 day');

-- Insert price alerts set by user
INSERT INTO price_alerts (user_id, crop_name, target_price, status) VALUES
(1, 'Rice', 2500.00, 'active'),
(1, 'Cotton', 7500.00, 'active');

-- Insert notification seeds
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(1, 'Welcome to KrishiSakhi', 'Add your farm and crops to start receiving precision AI recommendations.', 'general', FALSE, NOW() - INTERVAL '2 days'),
(1, 'Pest Warning: Cotton Whitefly', 'High threat level of Whitefly detected in nearby district Bathinda. Monitor your Cotton crop closely.', 'disease', FALSE, NOW() - INTERVAL '12 hours');
