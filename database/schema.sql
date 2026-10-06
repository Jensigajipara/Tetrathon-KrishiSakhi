-- PostgreSQL Schema for KrishiSakhi

-- Enable UUID extension if needed, though sequential BIGSERIAL is fine and easy to track
-- We'll use BIGSERIAL primary keys

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer', -- 'farmer', 'admin'
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    village VARCHAR(50),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    farm_size DECIMAL(10, 2) NOT NULL, -- in acres
    soil_type VARCHAR(50) NOT NULL, -- Clay, Loam, Sandy, Silt, Peaty, Saline
    nitrogen INTEGER DEFAULT 120,
    phosphorus INTEGER DEFAULT 50,
    potassium INTEGER DEFAULT 60,
    npk_ratio VARCHAR(50) DEFAULT '120-50-60',
    soil_ph DECIMAL(3, 1) DEFAULT 6.5,
    irrigation_source VARCHAR(50) DEFAULT 'Tube Well',
    water_availability VARCHAR(50) DEFAULT 'High',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    crop_type VARCHAR(50), -- Cereal, Vegetable, Fruit, Legume, Oilseed
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    growth_stage VARCHAR(50) DEFAULT 'Sowing', -- Sowing, Vegetative, Flowering, Harvesting
    status VARCHAR(20) DEFAULT 'active' -- active, harvested, failed
);

CREATE TABLE IF NOT EXISTS crop_images (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    image_data TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_history (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    temperature DECIMAL(5, 2) NOT NULL,
    humidity DECIMAL(5, 2) NOT NULL,
    rainfall DECIMAL(5, 2) NOT NULL,
    wind_speed DECIMAL(5, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- irrigation, fertilizer, health, harvest
    recommendation TEXT NOT NULL,
    confidence_score DECIMAL(5, 2) DEFAULT 100.0,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disease_predictions (
    id SERIAL PRIMARY KEY,
    crop_image_id INTEGER REFERENCES crop_images(id) ON DELETE CASCADE,
    disease_name VARCHAR(150) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- Low, Medium, High
    treatment TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fertilizer_recommendations (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    fertilizer_name TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL, -- in kg/acre
    schedule TEXT NOT NULL -- e.g., 'At sowing', 'After 3 weeks'
);

CREATE TABLE IF NOT EXISTS pest_alerts (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    pest_name VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- Low, Medium, High
    recommendation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    mandi_name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- price per quintal (100kg) in INR
    date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS storage_predictions (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    spoilage_percentage DECIMAL(5, 2) NOT NULL,
    storage_type VARCHAR(100) NOT NULL, -- Cold Storage, Open Granary, Hermetic Bag
    recommendation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transport_predictions (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    destination VARCHAR(150) NOT NULL,
    transport_cost DECIMAL(10, 2) NOT NULL,
    estimated_profit DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    target_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' -- active, triggered, expired
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- weather, price, disease, general
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

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
    processing_time INTEGER DEFAULT 0, -- in ms
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
