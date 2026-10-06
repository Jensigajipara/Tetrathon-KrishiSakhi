import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Dialog } from '../components/ui/dialog.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Calendar, Phone, MapPin, CheckCircle, 
  Loader2, Sparkles, BrainCircuit, ArrowRight, ClipboardList 
} from 'lucide-react';

export default function EquipmentRental() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [rentedList, setRentedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking Dialog state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [bookingDays, setBookingDays] = useState('3');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  // AI Advisor state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [targetCrop, setTargetCrop] = useState('Rice');
  const [farmSize, setFarmSize] = useState('5');
  const [operationStage, setOperationStage] = useState('Harvesting');

  const loadData = async () => {
    setLoading(true);
    try {
      const equipRes = await API.get('/equipment');
      setEquipmentList(equipRes.data);
      const rentedRes = await API.get('/equipment/rented');
      setRentedList(rentedRes.data);
    } catch (err) {
      setError('Could not retrieve rental catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBooking = (equip) => {
    setSelectedEquip(equip);
    setBookingDays('3');
    setBookingSuccess('');
    setError('');
    setBookModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedEquip) return;
    setBookingLoading(true);
    setBookingSuccess('');
    setError('');
    
    try {
      await API.post('/equipment/rent', {
        equipment_id: selectedEquip.id,
        duration_days: Number(bookingDays)
      });
      setBookingSuccess(`Successfully booked ${selectedEquip.name}! Check your rented list.`);
      setTimeout(() => {
        setBookModalOpen(false);
        loadData();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred booking equipment.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleGetAiAdvice = async () => {
    setAiLoading(true);
    setError('');
    try {
      const res = await API.get(`/advisor/equipment/recommend?cropName=${targetCrop}&farmSize=${farmSize}&stage=${operationStage}`);
      setAiAdvice(res.data);
    } catch (err) {
      setError('Failed to fetch AI equipment advice.');
    } finally {
      setAiLoading(false);
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
    <div className="space-y-6 font-sans text-left">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Post-Harvest Equipment Rental</h2>
        <p className="text-xs text-slate-500 font-medium">Rent harvesting and processing machinery from nearby cooperative centers</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* AI advisor widget */}
      <Card className="border border-green-200 bg-gradient-to-br from-green-50/40 to-emerald-50/20 overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-green-600 h-5 w-5" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Post-Harvest Equipment Advisor</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-500 block">Cultivated Crop</span>
              <select 
                value={targetCrop}
                onChange={(e) => setTargetCrop(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Cotton">Cotton</option>
                <option value="Maize">Maize</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-500 block">Farm Size (Acres)</span>
              <Input 
                type="number"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-500 block">Current Stage</span>
              <select 
                value={operationStage}
                onChange={(e) => setOperationStage(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="Harvesting">Harvesting</option>
                <option value="Threshing">Threshing</option>
                <option value="Drying">Drying</option>
                <option value="Land Preparation">Land Prep</option>
              </select>
            </div>
            <Button onClick={handleGetAiAdvice} disabled={aiLoading} className="h-10 w-full flex items-center justify-center gap-1.5">
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Consult AI
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {aiAdvice && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl bg-white border border-green-100 text-xs space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="text-amber-500" size={14} /> AI Recommendation: {aiAdvice.title}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700">{aiAdvice.confidence}% Match</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">{aiAdvice.recommendation}</p>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3">
                  <div>
                    <span className="block font-bold text-slate-455 uppercase tracking-wider text-[9px]">Suggested duration</span>
                    <span className="font-bold text-slate-800">{aiAdvice.expectedOutcome || '3 - 5 Days'}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-455 uppercase tracking-wider text-[9px]">Impact forecast</span>
                    <span className="font-bold text-green-600">Minimizes harvesting loss to &lt;2%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Main Listing Roster */}
      {loading ? (
        <div className="h-[30vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={28} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left catalog */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench size={16} className="text-slate-450" /> Available Machinery For Rent
            </h3>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid sm:grid-cols-2 gap-4"
            >
              {equipmentList.map(item => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Card className="bg-white border border-slate-200 overflow-hidden hover-scale flex flex-col justify-between h-full">
                    <div>
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="h-40 w-full object-cover border-b border-slate-100" 
                        />
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-850 text-base">{item.name}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                            item.availability 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {item.availability ? 'Available' : 'Booked'}
                          </span>
                        </div>
                        
                        <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{item.nearby_rental_center}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400" />
                            <span>{item.contact}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-50 bg-slate-50/40 flex justify-between items-center">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Rental Price</span>
                        <span className="text-base font-black text-slate-800">₹{item.rental_cost} <span className="text-xs font-normal text-slate-450">/ day</span></span>
                      </div>
                      <Button 
                        onClick={() => handleOpenBooking(item)} 
                        disabled={!item.availability} 
                        size="sm"
                      >
                        Book Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right sidebar rented items */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList size={16} className="text-slate-450" /> My Booked Equipment
            </h3>
            <Card className="bg-white border border-slate-200 shadow-sm p-4">
              {rentedList.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">No tools rented yet. Click Book Now to reserve post-harvest equipment.</p>
              ) : (
                <div className="space-y-4">
                  {rentedList.map(item => (
                    <div key={item.id} className="text-xs border-l-2 border-green-500 pl-3 py-1.5 space-y-1.5 text-left bg-slate-50 border-r border-y border-slate-100 rounded-r">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-800">{item.equipment_name}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold border border-green-200">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-455 leading-relaxed">
                        Booked: {new Date(item.rental_date).toLocaleDateString()} for <span className="font-semibold text-slate-700">{item.duration_days} Days</span>
                      </p>
                      <p className="font-bold text-slate-700">Cost: ₹{item.rental_cost * item.duration_days}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title={selectedEquip ? `Reserve ${selectedEquip.name}` : 'Book Equipment'}
      >
        {bookingSuccess && <Alert variant="success">{bookingSuccess}</Alert>}
        
        <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs font-medium text-slate-600">
          {selectedEquip && (
            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span>Equipment:</span>
                <span className="font-bold text-slate-850">{selectedEquip.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Subsidized Rate:</span>
                <span className="font-bold text-slate-850">₹{selectedEquip.rental_cost} / day</span>
              </div>
              <div className="flex justify-between">
                <span>Cooperative Center:</span>
                <span className="font-semibold">{selectedEquip.nearby_rental_center}</span>
              </div>
            </div>
          )}

          <Input
            label="Duration of Rental (Days)"
            type="number"
            min="1"
            max="30"
            required
            value={bookingDays}
            onChange={(e) => setBookingDays(e.target.value)}
          />

          {selectedEquip && bookingDays && (
            <div className="text-right font-black text-sm text-slate-800">
              Total Estimated Cost: ₹{selectedEquip.rental_cost * Number(bookingDays)}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setBookModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={bookingLoading} className="flex items-center gap-1">
              {bookingLoading && <Loader2 size={12} className="animate-spin" />} Confirm Rental
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
