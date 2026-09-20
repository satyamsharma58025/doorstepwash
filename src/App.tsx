import React, { useState } from 'react';
import { 
  Droplet, 
  Sparkles, 
  Car, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Shield, 
  MessageSquare, 
  Wallet as WalletIcon, 
  Wrench, 
  Building2, 
  Smartphone,
  Calendar,
  Layers,
  Phone,
  AlertCircle
} from 'lucide-react';
import { 
  Booking, 
  BookingStatus, 
  Vehicle, 
  Technician, 
  JobOffer, 
  LedgerEntry,
  ServiceZone,
  KYCApplication,
  Coupon
} from './types';
import { 
  INITIAL_VEHICLES, 
  SERVICE_TIERS, 
  SERVICE_ZONES, 
  INITIAL_TECHNICIANS, 
  INITIAL_BOOKINGS, 
  INITIAL_COUPONS, 
  INITIAL_KYC_APPLICATIONS, 
  INITIAL_LEDGER 
} from './data/mockData';
import { StatusChip } from './components/StatusChip';
import { LiveTrackingMap } from './components/LiveTrackingMap';
import { CleanCheckInspector } from './components/CleanCheckInspector';
import { BookingWizard } from './components/BookingWizard';
import { TechnicianAppView } from './components/TechnicianAppView';
import { AdminOpsView } from './components/AdminOpsView';
import { CustomerWalletView } from './components/CustomerWalletView';
import { AISupportDrawer } from './components/AISupportDrawer';
import confetti from 'canvas-confetti';

export default function App() {
  // App Role / View Switcher
  const [activeRole, setActiveRole] = useState<'customer' | 'technician' | 'admin' | 'wallet'>('customer');
  const [customerSubTab, setCustomerSubTab] = useState<'track' | 'book' | 'history'>('track');

  // Core domain state
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeBookingId, setActiveBookingId] = useState<string>(INITIAL_BOOKINGS[0]?.id || 'SG-2609-082');
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [zones, setZones] = useState<ServiceZone[]>(SERVICE_ZONES);
  const [kycApps, setKycApps] = useState<KYCApplication[]>(INITIAL_KYC_APPLICATIONS);
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [walletBalance, setWalletBalance] = useState<number>(756);
  const [activeSubscription, setActiveSubscription] = useState<string | undefined>('Bi-Weekly Clean Routine');
  const [isRainSurgeActive, setIsRainSurgeActive] = useState<boolean>(false);

  // Incoming offer for technician simulation
  const [incomingJobOffer, setIncomingJobOffer] = useState<JobOffer | undefined>({
    id: 'offer_domlur_99',
    bookingId: 'SG-2609-082',
    technicianId: 'tech_ramesh_1',
    expiresAt: Date.now() + 45000,
    estimatedEarnings: 380,
    distanceKm: 1.4,
    vehicleSummary: 'Hyundai Creta SX (White)',
    serviceTierName: 'Suds Signature Foam Wash',
    addressSummary: '12th Main Road, Indiranagar',
    status: 'pending',
  });

  // AI Support Assistant Drawer state
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0];
  const activeTechnician = technicians[0];

  // Handler: Customer created booking
  const handleBookingCreated = (newBooking: Booking, paymentMethod: 'upi' | 'card' | 'wallet') => {
    setBookings((prev) => [newBooking, ...prev]);
    setActiveBookingId(newBooking.id);
    setCustomerSubTab('track');

    // Add immutable ledger entry
    const newEntry: LedgerEntry = {
      id: `led_${Date.now()}`,
      walletId: 'wal_customer_satyam',
      bookingId: newBooking.id,
      type: 'debit',
      amount: newBooking.pricing.total,
      currency: 'INR',
      reference: newBooking.id,
      description: `Doorstep wash payment (${newBooking.service.name})`,
      createdAt: 'Just now',
      balanceAfter: paymentMethod === 'wallet' ? walletBalance - newBooking.pricing.total : walletBalance,
    };
    setLedger((prev) => [newEntry, ...prev]);

    if (paymentMethod === 'wallet') {
      setWalletBalance((prev) => Math.max(0, prev - newBooking.pricing.total));
    }
  };

  // Handler: Add new vehicle to garage
  const handleAddNewVehicle = (v: Omit<Vehicle, 'id' | 'userId'>) => {
    const newV: Vehicle = {
      ...v,
      id: `veh_${Date.now()}`,
      userId: 'user_satyam',
    };
    setVehicles((prev) => [...prev, newV]);
  };

  // Handler: Technician state machine transition
  const handleStatusTransition = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: newStatus,
          timeline: [
            ...b.timeline,
            {
              id: `evt_${Date.now()}`,
              bookingId,
              status: newStatus,
              actor: 'technician',
              timestamp: 'Just now',
              note: `Status updated to ${newStatus.toUpperCase()}`,
            },
          ],
        };
      })
    );
  };

  // Handler: Complete job with photos
  const handleUploadPhotosAndComplete = (bookingId: string, beforeUrl: string, afterUrl: string) => {
    setBookings((prev: Booking[]) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: 'completed' as BookingStatus,
          beforePhotoUrl: beforeUrl,
          afterPhotoUrl: afterUrl,
          cleanCheckReport: {
            approved: true,
            overallScore: 95,
            metrics: {
              surfaceDirtRemoval: 98,
              glossAndReflectivity: 94,
              wheelAndTireDressing: 96,
              glassStreakFree: 97,
            },
            feedback: 'Spotless deep foam wash. All brake dust and road tar eliminated. Paint reflectivity validated.',
            defectsDetected: [],
            payoutEligibility: 'APPROVED_FOR_INSTANT_TRANSFER' as const,
          },
          timeline: [
            ...b.timeline,
            {
              id: `evt_cmp_${Date.now()}`,
              bookingId,
              status: 'completed' as BookingStatus,
              actor: 'technician' as const,
              timestamp: 'Just now',
              note: 'Doorstep wash completed & AI Clean-Check verified',
            },
          ],
        };
      })
    );

    // Technician payout ledger credit
    const payoutAmount = 380;
    const payoutEntry: LedgerEntry = {
      id: `led_pay_${Date.now()}`,
      walletId: 'wal_technician_ramesh',
      bookingId,
      type: 'credit',
      amount: payoutAmount,
      currency: 'INR',
      reference: bookingId,
      description: `Technician payout release for ${bookingId}`,
      createdAt: 'Just now',
      balanceAfter: walletBalance,
    };
    setLedger((prev) => [payoutEntry, ...prev]);

    setTechnicians((prev) =>
      prev.map((t) => (t.id === activeTechnician.id ? { ...t, earningsToday: t.earningsToday + payoutAmount } : t))
    );
  };

  // Handler: Technician offer actions
  const handleAcceptOffer = (offerId: string) => {
    setIncomingJobOffer(undefined);
    handleStatusTransition(activeBooking.id, 'en_route');
  };

  const handleDeclineOffer = (offerId: string) => {
    setIncomingJobOffer(undefined);
  };

  const handleTimeoutOffer = (offerId: string) => {
    setIncomingJobOffer(undefined);
  };

  // Handler: KYC Actions
  const handleApproveKYC = (appId: string) => {
    setKycApps((prev: KYCApplication[]) =>
      prev.map((k: KYCApplication) => (k.id === appId ? { ...k, status: 'approved' as const } : k))
    );
  };

  const handleRejectKYC = (appId: string, reason: string) => {
    setKycApps((prev: KYCApplication[]) =>
      prev.map((k: KYCApplication) => (k.id === appId ? { ...k, status: 'rejected' as const, notes: reason } : k))
    );
  };

  // Handler: Zone Multiplier update
  const handleUpdateZoneMultiplier = (zoneId: string, multiplier: number) => {
    setZones((prev: ServiceZone[]) =>
      prev.map((z: ServiceZone) => (z.id === zoneId ? { ...z, surgeMultiplier: multiplier } : z))
    );
  };

  // Handler: Ledger refund execution
  const handleIssueLedgerRefund = (bookingId: string, amount: number, reason: string) => {
    const refundEntry: LedgerEntry = {
      id: `led_ref_${Date.now()}`,
      walletId: 'wal_customer_satyam',
      bookingId,
      type: 'credit',
      amount,
      currency: 'INR',
      reference: bookingId,
      description: `Dispute refund: ${reason}`,
      createdAt: 'Just now',
      balanceAfter: walletBalance + amount,
    };
    setLedger((prev) => [refundEntry, ...prev]);
    setWalletBalance((prev) => prev + amount);

    setBookings((prev: Booking[]) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              payment: { ...b.payment, status: 'refunded' as const },
              timeline: [
                ...b.timeline,
                {
                  id: `evt_ref_${Date.now()}`,
                  bookingId,
                  status: 'cancelled' as BookingStatus,
                  actor: 'system' as const,
                  timestamp: 'Just now',
                  note: `100% refund of ₹${amount} issued to wallet (${reason})`,
                },
              ],
            }
          : b
      )
    );
  };

  // Handler: Top up wallet
  const handleAddFunds = (amt: number) => {
    const topUpEntry: LedgerEntry = {
      id: `led_top_${Date.now()}`,
      walletId: 'wal_customer_satyam',
      type: 'credit',
      amount: amt,
      currency: 'INR',
      reference: `topup_upi_${Math.random().toString(36).substring(4)}`,
      description: 'Customer UPI wallet reload',
      createdAt: 'Just now',
      balanceAfter: walletBalance + amt,
    };
    setLedger((prev) => [topUpEntry, ...prev]);
    setWalletBalance((prev) => prev + amt);
  };

  // Handler: Subscribe
  const handleSubscribe = (name: string, price: number) => {
    setActiveSubscription(name);
    const subEntry: LedgerEntry = {
      id: `led_sub_${Date.now()}`,
      walletId: 'wal_customer_satyam',
      type: 'debit',
      amount: price,
      currency: 'INR',
      reference: `sub_${name.toLowerCase().replace(/\s+/g, '_')}`,
      description: `Monthly pass activation: ${name}`,
      createdAt: 'Just now',
      balanceAfter: walletBalance - price,
    };
    setLedger((prev) => [subEntry, ...prev]);
    setWalletBalance((prev) => prev - price);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">SudsGo Bengaluru Fleet Hub</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300">Indiranagar & Domlur: 140-Bar Pressure Rigs Ready</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            100% Waterless Bio-Foam • Zero Groundwater Depletion
          </span>
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-600/80 hover:bg-cyan-600 text-white text-[11px] font-bold transition-colors"
          >
            <Sparkles size={12} className="text-amber-300" />
            <span>24/7 AI Concierge</span>
          </button>
        </div>
      </div>

      {/* Primary Header & Persona Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-600/20">
              <Droplet size={22} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">SudsGo</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                  Doorstep
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">Car & Bike Wash Platform</p>
            </div>
          </div>

          {/* Persona Switcher Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveRole('customer')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeRole === 'customer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car size={14} className={activeRole === 'customer' ? 'text-cyan-600' : 'text-slate-400'} />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('technician')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeRole === 'technician'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench size={14} className={activeRole === 'technician' ? 'text-cyan-600' : 'text-slate-400'} />
              <span>Technician Rig</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={14} className={activeRole === 'admin' ? 'text-cyan-600' : 'text-slate-400'} />
              <span>Ops Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('wallet')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeRole === 'wallet'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <WalletIcon size={14} className={activeRole === 'wallet' ? 'text-cyan-600' : 'text-slate-400'} />
              <span className="hidden sm:inline">Wallet</span>
              <span className="font-mono text-cyan-700">₹{walletBalance}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* =========================================================================
            ROLE 1: CUSTOMER PERSONA
           ========================================================================= */}
        {activeRole === 'customer' && (
          <div className="space-y-6">
            {/* Customer Sub-Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerSubTab('track')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    customerSubTab === 'track'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Navigation size={14} className={customerSubTab === 'track' ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>Live Dispatch & Clean Check</span>
                  {activeBooking && activeBooking.status !== 'completed' && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerSubTab('book')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    customerSubTab === 'book'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Sparkles size={14} className={customerSubTab === 'book' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>Book Doorstep Wash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerSubTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    customerSubTab === 'history'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Calendar size={14} className={customerSubTab === 'history' ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>My Garage & Orders</span>
                </button>
              </div>

              {/* Quick info chip */}
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <Shield size={14} className="text-emerald-500" />
                <span>Zero water hookup or electricity required from your home</span>
              </div>
            </div>

            {/* Sub-Tab 1: Live Dispatch Tracking & Proof of Clean */}
            {customerSubTab === 'track' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Live Map & Dispatch Details (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Active Job Card Header */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-400">ORDER #{activeBooking.id}</span>
                        <h2 className="text-lg font-black text-slate-900">{activeBooking.service.name}</h2>
                        <p className="text-xs text-slate-500">
                          {activeBooking.vehicle.make} {activeBooking.vehicle.model} • {activeBooking.vehicle.plateNumber}
                        </p>
                      </div>
                      <StatusChip status={activeBooking.status} size="lg" />
                    </div>

                    {/* Live ETA Banner if en_route */}
                    {activeBooking.status === 'en_route' && (
                      <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="h-3 w-3 rounded-full bg-cyan-500 animate-ping" />
                          <div>
                            <span className="font-bold text-cyan-950">Rig #04 is En Route to Your Doorstep</span>
                            <p className="text-cyan-800 text-[11px]">
                              Navigating via Domlur Flyover • Estimated arrival in 6-8 mins
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-mono font-black text-cyan-800">~6 mins</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Live Tracking Map */}
                  <LiveTrackingMap booking={activeBooking} heightClass="h-80 sm:h-96" />

                  {/* State Machine Event Timeline */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock size={16} className="text-cyan-600" />
                      <span>Live Doorstep Audit Timeline</span>
                    </h3>

                    <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                      {activeBooking.timeline.map((evt, idx) => (
                        <div key={evt.id} className="relative flex items-start gap-3.5 text-xs">
                          <div className="h-7 w-7 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                            <CheckCircle2 size={15} />
                          </div>
                          <div className="flex-1 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                                {evt.status.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                            </div>
                            <p className="text-slate-600 mt-1">{evt.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Clean-Check Inspector & Technician Info (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Technician Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Assigned Detailing Specialist</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Aadhaar Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <img
                        src={activeBooking.technicianPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                        alt={activeBooking.technicianName}
                        className="h-14 w-14 rounded-2xl object-cover border-2 border-cyan-500 shadow-sm"
                      />
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{activeBooking.technicianName}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                          <span className="text-amber-500 font-bold">★ {activeBooking.technicianRating}</span>
                          <span className="text-slate-400">•</span>
                          <span>420+ washes</span>
                          <span className="text-slate-400">•</span>
                          <span>Van Rig #04</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium">Equipped with 140-Bar Rig</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      <a
                        href={`tel:${activeBooking.technicianPhone}`}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone size={14} className="text-cyan-600" />
                        <span>Call Technician</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsSupportOpen(true)}
                        className="flex-1 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-cyan-200"
                      >
                        <MessageSquare size={14} className="text-cyan-600" />
                        <span>AI Concierge</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Clean-Check Inspector Component */}
                  <CleanCheckInspector
                    booking={activeBooking}
                    onRatingSubmit={(r, c) => {
                      setBookings((prev: Booking[]) =>
                        prev.map((b) =>
                          b.id === activeBooking.id
                            ? { 
                                ...b, 
                                review: { 
                                  bookingId: b.id, 
                                  rating: r, 
                                  comment: c, 
                                  createdAt: 'Just now' 
                                } 
                              }
                            : b
                        )
                      );
                    }}
                    onRepeatBookingClick={() => setCustomerSubTab('book')}
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Book Doorstep Wash Wizard */}
            {customerSubTab === 'book' && (
              <div className="max-w-3xl mx-auto">
                <BookingWizard
                  vehicles={vehicles}
                  serviceTiers={SERVICE_TIERS}
                  zones={zones}
                  coupons={coupons}
                  walletBalance={walletBalance}
                  onBookingCreated={handleBookingCreated}
                  onAddNewVehicle={handleAddNewVehicle}
                />
              </div>
            )}

            {/* Sub-Tab 3: Garage & Past Bookings */}
            {customerSubTab === 'history' && (
              <div className="space-y-6">
                {/* Vehicles in Garage */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Your Registered Vehicles</h3>
                      <p className="text-xs text-slate-500">Tap to schedule a wash for any vehicle in your garage</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomerSubTab('book')}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      + Add New Vehicle
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {vehicles.map((v) => (
                      <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="h-28 rounded-lg overflow-hidden bg-slate-200">
                          {v.photoUrl && (
                            <img src={v.photoUrl} alt={v.model} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{v.make} {v.model}</h4>
                            <span className="text-xs font-mono text-slate-500">{v.plateNumber}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {v.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomerSubTab('book')}
                          className="w-full mt-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-cyan-700 transition-colors"
                        >
                          Book Doorstep Wash
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Booking Receipts */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Booking History & Receipts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="p-3">Receipt ID</th>
                          <th className="p-3">Vehicle</th>
                          <th className="p-3">Service Tier</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Total Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/60">
                            <td className="p-3 font-mono font-bold text-slate-900">{b.id}</td>
                            <td className="p-3 font-semibold">{b.vehicle.make} {b.vehicle.model}</td>
                            <td className="p-3">{b.service.name}</td>
                            <td className="p-3 text-slate-500">{b.scheduledAt}</td>
                            <td className="p-3">
                              <StatusChip status={b.status} size="sm" />
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">₹{b.pricing.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ROLE 2: TECHNICIAN MOBILE RIG APP
           ========================================================================= */}
        {activeRole === 'technician' && (
          <div className="space-y-4">
            <div className="text-center max-w-md mx-auto mb-2">
              <h2 className="text-lg font-black text-slate-900">Technician Doorstep Rig Terminal</h2>
              <p className="text-xs text-slate-500">
                Live dispatch state machine, navigation handoff, and CV clean verification
              </p>
            </div>

            <TechnicianAppView
              technician={activeTechnician}
              activeBooking={activeBooking}
              incomingOffer={incomingJobOffer}
              onAcceptOffer={handleAcceptOffer}
              onDeclineOffer={handleDeclineOffer}
              onTimeoutOffer={handleTimeoutOffer}
              onStatusTransition={handleStatusTransition}
              onUploadPhotosAndComplete={handleUploadPhotosAndComplete}
            />
          </div>
        )}

        {/* =========================================================================
            ROLE 3: ADMIN & OPS PORTAL
           ========================================================================= */}
        {activeRole === 'admin' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-lg font-black text-slate-900">Fleet Operations & Ledger Governance</h2>
                <p className="text-xs text-slate-500">
                  Real-time dispatch tracking, dynamic PostGIS surges, KYC gatekeeping & dispute resolution
                </p>
              </div>
            </div>

            <AdminOpsView
              bookings={bookings}
              technicians={technicians}
              zones={zones}
              kycApplications={kycApps}
              ledger={ledger}
              coupons={coupons}
              onApproveKYC={handleApproveKYC}
              onRejectKYC={handleRejectKYC}
              onUpdateZoneMultiplier={handleUpdateZoneMultiplier}
              onIssueLedgerRefund={handleIssueLedgerRefund}
              onToggleRainMode={() => setIsRainSurgeActive(!isRainSurgeActive)}
              isRainSurgeActive={isRainSurgeActive}
            />
          </div>
        )}

        {/* =========================================================================
            ROLE 4: CUSTOMER WALLET & PASSES
           ========================================================================= */}
        {activeRole === 'wallet' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="mb-2">
              <h2 className="text-lg font-black text-slate-900">SudsGo Balance & Subscriptions</h2>
              <p className="text-xs text-slate-500">
                Audited double-entry ledger, instant UPI top-up, and monthly doorstep subscriptions
              </p>
            </div>

            <CustomerWalletView
              balance={walletBalance}
              ledgerEntries={ledger}
              onAddFunds={handleAddFunds}
              onSubscribe={handleSubscribe}
              activeSubscription={activeSubscription}
            />
          </div>
        )}
      </main>

      {/* 24/7 AI Support Concierge Drawer */}
      <AISupportDrawer
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        activeBooking={activeBooking}
      />
    </div>
  );
}
