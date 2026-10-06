import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../context/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Select } from '../components/ui/select.jsx';
import { Button } from '../components/ui/button.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { 
  Upload, ScanLine, AlertTriangle, ShieldCheck, History, 
  Loader2, Sparkles, MapPin, Eye, Compass, Heart, HelpCircle 
} from 'lucide-react';

export default function DiseaseDetection() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  
  // Tab for Treatment selection
  const [treatmentTab, setTreatmentTab] = useState('desi');

  const fetchHistory = async () => {
    try {
      const res = await API.get('/advisor/disease/history');
      setHistory(res.data);
    } catch (err) {
      console.warn('History pull error:', err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setPrediction(null);
    setError('');
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please select or drop a leaf image to scan.');
      return;
    }
    setError('');
    setScanning(true);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const res = await API.post('/advisor/disease/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrediction(res.data);
      if (res.data.image_data) {
        setImagePreview(res.data.image_data);
      }
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during AI diagnostic scan.');
    } finally {
      setScanning(false);
    }
  };

  const handleLoadHistoryItem = (item) => {
    setPrediction(item);
    if (item.image_data) {
      setImagePreview(item.image_data);
    } else if (item.image_url) {
      setImagePreview(`${API.defaults.baseURL.replace('/api', '')}${item.image_url}`);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchHistory().finally(() => setLoading(false));
  }, []);

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-400';
    }
  };

  const selectedCrop = crops.find(c => c.id === Number(selectedCropId));
  const selectedFarm = selectedCrop ? farms.find(f => f.id === selectedCrop.farm_id) : null;

  const handleViewMaps = () => {
    if (selectedFarm && selectedFarm.latitude && selectedFarm.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=pesticide+fertilizer+shop&query_place_id=pesticide_shop&location=${selectedFarm.latitude},${selectedFarm.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=pesticide+fertilizer+shop+near+me`, '_blank');
    }
  };

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

  return (
    <div className="space-y-6 text-left font-sans">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Disease & Pest Scanner</h2>
        <p className="text-xs text-slate-500">Upload a photograph of infected leaves to detect crop pathology and get treatment recommendations</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Scan Input panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upload Crop Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleScan} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-200 hover:border-green-500 transition rounded-xl relative h-48 flex items-center justify-center bg-slate-50/50 overflow-hidden group">
                      {imagePreview ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                          <img src={imagePreview} alt="Leaf Preview" className="h-full w-full object-contain" />
                          <label className="absolute bottom-2 right-2 cursor-pointer bg-white/80 hover:bg-white text-slate-800 px-3 py-1 rounded text-xs font-bold shadow-sm transition">
                            Change
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                        </div>
                      ) : (
                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center space-y-2 p-6 text-center text-xs text-slate-400 font-medium">
                          <Upload className="h-8 w-8 text-slate-350 group-hover:text-green-500 transition" />
                          <span>Drag leaf photo here, or click to browse</span>
                          <span className="text-[10px] text-slate-300">Supports PNG, JPG, JPEG</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={scanning || !imageFile}
                      className="w-full flex items-center justify-center gap-1.5 h-10 font-bold text-xs"
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="animate-spin" size={14} /> Diagnostic Scan Executing...
                        </>
                      ) : (
                        <>
                          <ScanLine size={14} /> Execute Leaf Scan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

          {/* Right AI Diagnostics Report */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {scanning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-64 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3"
                >
                  <Loader2 className="animate-spin text-green-600" size={36} />
                  <p className="text-xs text-slate-500 font-medium animate-pulse">Scanning leaf cell structure. Analyzing pathogen pattern maps...</p>
                </motion.div>
              )}

              {prediction && !scanning && (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {/* Top Summary Card / Invalid Image Card */}
                  <motion.div variants={itemVariants}>
                    {prediction.isValidImage === false ? (
                      <Card className="bg-red-50 border border-red-200 overflow-hidden shadow-sm p-6 text-left space-y-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-6 w-6 shrink-0" />
                          <h3 className="text-base font-bold">Invalid Image Uploaded</h3>
                        </div>
                        <p className="text-xs text-red-900 leading-relaxed font-semibold">
                          ⚠️ {prediction.recommendation || "This photo is not about a crop. Please upload a correct crop or leaf photo."}
                        </p>
                        <p className="text-[11px] text-red-650 font-medium">
                          {prediction.reasoning}
                        </p>
                      </Card>
                    ) : (
                      <Card className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block">Scan inference ready</span>
                              <h3 className="text-xl font-black text-slate-850 tracking-tight mt-1">{prediction.disease_name || prediction.title}</h3>
                            </div>
                            
                            <div className="flex gap-2">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded border font-bold uppercase tracking-wide ${getSeverityStyle(prediction.severity || prediction.riskLevel)}`}>
                                Severity: {prediction.severity || prediction.riskLevel}
                              </span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 font-bold">
                                {prediction.confidence}% Confidence
                              </span>
                            </div>
                          </div>

                          {/* Severity Visual indicator */}
                          <div className="space-y-1.5 text-xs font-semibold text-slate-500">
                            <div className="flex justify-between">
                              <span>Threat Severity Index</span>
                              <span className="font-bold text-slate-700">{prediction.severity || prediction.riskLevel}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${getSeverityColor(prediction.severity || prediction.riskLevel)}`}
                                style={{ width: (prediction.severity || prediction.riskLevel)?.toLowerCase() === 'high' ? '90%' : (prediction.severity || prediction.riskLevel)?.toLowerCase() === 'medium' ? '55%' : '25%' }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </motion.div>

                  {prediction.isValidImage !== false && (
                    <>
                      {/* Scientific Details & Treatments */}
                      <motion.div variants={itemVariants}>
                        <Card className="bg-white border border-slate-200 shadow-sm">
                          <div className="p-6 space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                              <Sparkles className="text-green-600" size={16} /> Precision Treatment Action Plan
                            </h4>

                            {/* Tabs for Treatment */}
                            <div className="flex border-b border-slate-200 text-xs">
                              {prediction.desiNuska ? (
                                [
                                  { id: 'desi', label: 'Desi Nuska (Traditional)', icon: Heart },
                                  { id: 'organic', label: 'Organic Treatment', icon: Compass },
                                  { id: 'chemical', label: 'Chemical Prescription', icon: AlertTriangle }
                                ].map(sub => (
                                  <button
                                    type="button"
                                    key={sub.id}
                                    onClick={() => setTreatmentTab(sub.id)}
                                    className={`px-3 py-2 border-b-2 font-bold cursor-pointer flex items-center gap-1 transition ${
                                      treatmentTab === sub.id 
                                        ? 'border-green-600 text-green-700 font-extrabold' 
                                        : 'border-transparent text-slate-455 hover:text-slate-700'
                                    }`}
                                  >
                                    <sub.icon size={13} /> {sub.label}
                                  </button>
                                ))
                              ) : (
                                <span className="px-3 py-2 border-b-2 border-green-600 text-green-700 font-extrabold flex items-center gap-1">
                                  <Sparkles size={13} /> Diagnosed Treatment Plan
                                </span>
                              )}
                            </div>

                            <div className="py-2 text-xs leading-relaxed text-slate-655 font-medium text-left">
                              {prediction.desiNuska ? (
                                <>
                                  {treatmentTab === 'desi' && (
                                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <h5 className="font-bold text-slate-800 text-xs">Traditional Indian Home Remedies</h5>
                                      <p>{prediction.desiNuska}</p>
                                    </div>
                                  )}

                                  {treatmentTab === 'organic' && (
                                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <h5 className="font-bold text-slate-800 text-xs">Organic & Biological Control</h5>
                                      <p>{prediction.organicTreatment}</p>
                                    </div>
                                  )}

                                  {treatmentTab === 'chemical' && (
                                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <h5 className="font-bold text-slate-800 text-xs">Targeted Chemical Treatment</h5>
                                      <p>{prediction.chemicalTreatment}</p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                  <h5 className="font-bold text-slate-800 text-xs">AI Diagnostic Advice</h5>
                                  <p>{prediction.treatment}</p>
                                </div>
                              )}
                            </div>

                            {/* Warnings, Dos and Donts, timelines */}
                            {prediction.desiNuska && (
                              <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                                <div className="space-y-2">
                                  <span className="block font-bold text-slate-455 uppercase tracking-wider text-[9px]">Recovery Timeline</span>
                                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-150 inline-block">
                                    {prediction.recoveryTimeline || '10 - 14 Days'}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="block font-bold text-slate-455 uppercase tracking-wider text-[9px]">Do's and Don'ts</span>
                                  <p className="text-slate-550 leading-relaxed font-medium text-[11px]">{prediction.dosAndDonts || 'Do: Remove and burn heavily infected leaves. Don\'t: Sprinkle water overhead as moisture spreads fungal spores.'}</p>
                                </div>
                              </div>
                            )}

                            {/* Prevention checklist */}
                            {prediction.preventionChecklist && prediction.preventionChecklist.length > 0 && (
                              <div className="space-y-2 pt-3 border-t border-slate-100">
                                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px]">Prevention Steps</span>
                                <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-slate-655 font-medium">
                                  {prediction.preventionChecklist.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                      <ShieldCheck className="text-green-500 shrink-0" size={14} />
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>

                      {/* Maps integration card */}
                      <motion.div variants={itemVariants}>
                        <Card className="bg-slate-900 border border-slate-800 text-white shadow-sm overflow-hidden">
                          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1 text-left">
                              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                                <MapPin size={16} className="text-red-500" /> Need Supplies? Locate Pesticide Stores
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium">
                                Find nearby certified agri-dealers to purchase chemical or organic treatment inputs.
                              </p>
                            </div>
                            <Button onClick={handleViewMaps} className="bg-green-600 hover:bg-green-700 text-white border-0 text-xs font-bold">
                              Search Shops On Map
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}

              {!prediction && !scanning && (
                <div className="h-64 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-sm shadow-sm">
                  Please upload a photo and click Scan to run diagnostic evaluation.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Diagnosis History Logs Timeline */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 mb-4">
              <History className="text-green-600 h-5 w-5" /> Detailed Diagnostic Scan History Logs
            </h3>
            
            {history.length === 0 ? (
              <Card className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs text-slate-400 font-medium italic">No previous scan history. Upload an image to trigger a scan.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(item => (
                  <Card 
                    key={item.id} 
                    onClick={() => handleLoadHistoryItem(item)}
                    className="cursor-pointer bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-green-500 hover:shadow-md transition group text-left"
                  >
                    <div className="relative h-40 bg-slate-150 flex items-center justify-center overflow-hidden">
                      {item.image_data ? (
                        <img src={item.image_data} alt={item.disease_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : item.image_url ? (
                        <img src={`${API.defaults.baseURL.replace('/api', '')}${item.image_url}`} alt={item.disease_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <ScanLine className="h-8 w-8 text-slate-300" />
                      )}
                      
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black uppercase tracking-wider ${getSeverityStyle(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 font-black">
                          {item.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-xs text-slate-800 group-hover:text-green-700 transition truncate">{item.disease_name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{new Date(item.uploaded_at || item.created_at).toLocaleString()}</p>
                        <p className="text-[11px] text-slate-550 leading-relaxed font-semibold mt-2 line-clamp-3">
                          {item.treatment}
                        </p>
                      </div>
                      
                      <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 hover:bg-green-50 hover:text-green-800 text-[10px] font-bold text-slate-500 rounded-lg transition border border-slate-200/50">
                        <Eye size={12} /> Reload Analysis
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
