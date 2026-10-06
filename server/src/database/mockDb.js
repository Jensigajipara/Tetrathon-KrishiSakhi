// Mock In-Memory Database for KrishiSakhi
// Used as a fallback when PostgreSQL DATABASE_URL is not configured.

// Pre-seeded bcrypt hashes:
// 'admin123' -> '$2b$10$wN1rD95fPecv8k.79jH22ep3eNf.8w069G.K6w4CWh6P/LwNn16f6'
// 'farmer123' -> '$2b$10$k1R5Lw1bJv2hMfZ8o64fIuK3Bq/0t5016R1L1X1Z1e1d1C1W1G1a1'

export const mockDb = {
  users: [
    {
      id: 1,
      full_name: 'Ramesh Kumar',
      email: 'ramesh@gmail.com',
      password: '$2b$10$k1R5Lw1bJv2hMfZ8o64fIuK3Bq/0t5016R1L1X1Z1e1d1C1W1G1a1',
      role: 'farmer',
      phone: '+919876543210',
      created_at: new Date()
    }
  ],
  admin_users: [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@krishisakhi.org',
      password: '$2b$10$1zD1mLyYlkYrfGmguhNhxeO0STrcj0/4iu4bUENeVtOj0f8PH5rC2'
    }
  ],
  farms: [
    {
      id: 1,
      user_id: 1,
      farm_name: 'Green Fields Farm',
      state: 'Haryana',
      district: 'Karnal',
      village: 'Shamgarh',
      latitude: 29.780000,
      longitude: 76.990000,
      farm_size: 5.5,
      soil_type: 'Loam',
      nitrogen: 140,
      phosphorus: 55,
      potassium: 65,
      npk_ratio: '140-55-65',
      soil_ph: 6.2,
      irrigation_source: 'Tube Well',
      water_availability: 'High',
      created_at: new Date()
    },
    {
      id: 2,
      user_id: 1,
      farm_name: 'Riverside Plot',
      state: 'Punjab',
      district: 'Patiala',
      village: 'Devigarh',
      latitude: 30.150000,
      longitude: 76.450000,
      farm_size: 3.2,
      soil_type: 'Clay',
      nitrogen: 110,
      phosphorus: 48,
      potassium: 58,
      npk_ratio: '110-48-58',
      soil_ph: 6.8,
      irrigation_source: 'Canal',
      water_availability: 'Medium',
      created_at: new Date()
    }
  ],
  crops: [
    {
      id: 1,
      farm_id: 1,
      crop_name: 'Rice',
      crop_type: 'Cereal',
      sowing_date: '2026-06-15',
      expected_harvest_date: '2026-10-15',
      growth_stage: 'Vegetative',
      status: 'active'
    },
    {
      id: 2,
      farm_id: 1,
      crop_name: 'Wheat',
      crop_type: 'Cereal',
      sowing_date: '2025-11-01',
      expected_harvest_date: '2026-04-10',
      growth_stage: 'Flowering',
      status: 'harvested'
    },
    {
      id: 3,
      farm_id: 2,
      crop_name: 'Cotton',
      crop_type: 'Oilseed',
      sowing_date: '2026-05-10',
      expected_harvest_date: '2026-11-15',
      growth_stage: 'Vegetative',
      status: 'active'
    }
  ],
  crop_images: [],
  weather_history: [
    { id: 1, farm_id: 1, temperature: 31.5, humidity: 75.0, rainfall: 12.4, wind_speed: 8.5, recorded_at: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
    { id: 2, farm_id: 1, temperature: 32.0, humidity: 78.0, rainfall: 15.2, wind_speed: 9.1, recorded_at: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { id: 3, farm_id: 1, temperature: 30.5, humidity: 80.0, rainfall: 22.0, wind_speed: 12.0, recorded_at: new Date(Date.now() - 1 * 24 * 3600 * 1000) },
    { id: 4, farm_id: 2, temperature: 33.5, humidity: 60.0, rainfall: 2.1, wind_speed: 7.5, recorded_at: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
    { id: 5, farm_id: 2, temperature: 34.0, humidity: 58.0, rainfall: 0.0, wind_speed: 6.8, recorded_at: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { id: 6, farm_id: 2, temperature: 32.8, humidity: 62.0, rainfall: 4.5, wind_speed: 8.0, recorded_at: new Date(Date.now() - 1 * 24 * 3600 * 1000) }
  ],
  recommendations: [
    {
      id: 1,
      crop_id: 1,
      recommendation_type: 'irrigation',
      recommendation: 'Water level should be maintained at 2-3 cm. Rain forecast indicates 20mm rainfall, so delay active pump irrigation for 24 hours.',
      confidence_score: 92.5,
      explanation: 'Heavy rainfall predicted tomorrow will satisfy the current crop water demand.',
      created_at: new Date()
    },
    {
      id: 2,
      crop_id: 1,
      recommendation_type: 'fertilizer',
      recommendation: 'Apply Urea (Nitrogen) @ 45 kg/acre. Soil Loam type has low nitrogen availability in the vegetative stage.',
      confidence_score: 88.0,
      explanation: 'Recommended dose of Nitrogen based on growth stage (Vegetative) and crop type (Rice).',
      created_at: new Date(Date.now() - 24 * 3600 * 1000)
    }
  ],
  disease_predictions: [],
  fertilizer_recommendations: [
    { id: 1, crop_id: 1, fertilizer_name: 'Urea', quantity: 45.0, schedule: 'Vegetative Stage - First Top Dressing' },
    { id: 2, crop_id: 1, fertilizer_name: 'SSP (Single Super Phosphate)', quantity: 60.0, schedule: 'Basal Dose - At Sowing' },
    { id: 3, crop_id: 2, fertilizer_name: 'Urea', quantity: 50.0, schedule: 'Crown Root Initiation Stage' }
  ],
  pest_alerts: [
    { id: 1, crop_id: 1, pest_name: 'Stem Borer', risk_level: 'Medium', recommendation: 'Apply Cartap Hydrochloride 4G @ 10kg/acre or spray Chlorantraniliprole 18.5% SC @ 60ml/acre.' },
    { id: 2, crop_id: 3, pest_name: 'Whitefly', risk_level: 'High', recommendation: 'Spray Neem Oil @ 1500ppm or use Acetamiprid 20% SP @ 80g/acre. Install yellow sticky traps.' }
  ],
  market_prices: [
    { id: 1, crop_name: 'Rice', mandi_name: 'Karnal Mandi', district: 'Karnal', price: 2450.00, date: new Date() },
    { id: 2, crop_name: 'Rice', mandi_name: 'Panipat Mandi', district: 'Panipat', price: 2420.00, date: new Date() },
    { id: 3, crop_name: 'Rice', mandi_name: 'Kurukshetra Mandi', district: 'Kurukshetra', price: 2480.00, date: new Date() },
    { id: 4, crop_name: 'Wheat', mandi_name: 'Patiala Mandi', district: 'Patiala', price: 2125.00, date: new Date() },
    { id: 5, crop_name: 'Wheat', mandi_name: 'Karnal Mandi', district: 'Karnal', price: 2150.00, date: new Date() },
    { id: 6, crop_name: 'Cotton', mandi_name: 'Hisar Mandi', district: 'Hisar', price: 7100.00, date: new Date() },
    { id: 7, crop_name: 'Cotton', mandi_name: 'Sirsa Mandi', district: 'Sirsa', price: 7250.00, date: new Date() },
    { id: 8, crop_name: 'Cotton', mandi_name: 'Bathinda Mandi', district: 'Bathinda', price: 7050.00, date: new Date() },
    { id: 9, crop_name: 'Maize', mandi_name: 'Panipat Mandi', district: 'Panipat', price: 1960.00, date: new Date() },
    { id: 10, crop_name: 'Maize', mandi_name: 'Rohtak Mandi', district: 'Rohtak', price: 1980.00, date: new Date() },
    { id: 11, crop_name: 'Sugarcane', mandi_name: 'Yamunanagar Mandi', district: 'Yamunanagar', price: 380.00, date: new Date() },
    { id: 12, crop_name: 'Sugarcane', mandi_name: 'Meerut Mandi', district: 'Meerut', price: 390.00, date: new Date() }
  ],
  storage_predictions: [],
  transport_predictions: [],
  price_alerts: [
    { id: 1, user_id: 1, crop_name: 'Rice', target_price: 2500.00, status: 'active' },
    { id: 2, user_id: 1, crop_name: 'Cotton', target_price: 7500.00, status: 'active' }
  ],
  notifications: [
    { id: 1, user_id: 1, title: 'Welcome to KrishiSakhi', message: 'Add your farm and crops to start receiving precision AI recommendations.', type: 'general', is_read: false, created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { id: 2, user_id: 1, title: 'Pest Warning: Cotton Whitefly', message: 'High threat level of Whitefly detected in nearby district Bathinda. Monitor your Cotton crop closely.', type: 'disease', is_read: false, created_at: new Date(Date.now() - 12 * 3600 * 1000) }
  ],
  analytics_logs: [],
  equipment: [
    { id: 1, name: 'Combine Harvester', image_url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400', rental_cost: 2500.00, availability: true, nearby_rental_center: 'Karnal Agri Center', contact: '+919876543201' },
    { id: 2, name: 'Tractor with Rotavator', image_url: 'https://images.unsplash.com/photo-1594136976694-df0a28f87050?auto=format&fit=crop&q=80&w=400', rental_cost: 1200.00, availability: true, nearby_rental_center: 'Shamgarh Cooperative', contact: '+919876543202' },
    { id: 3, name: 'Grain Dryer', image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400', rental_cost: 800.00, availability: true, nearby_rental_center: 'Gharaunda Warehouse', contact: '+919876543203' }
  ],
  equipment_rentals: [],
  crop_plans: [],
  ai_recommendations: []
};
