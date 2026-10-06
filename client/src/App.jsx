import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Layout Imports
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Pages Imports
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Farms from './pages/Farms.jsx';
import Crops from './pages/Crops.jsx';
import CropAdvisor from './pages/CropAdvisor.jsx';
import DiseaseDetection from './pages/DiseaseDetection.jsx';
import WeatherIntelligence from './pages/WeatherIntelligence.jsx';
import FertilizerPlanner from './pages/FertilizerPlanner.jsx';
import StoragePlanner from './pages/StoragePlanner.jsx';
import MarketIntelligence from './pages/MarketIntelligence.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EquipmentRental from './pages/EquipmentRental.jsx';

// Route guards
const FarmerRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Farmer Section */}
      <Route
        path="/dashboard"
        element={
          <FarmerRoute>
            <DashboardLayout />
          </FarmerRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<DashboardHome />} />
        <Route path="my-farms" element={<Farms />} />
        <Route path="crops" element={<Crops />} />
        <Route path="crop-advisor" element={<CropAdvisor />} />
        <Route path="disease" element={<DiseaseDetection />} />
        <Route path="weather" element={<WeatherIntelligence />} />
        <Route path="fertilizer" element={<FertilizerPlanner />} />
        <Route path="storage" element={<StoragePlanner />} />
        <Route path="market" element={<MarketIntelligence />} />
        <Route path="equipment-rental" element={<EquipmentRental />} />
      </Route>

      {/* Protected Admin Section */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard />} />
        <Route path="farms" element={<AdminDashboard />} />
        <Route path="crops" element={<AdminDashboard />} />
        <Route path="market" element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
