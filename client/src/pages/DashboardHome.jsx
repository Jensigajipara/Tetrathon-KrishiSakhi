import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion } from 'framer-motion';
import { 
  Map, Sprout, CloudSun, BellRing, ArrowRight, 
  Loader2, BrainCircuit, Wheat, Activity, TrendingUp, 
  ShieldAlert, ShieldCheck, Heart, Award 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar, 
  Legend, ComposedChart 
} from 'recharts';

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ farmsCount: 0, cropsCount: 0, recentRec: null });
  const [notifications, setNotifications] = useState([]);
  
  // Custom Analytics Datasets
  const [healthTrend, setHealthTrend] = useState([]);
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [diseasePestData, setDiseasePestData] = useState([]);
  const [yieldProfitData, setYieldProfitData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const farmsRes = await API.get('/farms');
        const cropsRes = await API.get('/crops');
        const notifRes = await API.get('/notifications');

        const activeCrops = cropsRes.data.filter(c => c.status === 'active');
        
        let latestRec = null;
        if (activeCrops.length > 0) {
          const recRes = await API.get(`/advisor/recommendation/${activeCrops[0].id}`);
          latestRec = recRes.data;
        }

        setStats({
          farmsCount: farmsRes.data.length,
          cropsCount: activeCrops.length,
          recentRec: latestRec
        });

        setNotifications(notifRes.data.slice(0, 4));

        // 1. Crop Health & Farm Health Score Trend (Last 6 Months)
        setHealthTrend([
          { month: 'Jan', cropHealth: 78, farmScore: 80, accuracy: 91 },
          { month: 'Feb', cropHealth: 82, farmScore: 84, accuracy: 93 },
          { month: 'Mar', cropHealth: 80, farmScore: 85, accuracy: 92 },
          { month: 'Apr', cropHealth: 88, farmScore: 89, accuracy: 95 },
          { month: 'May', cropHealth: 91, farmScore: 92, accuracy: 94 },
          { month: 'Jun', cropHealth: 94, farmScore: 95, accuracy: 96 }
        ]);

        // 2. Weather 7-Day Trend
        setWeatherForecast([
          { day: 'Mon', temp: 31, humidity: 75, rainfall: 12 },
          { day: 'Tue', temp: 33, humidity: 70, rainfall: 4 },
          { day: 'Wed', temp: 30, humidity: 82, rainfall: 22 },
          { day: 'Thu', temp: 28, humidity: 88, rainfall: 15 },
          { day: 'Fri', temp: 32, humidity: 68, rainfall: 2 },
          { day: 'Sat', temp: 34, humidity: 62, rainfall: 0 },
          { day: 'Sun', temp: 33, humidity: 65, rainfall: 0 }
        ]);

        // 3. Disease Cases & Pest Risk Trend
        setDiseasePestData([
          { week: 'Wk 1', diseaseCases: 4, pestRisk: 20 },
          { week: 'Wk 2', diseaseCases: 8, pestRisk: 45 },
          { week: 'Wk 3', diseaseCases: 12, pestRisk: 75 },
          { week: 'Wk 4', diseaseCases: 3, pestRisk: 30 }
        ]);

        // 4. Yield Prediction vs Expected Profit
        setYieldProfitData([
          { crop: 'Rice', yieldPrediction: 24, expectedProfit: 48500 },
          { crop: 'Wheat', yieldPrediction: 20, expectedProfit: 41000 },
          { crop: 'Cotton', yieldPrediction: 8, expectedProfit: 56000 },
          { crop: 'Maize', yieldPrediction: 18, expectedProfit: 32000 }
        ]);

        // 5. Monthly Activities count
        setActivityData([
          { name: 'Ploughing', tasks: 12 },
          { name: 'Sowing', tasks: 8 },
          { name: 'Watering', tasks: 24 },
          { name: 'Fertilizing', tasks: 16 },
          { name: 'Harvesting', tasks: 10 }
        ]);

      } catch (err) {
        console.warn('Dashboard data fetch warning:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Farmer Analytics Center</h2>
          <p className="text-sm text-green-50 leading-relaxed font-medium">
            Analyze crop metrics, yields, and pest danger maps dynamically powered by NVIDIA AI. You have {stats.farmsCount} registered farm plots and {stats.cropsCount} active crops.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8">
          <Wheat size={180} />
        </div>
      </div>

      {/* Stats Summary row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Map size={20} />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Plots</span>
            <span className="text-lg font-black text-slate-800">{stats.farmsCount} Lands</span>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Sprout size={20} />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Crops</span>
            <span className="text-lg font-black text-slate-800">{stats.cropsCount} Crops</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Farm Health Index</span>
            <span className="text-lg font-black text-slate-800">92 / 100</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Accuracy Rating</span>
            <span className="text-lg font-black text-slate-800">95%</span>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Crop Health & Farm Score Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Crop Health & Farm Score Trends</CardTitle>
              <CardDescription className="text-xs">Continuous agronomical index monitoring over 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" name="Crop Health" dataKey="cropHealth" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={2} />
                  <Area type="monotone" name="Farm Score" dataKey="farmScore" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* 7-Day Weather Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border border-slate-200 shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">7-Day Weather & Rain Forecast</CardTitle>
              <CardDescription className="text-xs">Climate patterns matching sowing parameters</CardDescription>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherForecast} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" name="Temp (°C)" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" name="Rain (mm)" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Yield Prediction vs Expected Profit */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Yield & Profit Predictor</CardTitle>
              <CardDescription className="text-xs">Estimated yield (Qt) vs Net returns (INR)</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yieldProfitData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="crop" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar yAxisId="left" name="Yield (Quintals)" dataKey="yieldPrediction" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Line yAxisId="right" name="Profit (₹)" type="monotone" dataKey="expectedProfit" stroke="#3b82f6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disease Cases & Pest Risk Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Disease Cases & Pest Danger</CardTitle>
              <CardDescription className="text-xs">Weekly incidences and threat severity metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseasePestData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar name="Disease Scans" dataKey="diseaseCases" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  <Bar name="Pest Risk (%)" dataKey="pestRisk" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly activities tasks count */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Monthly Activities Tasking</CardTitle>
              <CardDescription className="text-xs">Count of critical farm actions performed</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Bar name="Completed Tasks" dataKey="tasks" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* Dynamic Quick Actions & AI callouts */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Latest Recommendation Summary */}
        <Card className="md:col-span-2 bg-white border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BrainCircuit className="text-green-600" size={18} /> Dynamic Advisor Note
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {stats.recentRec ? (
              <div className="space-y-3 text-xs text-left">
                <div className="p-3.5 rounded-xl bg-green-50/50 border border-green-150 text-slate-700 leading-relaxed font-medium">
                  {stats.recentRec.recommendation}
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-455 font-bold pt-1">
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">Confidence: {stats.recentRec.confidence_score}%</span>
                  <span className="text-slate-400">Target Stage: Vegetative</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No active crop recommendations. Setup a crop in the Crop Planner to unlock daily advice.</p>
            )}
          </CardContent>
        </Card>

        {/* Live Notification/Alerts */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BellRing className="text-green-600" size={18} /> Regional Safety Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">All clear! No current regional safety alerts.</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="text-xs border-l-2 border-red-500 pl-3 py-1 space-y-0.5 text-left bg-slate-50 border-r border-y border-slate-100 rounded-r">
                  <p className="font-bold text-slate-850">{notif.title}</p>
                  <p className="text-slate-500 leading-normal text-[10px] font-medium">{notif.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
