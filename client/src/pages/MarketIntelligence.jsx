import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Select } from '../components/ui/select.jsx';
import { Dialog } from '../components/ui/dialog.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Bell, Plus, Compass, Loader2, Sparkles, 
  AlertCircle, RefreshCw, MapPin, Truck, Clock, Navigation 
} from 'lucide-react';

export default function MarketIntelligence() {
  const [prices, setPrices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter & Sorting variables
  const [cropFilter, setCropFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [sortBy, setSortBy] = useState('price'); // price, profit, distance, transportCost

  // Price Alert Dialog values
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertCrop, setAlertCrop] = useState('Rice');
  const [alertTargetPrice, setAlertTargetPrice] = useState('');

  const loadMarketData = async () => {
    setLoading(true);
    setError('');
    try {
      const pricesRes = await API.get('/market/prices');
      
      // Enrich price records with distance and logistics simulations consistently
      const enriched = pricesRes.data.map(p => {
        const distance = ((p.id * 17) % 80) + 12; // simulated consistent distance
        const transitRate = 2.2; // ₹2.2 per Quintal per km
        const transitCost = Number((distance * transitRate).toFixed(2));
        const expectedPrice = Number((p.price * 1.05).toFixed(2));
        const expectedProfit = Number((p.price - transitCost).toFixed(2));
        const travelTime = Number((distance / 45).toFixed(1)); // 45 km/h truck speed
        
        return {
          ...p,
          distance,
          transitCost,
          expectedPrice,
          expectedProfit,
          travelTime
        };
      });

      setPrices(enriched);

      const alertsRes = await API.get('/market/alerts');
      setAlerts(alertsRes.data);
    } catch (err) {
      setError('Could not retrieve market price indices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const handleOpenAlertModal = () => {
    setAlertCrop('Rice');
    setAlertTargetPrice('');
    setError('');
    setAlertModalOpen(true);
  };

  const handleSaveAlert = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/market/alerts', {
        crop_name: alertCrop,
        target_price: Number(alertTargetPrice)
      });
      setAlertModalOpen(false);
      loadMarketData();
    } catch (err) {
      setError('Error setting price threshold warning.');
    }
  };

  // Filter and sort prices
  const getProcessedPrices = () => {
    let list = prices.filter(p => {
      const cropMatch = cropFilter ? p.crop_name.toLowerCase() === cropFilter.toLowerCase() : true;
      const districtMatch = districtFilter ? p.district.toLowerCase().includes(districtFilter.toLowerCase()) : true;
      return cropMatch && districtMatch;
    });

    if (sortBy === 'price') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'profit') {
      list.sort((a, b) => b.expectedProfit - a.expectedProfit);
    } else if (sortBy === 'distance') {
      list.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'transportCost') {
      list.sort((a, b) => a.transitCost - b.transitCost);
    }

    return list;
  };

  const processedPrices = getProcessedPrices();

  // Highest price threshold
  const highestPriceVal = processedPrices.length > 0 
    ? Math.max(...processedPrices.map(p => Number(p.price))) 
    : 0;

  const handleOpenMandiMap = (mandiName) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mandiName)}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Market Intelligence Directory</h2>
          <p className="text-xs text-slate-500 font-medium">Compare wholesale Mandi prices (INR per Quintal), analyze transport margins, and set target rate warnings</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleOpenAlertModal} variant="outline" size="sm" className="h-9">
            <Bell size={14} className="mr-1.5 text-green-600" /> Set Price Alert
          </Button>
          <Button onClick={loadMarketData} variant="ghost" size="sm" className="h-9 px-3">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Filter Options bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-500">
          <div>
            <label className="block mb-1">Crop Filter</label>
            <Select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
              <option value="">All Crops</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Cotton">Cotton</option>
              <option value="Maize">Maize</option>
              <option value="Sugarcane">Sugarcane</option>
            </Select>
          </div>

          <div>
            <label className="block mb-1">District Lookup</label>
            <Input
              type="text"
              placeholder="e.g. Karnal"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div>
            <label className="block mb-1">Logistics Filter</label>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="price">Highest Mandi Price</option>
              <option value="profit">Highest Profit Margin</option>
              <option value="distance">Nearest Mandi (Distance)</option>
              <option value="transportCost">Lowest Transport Cost</option>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full text-[10px] text-slate-455 font-medium leading-none">
              Prices updated hourly matching regional board indices.
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Wholesale prices cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Coins size={16} className="text-slate-450" /> Mandi Trading Boards
            </h3>

            {processedPrices.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white text-xs text-slate-400">
                No matching wholesale mandis found for selected criteria.
              </Card>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {processedPrices.map(p => {
                  const isBest = Number(p.price) === highestPriceVal;
                  return (
                    <motion.div key={p.id} variants={itemVariants}>
                      <Card className="bg-white border border-slate-200 overflow-hidden hover-scale flex flex-col sm:flex-row justify-between items-stretch">
                        <div className="p-5 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-slate-850">{p.mandi_name}</h4>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">{p.crop_name}</span>
                            {isBest && (
                              <span className="text-[9px] px-2.5 py-0.5 rounded bg-green-50 text-green-700 font-black border border-green-200 flex items-center gap-0.5">
                                <Sparkles size={10} /> Best Price Tag
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500 border-t border-slate-50 pt-2.5">
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Distance</span>
                              <span className="text-slate-800 font-bold flex items-center gap-0.5 mt-0.5">
                                <MapPin size={12} className="text-red-500" /> {p.distance} km
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Transit Cost</span>
                              <span className="text-slate-800 font-bold flex items-center gap-0.5 mt-0.5">
                                <Truck size={12} className="text-slate-450" /> ₹{p.transitCost} / Qt
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Travel Time</span>
                              <span className="text-slate-800 font-bold flex items-center gap-0.5 mt-0.5">
                                <Clock size={12} className="text-slate-450" /> {p.travelTime} hrs
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase tracking-wider">Expected Profit</span>
                              <span className="text-green-600 font-black mt-0.5 block">
                                ₹{p.expectedProfit} / Qt
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price rate summary side panel */}
                        <div className="p-5 bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-100 flex sm:flex-col justify-between items-center sm:justify-center gap-4 shrink-0 min-w-[140px]">
                          <div className="text-center sm:text-right">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Mandi Price</span>
                            <span className="text-xl font-black text-slate-800">₹{p.price} <span className="text-[10px] font-normal text-slate-450">/ Qt</span></span>
                          </div>
                          
                          <Button 
                            onClick={() => handleOpenMandiMap(p.mandi_name)} 
                            size="sm" 
                            className="h-8 text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <Navigation size={10} /> View Route
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Price alerts sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xl">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Bell size={16} className="text-green-600 animate-swing" /> Active Target Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">No price alerts set. Receive dashboard flags when crops reach target prices.</p>
                ) : (
                  <div className="space-y-4">
                    {alerts.map(item => (
                      <div key={item.id} className="text-xs border-l-2 border-green-500 pl-3 py-1.5 space-y-1 text-left bg-slate-50 border-r border-y border-slate-100 rounded-r">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-855">{item.crop_name}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                            item.status === 'active' 
                              ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200' 
                              : 'bg-green-50 text-green-700 font-bold border border-green-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">Target Level: <span className="font-bold text-slate-800">₹{item.target_price}</span> / quintal</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green-50/20 border border-green-150 p-4 flex items-start gap-3 shadow-sm text-left">
              <AlertCircle className="text-green-600 mt-0.5 shrink-0" size={20} />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">Subsidies Notice</h4>
                <p className="text-xs text-green-700 leading-relaxed font-medium">
                  Contact your local block agriculture officer to verify government Minimum Support Price (MSP) bounds for wheat and paddy.
                </p>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* Set Alert Dialog */}
      <Dialog
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title="Set Price Alert Target"
      >
        <form onSubmit={handleSaveAlert} className="space-y-4 text-xs font-semibold text-slate-600">
          <Select
            label="Crop Name"
            value={alertCrop}
            onChange={(e) => setAlertCrop(e.target.value)}
          >
            <option value="Rice">Rice</option>
            <option value="Wheat">Wheat</option>
            <option value="Cotton">Cotton</option>
            <option value="Maize">Maize</option>
          </Select>

          <Input
            label="Target Sell Price (₹ per Quintal)"
            type="number"
            required
            placeholder="e.g. 2500"
            value={alertTargetPrice}
            onChange={(e) => setAlertTargetPrice(e.target.value)}
          />

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAlertModalOpen(false)}>Cancel</Button>
            <Button type="submit">Set Alert</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
