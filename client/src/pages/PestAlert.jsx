import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Select } from '../components/ui/select.jsx';
import { Button } from '../components/ui/button.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion } from 'framer-motion';
import { Bug, ShieldCheck, ShieldAlert, Heart, Loader2, AlertTriangle, Shield, CheckCircle, RefreshCw } from 'lucide-react';

export default function PestAlert() {
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [pestAlerts, setPestAlerts] = useState([]);
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
      setError('Could not retrieve active crops.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async (cropId) => {
    if (!cropId) return;
    setAlertsLoading(true);
    setError('');
    try {
      const res = await API.get(`/advisor/pest/${cropId}`);
      setPestAlerts(res.data);
    } catch (err) {
      setError('Failed to load pest danger forecasts.');
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (selectedCropId) {
      fetchAlerts(selectedCropId);
    }
  }, [selectedCropId]);

  const getRiskStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Regional Pest Risk Monitors</h2>
          <p className="text-xs text-slate-500 font-medium">Preventative alerts and chemical treatments generated from geographical crop surveys</p>
        </div>
        {selectedCropId && (
          <Button 
            onClick={() => fetchAlerts(selectedCropId)} 
            disabled={alertsLoading}
            variant="outline" 
            size="sm" 
            className="h-9"
          >
            <RefreshCw size={14} className={`mr-1.5 ${alertsLoading ? 'animate-spin' : ''}`} /> Scan Region
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : crops.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white">
          <div className="max-w-md mx-auto space-y-4 py-6">
            <Bug className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Active Crops Found</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Pest warnings are calculated based on registered active crops. sow a crop in your tracker to check pest forecasts.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/crops'}>Register Active Crop</Button>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          {/* Crop Selector & Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-4 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Crop Select</span>
              <Select
                className="mt-1"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
              >
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.crop_name} (ID: {c.id})</option>
                ))}
              </Select>
            </Card>

            <Card className="bg-amber-50/20 border border-amber-150 p-4 flex items-start gap-3 shadow-sm text-left">
              <ShieldAlert className="text-amber-500 mt-0.5 shrink-0" size={20} />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Integrated Management</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Prioritize biological remedies (Neem Oil, yellow traps, pheromone traps) before employing heavy chemical spray pesticides.
                </p>
              </div>
            </Card>

            {/* Risk indicators explanation */}
            <Card className="p-5 bg-white border border-slate-200 shadow-sm text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geographic Threat Scales</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">High Risk (Severe outbreaks):</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-100">Immediate Spray</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Medium Risk (Incidental counts):</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">Weekly Scouting</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Low Risk (Under control):</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-100">Normal Monitor</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Pest alert list */}
          <div className="lg:col-span-2">
            {alertsLoading ? (
              <div className="h-[30vh] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                <Loader2 className="animate-spin text-green-600" size={28} />
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Bug size={18} className="text-green-600" /> Active Insect & Pest Warnings
                </h3>

                {pestAlerts.length === 0 ? (
                  <Card className="p-6 text-center border border-slate-100 bg-white">
                    <Heart className="h-10 w-10 text-green-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold mt-2">No pest outbreaks reported in your area. Crop health looks great!</p>
                  </Card>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    {pestAlerts.map((item, idx) => {
                      const isHighRisk = item.risk_level?.toLowerCase() === 'high';
                      return (
                        <motion.div key={idx} variants={itemVariants}>
                          <Card className="border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-50">
                              <div className="flex items-center gap-2">
                                <Bug className="text-slate-400" size={18} />
                                <h4 className="text-base font-bold text-slate-850">{item.pest_name}</h4>
                              </div>
                              <span className={`text-[10px] uppercase font-bold tracking-wide border px-2.5 py-0.5 rounded-full ${getRiskStyle(item.risk_level)}`}>
                                {item.risk_level} Risk Scale
                              </span>
                            </div>

                            <div className="p-5 text-left space-y-4">
                              {/* Urgency callout */}
                              <div className={`p-4 rounded-xl border text-xs flex gap-3 items-start ${
                                isHighRisk 
                                  ? 'bg-red-50/30 border-red-100 text-red-800' 
                                  : 'bg-green-50/20 border-green-100 text-slate-700'
                              }`}>
                                {isHighRisk ? <AlertTriangle className="text-red-500 shrink-0" size={16} /> : <Shield className="text-green-600 shrink-0" size={16} />}
                                <div className="space-y-1">
                                  <h5 className="font-bold uppercase tracking-wider text-[10px]">
                                    {isHighRisk ? 'Immediate Preventative Spray Action Required' : 'Biological Control Actions Sufficient'}
                                  </h5>
                                  <p className="leading-relaxed font-medium">
                                    {isHighRisk 
                                      ? 'Outbreaks have been mapped in regional buffer districts. Monitor crop foliage morning and evening.'
                                      : 'Field pest counts are below economical threshold limits. Spray only if threshold index exceeds 5%.'}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-1 pt-1">
                                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                                  <ShieldCheck size={14} className="text-green-600" /> Prescribed Treatment Formula
                                </h5>
                                <p className="text-xs text-slate-600 leading-relaxed pl-5 font-medium">
                                  {item.recommendation}
                                </p>
                              </div>

                              {/* Biological vs Chemical side by side */}
                              <div className="grid sm:grid-cols-2 gap-4 text-xs pt-2">
                                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-1">
                                  <span className="font-bold text-green-700 block">🌱 Organic Solution:</span>
                                  <p className="text-slate-500">Apply Neem Oil extract @ 1500 ppm or release local ladybug predators.</p>
                                </div>
                                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-1">
                                  <span className="font-bold text-red-700 block">🧪 Chemical Option (Outbreaks):</span>
                                  <p className="text-slate-500">Deploy need-based chemical sprays matching dosage instructions.</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
