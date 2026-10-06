import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Select } from '../components/ui/select.jsx';
import { Input } from '../components/ui/input.jsx';
import { Button } from '../components/ui/button.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Truck, Warehouse, CheckCircle2, ArrowRight, Loader2, Sparkles, Scale, Info } from 'lucide-react';

export default function TransportDecision() {
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [localMandi, setLocalMandi] = useState('Karnal Mandi');
  
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState('');

  const loadCrops = async () => {
    setLoading(true);
    try {
      const res = await API.get('/crops');
      const active = res.data.filter(c => c.status === 'active');
      setCrops(active);
      if (active.length > 0) {
        setSelectedCropId(active[0].id);
      }
    } catch (err) {
      setError('Could not retrieve active crop list.');
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    if (!selectedCropId) return;
    setOptimizing(true);
    setError('');
    try {
      const res = await API.get(`/market/decision/${selectedCropId}?quantity=${quantity}&localMandi=${localMandi}`);
      setDecision(res.data);
    } catch (err) {
      setError('Error running post-harvest decision solver.');
    } finally {
      setOptimizing(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (selectedCropId) {
      runOptimization();
    }
  }, [selectedCropId]);

  // Animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Post-Harvest Decision Optimization</h2>
        <p className="text-xs text-slate-500 font-medium">Compare financial margins across immediate local sales, regional freight logistics, and cold storage</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : crops.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white">
          <div className="max-w-md mx-auto space-y-4 py-6">
            <Coins className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Active Crops Found</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Post-harvest planning matches your registered crops with Mandi price indicators. sow a crop to enable calculators.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/crops'}>Register Crop</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          
          {/* Inputs Panel */}
          <Card className="p-6 grid sm:grid-cols-3 gap-4 items-end bg-white border border-slate-200 shadow-sm">
            <Select
              label="Crop to Evaluate"
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
            >
              {crops.map(c => (
                <option key={c.id} value={c.id}>{c.crop_name} (ID: {c.id})</option>
              ))}
            </Select>

            <Input
              label="Volume (Quintals)"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <Button onClick={runOptimization} loading={optimizing} className="w-full h-10">
              Run Optimization Engine
            </Button>
          </Card>

          {optimizing ? (
            <div className="h-[40vh] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
              <Loader2 className="animate-spin text-green-600" size={28} />
            </div>
          ) : decision ? (
            <div className="space-y-6">
              
              {/* Output decision card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 80 }}
              >
                <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md relative overflow-hidden">
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <h3 className="text-lg font-extrabold flex items-center gap-1.5">
                        <CheckCircle2 size={20} /> Optimization Recommendation
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded">
                        Confidence: {decision.confidenceScore || 85}%
                      </span>
                    </div>
                    <h4 className="text-xl md:text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                      RECOMMENDED ACTION: <span className="text-lime-300 underline">{decision.recommendation}</span>
                    </h4>
                    <p className="text-xs md:text-sm leading-relaxed text-slate-100 max-w-4xl font-medium">
                      {decision.explanation}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Comparative options details */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid md:grid-cols-3 gap-6"
              >
                
                {/* Option A: SELL NOW */}
                <motion.div variants={itemVariants} className="h-full">
                  <Card className={`bg-white border hover-scale flex flex-col justify-between h-full relative ${
                    decision.recommendation?.toLowerCase() === 'sell' 
                      ? 'border-green-400 ring-2 ring-green-100 shadow-lg' 
                      : 'border-slate-200 shadow-sm'
                  }`}>
                    {decision.recommendation?.toLowerCase() === 'sell' && (
                      <span className="absolute top-0 right-0 text-[8px] font-black uppercase tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-bl">AI Recommended</span>
                    )}
                    <CardHeader className="pb-3 border-b border-slate-50 flex items-center justify-between flex-row">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">SELL NOW</CardTitle>
                        <CardDescription className="text-xs">Immediate local Mandi sale</CardDescription>
                      </div>
                      <Coins className="text-slate-400 shrink-0" size={18} />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Local price index:</span>
                          <span className="font-bold text-slate-700">₹{decision.localPrice}/qt</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Freight Transport:</span>
                          <span className="font-bold text-slate-700">₹0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Storage rent:</span>
                          <span className="font-bold text-slate-700">₹0.00</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black">
                          <span className="text-slate-850">Net Profit:</span>
                          <span className="text-green-600">₹{decision.breakdown.sell.profit.toFixed(0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Option B: STORE & SELL */}
                <motion.div variants={itemVariants} className="h-full">
                  <Card className={`bg-white border hover-scale flex flex-col justify-between h-full relative ${
                    decision.recommendation?.toLowerCase() === 'store' 
                      ? 'border-green-400 ring-2 ring-green-100 shadow-lg' 
                      : 'border-slate-200 shadow-sm'
                  }`}>
                    {decision.recommendation?.toLowerCase() === 'store' && (
                      <span className="absolute top-0 right-0 text-[8px] font-black uppercase tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-bl">AI Recommended</span>
                    )}
                    <CardHeader className="pb-3 border-b border-slate-50 flex items-center justify-between flex-row">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">STORE & HOLD</CardTitle>
                        <CardDescription className="text-xs">3 Months storage holding</CardDescription>
                      </div>
                      <Warehouse className="text-slate-400 shrink-0" size={18} />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Structure:</span>
                          <span className="font-bold text-slate-700">{decision.breakdown.store.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Storage Rent:</span>
                          <span className="font-bold text-slate-700">₹{decision.breakdown.store.cost.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Decay Loss ({(decision.breakdown.store.spoilageRate * 100).toFixed(0)}%):</span>
                          <span className="font-bold text-red-500">-₹{decision.breakdown.store.spoilageLoss.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black">
                          <span className="text-slate-850">Net Profit:</span>
                          <span className="text-green-600">₹{decision.breakdown.store.profit.toFixed(0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Option C: TRANSPORT */}
                <motion.div variants={itemVariants} className="h-full">
                  <Card className={`bg-white border hover-scale flex flex-col justify-between h-full relative ${
                    decision.recommendation?.toLowerCase() === 'transport' 
                      ? 'border-green-400 ring-2 ring-green-100 shadow-lg' 
                      : 'border-slate-200 shadow-sm'
                  }`}>
                    {decision.recommendation?.toLowerCase() === 'transport' && (
                      <span className="absolute top-0 right-0 text-[8px] font-black uppercase tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-bl">AI Recommended</span>
                    )}
                    <CardHeader className="pb-3 border-b border-slate-50 flex items-center justify-between flex-row">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">TRANSPORT OUT</CardTitle>
                        <CardDescription className="text-xs">Regional hub shipment</CardDescription>
                      </div>
                      <Truck className="text-slate-400 shrink-0" size={18} />
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {decision.breakdown.transport ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Target Hub:</span>
                            <span className="font-bold text-slate-800">{decision.breakdown.transport.mandiName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Mandi Price:</span>
                            <span className="font-bold text-slate-700">₹{decision.breakdown.transport.price}/qt</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Haulage Freight:</span>
                            <span className="font-bold text-red-500">-₹{decision.breakdown.transport.cost.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black">
                            <span className="text-slate-850">Net Profit:</span>
                            <span className="text-green-600">₹{decision.breakdown.transport.profit.toFixed(0)}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-6">No regional hubs found for comparisons.</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

              </motion.div>

              {/* Economic Scale indicators */}
              <Card className="p-6 bg-slate-50 border border-slate-200 text-left flex items-start gap-3 shadow-sm">
                <Info size={20} className="text-slate-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transport haulage note</h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Transportation calculations assume full truckload carriage contracts at standard rates of ₹2.5 per quintal per kilometer. Surcharges apply if hauling sub-tonnage capacities.
                  </p>
                </div>
              </Card>

            </div>
          ) : null}

        </div>
      )}
    </div>
  );
}
