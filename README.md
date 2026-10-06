# 🌾 KrishiSakhi - AI-Powered Agricultural Advisory Platform

![Repository Size](https://img.shields.io/github/languages/code-size/DenilGevariya/Tetrathon_KrishiSakhi)
![Language](https://img.shields.io/github/languages/top/DenilGevariya/Tetrathon_KrishiSakhi)
![License](https://img.shields.io/badge/license-MIT-green)

**KrishiSakhi** is an intelligent agricultural advisory system designed to empower Indian farmers with AI-driven crop management insights, disease detection, and market intelligence. Built for the Tetrathon hackathon, it combines machine learning recommendations with real-time weather forecasting and market data.

**Live Demo:** [https://krishisakhi-ai.vercel.app](https://krishisakhi-ai.vercel.app)

---

## ✨ Key Features

### 🌾 Farm & Crop Management
- **Multi-farm Support:** Manage multiple farms with detailed location (state, district, village) and soil type tracking
- **Crop Lifecycle Tracking:** Monitor crop growth stages (Sowing → Vegetative → Flowering → Harvesting)
- **Farm Mapping:** Geospatial visualization using Leaflet maps with latitude/longitude support

### 🤖 AI-Powered Crop Advisor
- **Daily Recommendations:** Personalized crop health guidance based on growth stage and soil conditions
- **Disease Scanner:** AI image recognition for leaf disease detection with confidence scoring and treatment recommendations
- **Fertilizer Planner:** Intelligent NPK recommendations with cost estimates and application schedules
- **Pest Alert System:** Predictive pest risk identification for regional crops
- **Storage Optimization:** Spoilage prediction and optimal storage method recommendations

### 🌦️ Weather & Market Intelligence
- **Real-time Weather Data:** Temperature, humidity, rainfall, and wind speed monitoring
- **Market Price Tracking:** Mandi rates across districts for informed selling decisions
- **Transport Decision Support:** Cost and profit analysis for different transportation routes
- **Price Alerts:** Configurable alerts when crop prices reach target thresholds

### 👥 User Management
- **Farmer Dashboard:** Unified interface for all farm operations and recommendations
- **Admin Panel:** Manage users, analytics, and platform-wide data
- **Secure Authentication:** JWT-based session management with role-based access control

### 📊 Analytics & Logging
- **Interaction Tracking:** Logs of all AI model calls for transparency and auditing
- **Notification System:** Real-time alerts for disease, weather, market, and general farm events
- **User Activity Analytics:** Dashboard for monitoring farmer engagement and platform usage

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library with hooks and context API
- **Vite 8.1** - Lightning-fast build tool with HMR
- **Tailwind CSS 4.3** - Utility-first styling with Vite integration
- **React Router v7** - Client-side routing with protected routes
- **React Hook Form + Zod** - Type-safe form validation
- **React Query v5** - Data fetching and caching
- **Framer Motion** - Smooth animations and transitions
- **Leaflet + React-Leaflet** - Interactive maps for farm visualization
- **Recharts** - Beautiful data visualization for analytics
- **Axios** - HTTP client with request interceptors
- **Lucide React** - Modern icon library

### Backend
- **Express.js** - Minimal and flexible Node.js framework
- **PostgreSQL (Neon)** - Scalable cloud-native database
- **Node pg** - Native PostgreSQL client
- **Multer** - File upload handling for crop images
- **JWT (jsonwebtoken)** - Secure authentication tokens
- **Bcrypt** - Password hashing and verification
- **CORS** - Cross-origin request handling
- **Dotenv** - Environment variable management

### AI & Integrations
- **OpenRouter API** - Unified access to multiple LLM models (NVIDIA, Claude, GPT)
- **AI-powered features:**
  - Crop health advisory (precisionAdvisory)
  - Disease detection (diseaseScanner)
  - Fertilizer recommendations (fertilizerPlan)
  - Pest risk assessment (pestAlert)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL database** (or Neon cloud instance)
- **OpenRouter API key** for LLM access
- **Modern web browser**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/DenilGevariya/Tetrathon_KrishiSakhi.git
cd Tetrathon_KrishiSakhi
```

#### 2. Setup Backend
```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=your_neon_db_host
DB_PORT=5432
DB_NAME=krishisakhi
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key
EOF

# Start backend server
npm run dev  # Development with auto-reload
# or
npm start   # Production
```

The backend will initialize the PostgreSQL database automatically on first run, creating all tables from `schema.sql`.

#### 3. Setup Frontend
```bash
cd ../client
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start frontend development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

#### 4. Build for Production
```bash
# Frontend build
npm run build      # Creates optimized bundle in dist/
npm run preview    # Preview production build locally

# Backend is ready for deployment as-is
```

---

## 📊 Database Schema

The application uses PostgreSQL with the following core tables:

```
users
├── Farmer and admin user accounts
├── Credentials, contact info, role-based access

farms
├── Multi-farm management per user
├── Geolocation (lat/long), soil type, size in acres

crops
├── Crop lifecycle tracking per farm
├── Growth stages, sowing/harvest dates, status

crop_images
├── Uploaded leaf photos for disease detection

weather_history
├── Historical temperature, humidity, rainfall, wind data

recommendations
├── AI-generated crop health, irrigation, fertilizer advice

disease_predictions
├── Disease scan results with severity and treatment

fertilizer_recommendations
├── AI-based NPK recommendations with schedules

pest_alerts
├── Pest risk assessments by growth stage

market_prices
├── Mandi rates for crops across districts

storage_predictions & transport_predictions
├── Optimization recommendations

notifications & price_alerts
├── User alerts and watchlist tracking

ai_interactions
├── Logging of all LLM calls for auditing
```

See `database/schema.sql` for the complete DDL.

---

## 🔐 Authentication & Authorization

### User Roles
- **Farmer** - Default role; access to personal dashboard and recommendations
- **Admin** - Full platform access including user management and analytics

### Token-Based Auth
- JWT tokens stored in `localStorage` as `ks_token`
- Sent in Authorization header: `Bearer <token>`
- Verified on protected routes via `verifyToken` middleware
- Automatic session restoration on page refresh

### API Endpoints
```
POST   /api/auth/register          - Create farmer account
POST   /api/auth/login             - Authenticate and get JWT
POST   /api/auth/admin/login       - Admin authentication
GET    /api/auth/profile           - Get current user (protected)
```

---

## 📡 API Routes

### Farms
```
GET    /api/farms                  - List user's farms
POST   /api/farms                  - Create new farm
GET    /api/farms/:id              - Get farm details
PUT    /api/farms/:id              - Update farm
```

### Crops
```
GET    /api/crops                  - List crops for user's farms
POST   /api/crops                  - Create crop
GET    /api/crops/:id              - Get crop details
PUT    /api/crops/:id              - Update growth stage/status
```

### AI Advisor
```
GET    /api/advisor/recommendations/:cropId       - Daily advice
POST   /api/advisor/disease/:cropId               - Upload & analyze leaf image
GET    /api/advisor/disease-history/:cropId       - Past disease scans
GET    /api/advisor/fertilizer/:cropId            - Fertilizer plan
GET    /api/advisor/pest-alerts/:cropId           - Pest risks
```

### Weather & Market
```
GET    /api/weather/:farmId        - Current & forecast weather
GET    /api/market/prices          - Mandi rates by crop/district
GET    /api/market/transport/:cropId - Transport cost analysis
```

### Notifications
```
GET    /api/notifications          - User's notifications
POST   /api/notifications/price-alerts - Create price watch
```

### Admin
```
GET    /api/admin/users            - Manage users
GET    /api/admin/analytics        - Platform analytics
```

---

## 🎨 Frontend Structure

### Pages
- **Landing** - Onboarding and feature showcase
- **Login/Register** - Authentication
- **Dashboard Home** - Overview and quick stats
- **Farms** - Create and manage multi-farm operations
- **Crops** - Track individual crops and growth
- **Crop Advisor** - Get AI recommendations
- **Disease Detection** - Upload images for disease scanning
- **Weather Intelligence** - Real-time and forecasted conditions
- **Fertilizer Planner** - View and plan fertilizer applications
- **Pest Alert** - Monitor pest risks
- **Storage Planner** - Optimize post-harvest storage
- **Market Intelligence** - Track prices and sell decisions
- **Transport Decision** - Analyze logistics costs
- **Admin Dashboard** - Manage users and analytics

### Components
- `DashboardLayout` - Protected farmer interface with sidebar navigation
- `AdminLayout` - Admin-only interface
- Reusable form, card, and modal components

### State Management
- **AuthContext** - User session and authentication state
- **React Query** - Server state caching and synchronization
- **Axios interceptors** - Automatic auth header injection

---

## 🧠 AI Integration (OpenRouter)

KrishiSakhi uses OpenRouter to access multiple LLM models for specialized tasks:

### AI Functions (in `server/src/ai/index.js`)
1. **Precision Advisory** - Crop health recommendations based on growth stage
2. **Disease Scanner** - Identify leaf diseases from images
3. **Fertilizer Plan** - Generate NPK recommendations
4. **Pest Alert** - Predict pest risks by region
5. **Storage Optimizer** - Recommend storage methods
6. **Market Analyst** - Provide selling insights

### System Prompts
Each AI function has a specialized system prompt tuned for agricultural context:
- Agronomic expertise
- Regional crop varieties
- Soil chemistry
- Pest and disease identification
- Market trends

### Usage Tracking
All AI interactions are logged in `ai_interactions` table:
- User ID
- Prompt and context
- Model used
- Tokens consumed
- Response and confidence score
- Processing time

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub, connect to Vercel
# Set environment variable: VITE_API_URL=<backend-url>/api
# Auto-deploys on push to main
```

### Backend (Node Hosting)
```bash
# Options: Railway, Render, Heroku, AWS EC2, etc.
# Environment variables required:
# - DB_* (PostgreSQL credentials)
# - JWT_SECRET
# - OPENROUTER_API_KEY
# - NODE_ENV=production
```

### Database (Neon PostgreSQL)
- Create account at [neon.tech](https://neon.tech)
- Copy connection string to `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- Auto-scales and backs up

---

## 📱 Usage Examples

### Register a Farmer Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "password": "SecurePass123",
    "phone": "+91-9876543210"
  }'
```

### Create a Farm
```bash
curl -X POST http://localhost:5000/api/farms \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "farm_name": "Green Valley Farm",
    "state": "Maharashtra",
    "district": "Pune",
    "village": "Talegaon",
    "latitude": 19.1136,
    "longitude": 73.8025,
    "farm_size": 5.5,
    "soil_type": "Loam"
  }'
```

### Get Disease Prediction
```bash
curl -X POST http://localhost:5000/api/advisor/disease/1 \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "file=@leaf_image.jpg"
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- **Tetrathon Hackathon** - Innovation platform
- **OpenRouter** - LLM API infrastructure
- **Neon** - Cloud PostgreSQL hosting
- **Vercel** - Frontend deployment

---

## 📧 Support & Contact

For issues, questions, or feature requests:
- GitHub Issues: [Open an Issue](https://github.com/DenilGevariya/Tetrathon_KrishiSakhi/issues)
- Email: [denilgevariya@example.com]

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications for low-connectivity areas
- [ ] Satellite imagery integration for crop monitoring
- [ ] Crop yield prediction model
- [ ] Farmer community forum
- [ ] Multi-language support (Hindi, Marathi, etc.)
- [ ] Integration with government crop schemes
- [ ] Blockchain for produce traceability

---

**Last Updated:** July 2026
**Repository:** [DenilGevariya/Tetrathon_KrishiSakhi](https://github.com/DenilGevariya/Tetrathon_KrishiSakhi)
#   T e t r a t h o n - K r i s h i S a k h i  
 #   T e t r a t h o n - K r i s h i S a k h i  
 