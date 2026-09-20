import React, { useState } from 'react';
import { 
  Car, 
  Bike, 
  Check, 
  MapPin, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Tag, 
  Droplet, 
  Smartphone,
  CheckCircle2,
  Wallet as WalletIcon
} from 'lucide-react';
import { Vehicle, ServiceTier, ServiceZone, Booking, Coupon } from '../types';
import confetti from 'canvas-confetti';

interface BookingWizardProps {
  vehicles: Vehicle[];
  serviceTiers: ServiceTier[];
  zones: ServiceZone[];
  coupons: Coupon[];
  walletBalance: number;
  onBookingCreated: (booking: Booking, paymentMethod: 'upi' | 'card' | 'wallet') => void;
  onAddNewVehicle: (v: Omit<Vehicle, 'id' | 'userId'>) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  vehicles,
  serviceTiers,
  zones,
  coupons,
  walletBalance,
  onBookingCreated,
  onAddNewVehicle,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [addressDetails, setAddressDetails] = useState({
    area: '12th Main Road, Indiranagar',
    pin: '560038',
    landmark: 'Opposite Corner House',
    label: 'Home Doorstep',
  });
  const [slotType, setSlotType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledTime, setScheduledTime] = useState('Today, 4:00 PM - 5:00 PM');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet' | 'card'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  // New vehicle modal form
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({
    type: 'car' as 'car' | 'bike',
    make: '',
    model: '',
    plateNumber: '',
    color: '',
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Filter service tiers according to the selected vehicle type
  const availableServices = serviceTiers.filter(
    (s) => s.vehicleType === (selectedVehicle?.type || 'car')
  );

  // Auto select first matching service tier if none selected
  const activeServiceTier = availableServices.find((s) => s.id === selectedServiceId) || availableServices[0];

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Dynamic Pricing Calculation
  const basePrice = activeServiceTier?.basePrice || 499;
  const zoneMultiplier = selectedZone?.surgeMultiplier || 1.0;
  const demandSurge = selectedZone?.activeDemands > 20 ? 60 : 0;
  const weatherSurge = 0; // standard weather

  const subtotalBeforeDiscount = Math.round(basePrice * zoneMultiplier) + demandSurge + weatherSurge;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = Math.min(
      appliedCoupon.maxDiscount,
      Math.round((subtotalBeforeDiscount * appliedCoupon.discountPct) / 100)
    );
  }

  const taxableAmount = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const gstTax = Math.round(taxableAmount * 0.18);
  const finalTotal = taxableAmount + gstTax;

  const handleApplyCoupon = () => {
    setCouponError('');
    const found = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
    if (!found) {
      setCouponError('Invalid or expired coupon code.');
      return;
    }
    if (subtotalBeforeDiscount < found.minBooking) {
      setCouponError(`Min booking ₹${found.minBooking} required for this coupon.`);
      return;
    }
    setAppliedCoupon(found);
  };

  const handleCreateVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleData.make || !newVehicleData.model || !newVehicleData.plateNumber) return;
    onAddNewVehicle({
      type: newVehicleData.type,
      make: newVehicleData.make,
      model: newVehicleData.model,
      plateNumber: newVehicleData.plateNumber.toUpperCase(),
      color: newVehicleData.color || 'Silver',
      photoUrl: newVehicleData.type === 'car' 
        ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    });
    setShowAddVehicleModal(false);
    setNewVehicleData({ type: 'car', make: '', model: '', plateNumber: '', color: '' });
  };

  const handleConfirmAndPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newBookingId = `SG-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;

      const newBooking: Booking = {
        id: newBookingId,
        customerId: 'user_satyam',
        customerName: 'Satyam Sharma',
        customerPhone: '+91 98765 43210',
        technicianId: 'tech_ramesh_1',
        technicianName: 'Ramesh Kumar',
        technicianPhone: '+91 98450 12839',
        technicianRating: 4.92,
        technicianPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        vehicle: selectedVehicle,
        service: activeServiceTier,
        status: 'en_route',
        scheduledAt: slotType === 'instant' ? 'Instant Dispatch (18 mins ETA)' : scheduledTime,
        address: {
          label: addressDetails.label,
          area: addressDetails.area,
          city: selectedZone.city,
          pin: addressDetails.pin,
          lat: selectedZone.centerLat,
          lng: selectedZone.centerLng,
          landmark: addressDetails.landmark,
        },
        pricing: {
          basePrice,
          surgeAmount: demandSurge,
          weatherSurge,
          zoneMultiplier,
          tax: gstTax,
          total: finalTotal,
          currency: 'INR',
          demandLevel: demandSurge > 0 ? 'HIGH_DEMAND' : 'NORMAL',
          isRainSurge: false,
          appliedCoupon: appliedCoupon?.code,
          couponDiscount: discountAmount,
        },
        payment: {
          method: paymentMethod,
          status: 'paid',
          gatewayRef: `pay_rzp_${Math.random().toString(36).substring(2, 12)}`,
          upiId: paymentMethod === 'upi' ? `satyam@${selectedUpiApp}` : undefined,
        },
        technicianLocation: {
          lat: selectedZone.centerLat - 0.003,
          lng: selectedZone.centerLng - 0.002,
          heading: 50,
          speedKmH: 24,
          lastUpdated: 'Just now',
        },
        timeline: [
          {
            id: `evt_req_${Date.now()}`,
            bookingId: newBookingId,
            status: 'requested',
            actor: 'customer',
            timestamp: 'Just now',
            note: 'Doorstep wash requested and paid via Razorpay UPI',
          },
          {
            id: `evt_asg_${Date.now()}`,
            bookingId: newBookingId,
            status: 'assigned',
            actor: 'system',
            timestamp: 'Just now',
            note: 'Ramesh Kumar (Van #04, 140 Bar High-Pressure Rig) assigned',
          },
          {
            id: `evt_enr_${Date.now()}`,
            bookingId: newBookingId,
            status: 'en_route',
            actor: 'technician',
            timestamp: 'Just now',
            note: 'Technician departed Domlur Hub; navigating to customer pin',
          },
        ],
      };

      setIsProcessing(false);
      confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
      onBookingCreated(newBooking, paymentMethod);
    }, 1200);
  };

  return (
    <div id="booking-wizard-card" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Progress Steps Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { num: 1, label: 'Vehicle' },
            { num: 2, label: 'Service' },
            { num: 3, label: 'Slot & Spot' },
            { num: 4, label: 'Pay & Confirm' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-200'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  step === s.num ? 'text-slate-900 font-bold' : 'text-slate-500'
                }`}
              >
                {s.label}
              </span>
              {s.num < 4 && <div className="w-6 sm:w-12 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Vehicle Selection */}
      {step === 1 && (
        <div className="p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Vehicle from Garage</h3>
              <p className="text-xs text-slate-500">Pick which car or motorcycle you'd like washed today</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1 transition-colors border border-cyan-200"
            >
              <Plus size={14} />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {vehicles.map((veh) => {
              const isSelected = veh.id === (selectedVehicle?.id || vehicles[0].id);
              return (
                <div
                  key={veh.id}
                  onClick={() => {
                    setSelectedVehicleId(veh.id);
                    // Reset selected service so it matches vehicle type
                    const firstMatching = serviceTiers.find((s) => s.vehicleType === veh.type);
                    if (firstMatching) setSelectedServiceId(firstMatching.id);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'border-cyan-600 bg-cyan-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                    {veh.photoUrl ? (
                      <img src={veh.photoUrl} alt={veh.model} className="h-full w-full object-cover" />
                    ) : veh.type === 'car' ? (
                      <Car size={22} className="text-slate-600" />
                    ) : (
                      <Bike size={22} className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {veh.make} {veh.model}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {veh.type}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-semibold text-slate-600 mt-0.5">{veh.plateNumber}</p>
                    <span className="text-[11px] text-slate-500">{veh.color}</span>
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Continue to Service Tiers</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Service Tiers */}
      {step === 2 && (
        <div className="p-5 sm:p-7 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Choose Wash & Detail Tier for {selectedVehicle?.make} {selectedVehicle?.model}
            </h3>
            <p className="text-xs text-slate-500">
              All tiers use 100% eco-friendly biodegradable foam and our silent high-pressure battery rigs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableServices.map((tier) => {
              const isSelected = tier.id === activeServiceTier?.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedServiceId(tier.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-600 bg-cyan-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{tier.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{tier.tagline}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-slate-900">₹{tier.basePrice}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">~{tier.durationMin} mins</span>
                      </div>
                    </div>

                    <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
                      {tier.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Check size={12} className="text-cyan-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Droplet size={12} className="text-emerald-500" />
                      Saves {tier.ecoMetrics.waterSavedLiters}L groundwater
                    </span>
                    {isSelected && (
                      <span className="text-cyan-700 font-bold flex items-center gap-1">
                        Selected <Check size={13} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Set Doorstep Location</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Location & Time Slot */}
      {step === 3 && (
        <div className="p-5 sm:p-7 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Doorstep Location & Schedule</h3>
            <p className="text-xs text-slate-500">
              Select your service zone and delivery window
            </p>
          </div>

          {/* Zone Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Service Zone (PostGIS Geofenced Polygon)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedZoneId === zone.id
                      ? 'border-cyan-600 bg-cyan-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className={selectedZoneId === zone.id ? 'text-cyan-600' : 'text-slate-400'} />
                    <div>
                      <span className="text-xs font-bold text-slate-900">{zone.name}</span>
                      <span className="text-[11px] text-slate-500 block">{zone.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-700">
                      {zone.surgeMultiplier > 1.0 ? `${zone.surgeMultiplier}x Surge` : 'Standard Rate'}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">{zone.techniciansOnline} rigs online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address Details Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address / Villa Number</label>
              <input
                type="text"
                value={addressDetails.area}
                onChange={(e) => setAddressDetails({ ...addressDetails, area: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Landmark / Parking Spot</label>
              <input
                type="text"
                value={addressDetails.landmark}
                onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Dispatch Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSlotType('instant')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  slotType === 'instant' ? 'border-cyan-600 bg-cyan-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock size={14} className="text-cyan-600" />
                    Instant Priority Dispatch
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                    Fastest
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Technician reaches in 15-25 minutes</p>
              </div>

              <div
                onClick={() => setSlotType('scheduled')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  slotType === 'scheduled' ? 'border-cyan-600 bg-cyan-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-600" />
                    Scheduled Slot
                  </span>
                  <span className="text-[10px] text-slate-500">Pick Time</span>
                </div>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  disabled={slotType !== 'scheduled'}
                  className="mt-1 w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option>Today, 4:00 PM - 5:00 PM</option>
                  <option>Today, 6:00 PM - 7:00 PM</option>
                  <option>Tomorrow, 8:00 AM - 9:00 AM</option>
                  <option>Tomorrow, 11:00 AM - 12:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Review Itemized Receipt</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review Itemized Price & Razorpay / UPI Simulator */}
      {step === 4 && (
        <div className="p-5 sm:p-7 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Itemized Receipt & Payment</h3>
            <p className="text-xs text-slate-500">
              Full transparent pricing — base price, surge, dynamic zone multiplier & GST
            </p>
          </div>

          {/* Itemized Price Breakdown Table */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">
                {activeServiceTier?.name} ({selectedVehicle?.make} {selectedVehicle?.model})
              </span>
              <span className="font-semibold text-slate-900">₹{basePrice}</span>
            </div>

            {zoneMultiplier > 1.0 && (
              <div className="flex justify-between items-center text-xs text-amber-800">
                <span>Zone Demand Multiplier ({zoneMultiplier}x in {selectedZone.name})</span>
                <span className="font-semibold">+₹{Math.round(basePrice * (zoneMultiplier - 1.0))}</span>
              </div>
            )}

            {demandSurge > 0 && (
              <div className="flex justify-between items-center text-xs text-amber-800">
                <span>Peak Demand Surge (20+ active doorstep requests)</span>
                <span className="font-semibold">+₹{demandSurge}</span>
              </div>
            )}

            {appliedCoupon && (
              <div className="flex justify-between items-center text-xs text-emerald-700">
                <span>Coupon ({appliedCoupon.code} - {appliedCoupon.discountPct}%)</span>
                <span className="font-bold">-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>GST (18% Statutory CGST + SGST)</span>
              <span>₹{gstTax}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Guaranteed Total</span>
              <span className="text-lg font-black text-cyan-700">₹{finalTotal}</span>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter promo code (e.g. FIRSTSUDS)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase font-mono"
              />
              <Tag size={13} className="absolute left-2.5 top-3 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
          {appliedCoupon && (
            <p className="text-[11px] text-emerald-700 font-semibold">
              ✔ Coupon {appliedCoupon.code} applied! Saved ₹{discountAmount}.
            </p>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">Select Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* UPI Option */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'upi' ? 'border-cyan-600 bg-cyan-50/40' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-cyan-600" />
                  <span className="text-xs font-bold text-slate-900">Instant UPI</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">GPay, PhonePe, Paytm, BHIM</p>
              </div>

              {/* SudsGo Wallet Option */}
              <div
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'wallet' ? 'border-cyan-600 bg-cyan-50/40' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <WalletIcon size={16} className="text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">SudsGo Wallet</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Bal: ₹{walletBalance}</p>
              </div>

              {/* Card Option */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-cyan-600 bg-cyan-50/40' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Cards / Netbanking</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Tokenized via Razorpay</p>
              </div>
            </div>
          </div>

          {/* UPI App Selection if UPI chosen */}
          {paymentMethod === 'upi' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-600 font-medium">Select UPI App:</span>
              {['gpay', 'phonepe', 'paytm', 'cred'].map((app) => (
                <label key={app} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 capitalize">
                  <input
                    type="radio"
                    name="upiApp"
                    value={app}
                    checked={selectedUpiApp === app}
                    onChange={(e) => setSelectedUpiApp(e.target.value)}
                    className="accent-cyan-600"
                  />
                  {app}
                </label>
              ))}
            </div>
          )}

          <div className="pt-3 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmAndPay}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>{isProcessing ? 'Authorizing with Gateway...' : `Pay ₹${finalTotal} & Dispatch Rig`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add New Vehicle to Garage */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Add Vehicle to Garage</h4>
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVehicleSubmit} className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="vehType"
                    checked={newVehicleData.type === 'car'}
                    onChange={() => setNewVehicleData({ ...newVehicleData, type: 'car' })}
                    className="accent-cyan-600"
                  />
                  Four-Wheeler (Car)
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="vehType"
                    checked={newVehicleData.type === 'bike'}
                    onChange={() => setNewVehicleData({ ...newVehicleData, type: 'bike' })}
                    className="accent-cyan-600"
                  />
                  Two-Wheeler (Bike/Scooter)
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Make / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Tata, Hyundai, Royal Enfield, Honda"
                  value={newVehicleData.make}
                  onChange={(e) => setNewVehicleData({ ...newVehicleData, make: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Model Name & Trim</label>
                <input
                  type="text"
                  placeholder="e.g. Nexon EV, City ZX, Classic 350"
                  value={newVehicleData.model}
                  onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  License Plate Number (Indian RTO standard)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-AB-1234"
                  value={newVehicleData.plateNumber}
                  onChange={(e) => setNewVehicleData({ ...newVehicleData, plateNumber: e.target.value.toUpperCase() })}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Color</label>
                <input
                  type="text"
                  placeholder="e.g. Daytona Grey, Polar White"
                  value={newVehicleData.color}
                  onChange={(e) => setNewVehicleData({ ...newVehicleData, color: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow"
                >
                  Save to Garage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
