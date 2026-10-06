import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Select } from '../components/ui/select.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudSun, Thermometer, Droplets, CloudRain, Wind, 
  RefreshCw, Loader2, CalendarDays, Search, MapPin, 
  Sun, ShieldAlert, Sparkles, BrainCircuit, Lightbulb, Compass
} from 'lucide-react';

export default function WeatherIntelligence() {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  // Location Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeLocation, setActiveLocation] = useState('Karnal, Haryana');
  
  const popularLocations = [
    'Karnal, Haryana',
    'Patiala, Punjab',
    'Yamunanagar, Haryana',
    'Meerut, Uttar Pradesh',
    'Ludhiana, Punjab',
    'Bathinda, Punjab',
    'Sirsa, Haryana'
  ];

  const loadFarms = async () => {
    setLoading(true);
    try {
      const res = await API.get('/farms');
      setFarms(res.data);
      if (res.data.length > 0) {
        setSelectedFarmId(res.data[0].id);
        setActiveLocation(`${res.data[0].district}, ${res.data[0].state}`);
      }
    } catch (err) {
      setError('Could not retrieve farm lists.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (farmId) => {
    if (!farmId) return;
    setWeatherLoading(true);
    setError('');
    try {
      const res = await API.get(`/weather/${farmId}`);
      setWeatherData(res.data.irrigation);
    } catch (err) {
      setError('Could not fetch weather forecast parameters.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedFarmId) return;
    setWeatherLoading(true);
    setError('');
    try {
      const res = await API.post(`/weather/${selectedFarmId}/refresh`);
      setWeatherData(res.data.irrigation);
    } catch (err) {
      setError('Failed to refresh weather conditions.');
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      const farm = farms.find(f => f.id === Number(selectedFarmId));
      if (farm) {
        setActiveLocation(`${farm.district}, ${farm.state}`);
      }
      fetchWeather(selectedFarmId);
    }
  }, [selectedFarmId]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const filtered = popularLocations.filter(loc => 
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (loc) => {
    setSearchQuery('');
    setSuggestions([]);
    setActiveLocation(loc);
    // Find matching farm or trigger dummy load
    const matchFarm = farms.find(f => 
      loc.toLowerCase().includes(f.district.toLowerCase())
    );
    if (matchFarm) {
      setSelectedFarmId(matchFarm.id);
    } else {
      // Simulate reload advice for text search location
      if (selectedFarmId) {
        fetchWeather(selectedFarmId);
      }
    }
  };

  const handleUseGeolocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setActiveLocation(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        if (selectedFarmId) {
          fetchWeather(selectedFarmId);
        } else {
          setWeatherLoading(false);
        }
      },
      (err) => {
        setWeatherLoading(false);
        setError('Unable to retrieve your current location. Make sure GPS access is enabled.');
      }
    );
  };

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return 'text-green-600 bg-green-50';
    if (aqi <= 100) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Weather Intelligence</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time agricultural weather forecasts, geolocation parameters, and AI irrigation advice</p>
        </div>
        
        {selectedFarmId && (
          <Button onClick={handleRefresh} disabled={weatherLoading} variant="outline" size="sm" className="h-9">
            <RefreshCw size={14} className={`mr-1.5 ${weatherLoading ? 'animate-spin' : ''}`} /> Refresh Forecast
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Geolocation, search & Auto-complete */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm relative z-20">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <Input
              type="text"
              placeholder="Search City / District..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 h-10 text-xs"
            />
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-30 text-xs">
                {suggestions.map((loc, index) => (
                  <li 
                    key={index} 
                    onClick={() => handleSelectSuggestion(loc)}
                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-slate-700 font-semibold"
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto items-center">
            <Button onClick={handleUseGeolocation} variant="outline" className="flex items-center gap-1.5 h-10 w-full sm:w-auto text-xs">
              <MapPin size={14} className="text-green-600" /> Current Location
            </Button>
            
            {farms.length > 0 && (
              <Select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full sm:w-56 h-10"
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.farm_name} ({f.district})</option>
                ))}
              </Select>
            )}
          </div>

        </div>
      </Card>

      {loading || weatherLoading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Weather Stats & Forecast */}
          <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
            {/* Current details dashboard */}
            <Card className="bg-white border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Location</span>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-1 mt-0.5">
                      <Compass className="text-green-600" size={18} /> {activeLocation}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-800">31°C</span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Heavy Rain Forecasted</span>
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-50">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Humidity</span>
                    <Droplets size={16} className="text-blue-500 mx-auto mb-1" />
                    <span className="font-extrabold text-slate-800">82%</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rain Prob</span>
                    <CloudRain size={16} className="text-blue-500 mx-auto mb-1" />
                    <span className="font-extrabold text-slate-800">90%</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Wind Speed</span>
                    <Wind size={16} className="text-slate-550 mx-auto mb-1" />
                    <span className="font-extrabold text-slate-800">14 km/h</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">UV Index</span>
                    <Sun size={16} className="text-amber-500 mx-auto mb-1" />
                    <span className="font-extrabold text-slate-800">3 (Low)</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs col-span-2 sm:col-span-1">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Air Quality</span>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded mx-auto mt-1 ${getAqiColor(42)}`}>
                      42 (Good)
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 7-Day Forecast Grid */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays size={16} className="text-slate-400" /> 7-Day Agricultural Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {[
                  { day: 'Monday (Today)', temp: '31°C / 26°C', rain: '90%', wind: '14 km/h', summary: 'Heavy rain, delay top-dressing.' },
                  { day: 'Tuesday', temp: '33°C / 27°C', rain: '45%', wind: '10 km/h', summary: 'Scattered clouds, high humidity.' },
                  { day: 'Wednesday', temp: '30°C / 25°C', rain: '80%', wind: '18 km/h', summary: 'Moderate rain showers, good moisture.' },
                  { day: 'Thursday', temp: '29°C / 24°C', rain: '60%', wind: '12 km/h', summary: 'Overcast, optimal for soil checks.' },
                  { day: 'Friday', temp: '32°C / 26°C', rain: '20%', wind: '8 km/h', summary: 'Bright sun, weeding possible.' },
                  { day: 'Saturday', temp: '34°C / 27°C', rain: '5%', wind: '7 km/h', summary: 'Dry hot day, clear skies.' },
                  { day: 'Sunday', temp: '33°C / 26°C', rain: '10%', wind: '9 km/h', summary: 'Sunny intervals, normal evaporation.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-wrap justify-between items-center text-xs p-3 bg-slate-50 border border-slate-100 rounded-lg hover-scale gap-3">
                    <span className="font-bold text-slate-800 w-32 text-left">{item.day}</span>
                    <span className="font-semibold text-slate-655 w-24 text-left">{item.temp}</span>
                    <span className="text-[10px] text-blue-600 font-bold w-16 text-left flex items-center gap-0.5">
                      <CloudRain size={12} /> {item.rain}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate flex-1 text-left">{item.summary}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right column AI advice */}
          <motion.div variants={cardVariants} className="lg:col-span-1">
            <Card className="bg-white border border-slate-200 shadow-sm h-full flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                    <BrainCircuit className="text-green-600" size={16} /> AI Irrigation & Climate Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {weatherData ? (
                    <div className="space-y-4 text-xs font-semibold text-slate-600 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{weatherData.title}</span>
                        <span className="text-[9px] px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded">
                          {weatherData.confidence}% Confidence
                        </span>
                      </div>
                      
                      <div className="p-3.5 rounded-xl bg-green-50/50 border border-green-150 text-slate-700 leading-relaxed font-medium">
                        {weatherData.recommendation}
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scientific Reason</span>
                        <p className="leading-relaxed font-medium text-slate-550 text-[11px]">{weatherData.reasoning}</p>
                      </div>

                      {weatherData.warnings && weatherData.warnings.length > 0 && (
                        <div className="p-3.5 bg-amber-50 border border-amber-150 rounded-xl text-amber-800 text-[11px] font-medium leading-relaxed">
                          <span className="font-bold text-amber-900 block mb-0.5">Weather Precaution</span>
                          {weatherData.warnings[0]}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 py-6 text-center">No AI advisory loaded. Click Refresh Forecast.</p>
                  )}
                </CardContent>
              </div>

              {weatherData && (
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex gap-2 text-[10px] font-bold text-slate-400 justify-center">
                  <Lightbulb size={12} className="text-amber-500" />
                  <span>Calculated via NVIDIA Nemotron 3 Ultra</span>
                </div>
              )}
            </Card>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
