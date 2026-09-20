import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Camera, 
  Sparkles, 
  ExternalLink,
  BatteryCharging,
  Droplet,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Booking, BookingStatus, JobOffer, Technician } from '../types';
import { StatusChip } from './StatusChip';
import confetti from 'canvas-confetti';

interface TechnicianAppViewProps {
  technician: Technician;
  activeBooking?: Booking;
  incomingOffer?: JobOffer;
  onAcceptOffer: (offerId: string) => void;
  onDeclineOffer: (offerId: string) => void;
  onTimeoutOffer: (offerId: string) => void;
  onStatusTransition: (bookingId: string, newStatus: BookingStatus) => void;
  onUploadPhotosAndComplete: (bookingId: string, beforeUrl: string, afterUrl: string) => void;
}

export const TechnicianAppView: React.FC<TechnicianAppViewProps> = ({
  technician,
  activeBooking,
  incomingOffer,
  onAcceptOffer,
  onDeclineOffer,
  onTimeoutOffer,
  onStatusTransition,
  onUploadPhotosAndComplete,
}) => {
  // 45s countdown timer for incoming job offer
  const [countdown, setCountdown] = useState<number>(45);
  const [beforePhoto, setBeforePhoto] = useState<string>(activeBooking?.beforePhotoUrl || '');
  const [afterPhoto, setAfterPhoto] = useState<string>(activeBooking?.afterPhotoUrl || '');
  const [isVerifyingCV, setIsVerifyingCV] = useState<boolean>(false);
  const [verificationPassed, setVerificationPassed] = useState<boolean>(false);

  useEffect(() => {
    if (!incomingOffer || incomingOffer.status !== 'pending') return;
    setCountdown(45);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeoutOffer(incomingOffer.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingOffer]);

  // Strict state machine transitions
  const getNextStatus = (current: BookingStatus): BookingStatus | null => {
    switch (current) {
      case 'assigned':
        return 'en_route';
      case 'en_route':
        return 'arrived';
      case 'arrived':
        return 'washing';
      case 'washing':
        return 'completed';
      default:
        return null;
    }
  };

  const getNextActionLabel = (current: BookingStatus): string => {
    switch (current) {
      case 'assigned':
        return 'Start Trip (En Route)';
      case 'arrived':
        return 'Start Foam Wash & Detailing';
      case 'en_route':
        return 'Mark Arrived at Doorstep';
      case 'washing':
        return 'Verify Photos & Complete Job';
      default:
        return 'Job Completed';
    }
  };

  const handleNextTransition = () => {
    if (!activeBooking) return;
    const next = getNextStatus(activeBooking.status);
    if (!next) return;

    if (next === 'completed') {
      // Must have uploaded before & after photos
      if (!beforePhoto || !afterPhoto) {
        alert('Mandatory Requirement: Both Before and After photos are required for AI clean-check verification.');
        return;
      }
      onUploadPhotosAndComplete(activeBooking.id, beforePhoto, afterPhoto);
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      return;
    }

    onStatusTransition(activeBooking.id, next);
  };

  return (
    <div id="technician-app-view" className="max-w-md mx-auto space-y-4">
      {/* Technician Status & Gear Health Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={technician.avatar}
              alt={technician.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-cyan-400"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{technician.name}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Mobile Van Rig #04 • 140 Bar</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Today's Payout</span>
            <span className="text-base font-extrabold text-cyan-300 font-mono">₹{technician.earningsToday}</span>
          </div>
        </div>

        {/* Rig Telemetry */}
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <BatteryCharging size={14} className="text-cyan-400" />
            <span>Battery: <strong>{technician.batteryPct}%</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Droplet size={14} className="text-cyan-400" />
            <span>Water Tank: <strong>{technician.waterTankPct}%</strong> (45L)</span>
          </div>
        </div>
      </div>

      {/* Incoming Job Offer Card (with 45s countdown) */}
      {incomingOffer && incomingOffer.status === 'pending' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500 shadow-xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-ping" />
              <span>NEW DOORSTEP JOB OFFER</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow">
              {countdown}s
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-slate-900">
              <span>{incomingOffer.serviceTierName}</span>
              <span className="text-emerald-700 font-black text-sm">₹{incomingOffer.estimatedEarnings} payout</span>
            </div>
            <p className="text-slate-600 font-semibold">{incomingOffer.vehicleSummary}</p>
            <p className="text-slate-500 text-[11px] flex items-center gap-1">
              <MapPin size={12} className="text-amber-600" />
              <span>{incomingOffer.addressSummary} ({incomingOffer.distanceKm} km away)</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onDeclineOffer(incomingOffer.id)}
              className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors"
            >
              Pass (Decline)
            </button>
            <button
              type="button"
              onClick={() => onAcceptOffer(incomingOffer.id)}
              className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow transition-all"
            >
              Accept Job ({countdown}s)
            </button>
          </div>
          <span className="text-[10px] text-slate-500 block text-center">
            *Auto-reassigns to next technician if timer reaches 0
          </span>
        </div>
      )}

      {/* Active Job Workflow */}
      {activeBooking && activeBooking.status !== 'completed' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-mono">Job #{activeBooking.id}</span>
              <h4 className="text-sm font-bold text-slate-900">{activeBooking.service.name}</h4>
            </div>
            <StatusChip status={activeBooking.status} size="sm" />
          </div>

          {/* Customer & Spot Details */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">{activeBooking.customerName}</span>
              <a
                href={`tel:${activeBooking.customerPhone}`}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-cyan-700 font-bold flex items-center gap-1 hover:bg-cyan-50"
              >
                <Phone size={12} />
                <span>Call</span>
              </a>
            </div>
            <p className="text-slate-600 flex items-start gap-1.5">
              <MapPin size={13} className="text-cyan-600 shrink-0 mt-0.5" />
              <span>{activeBooking.address.area}, {activeBooking.address.landmark}</span>
            </p>
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center font-mono">
              <span className="font-bold text-slate-800">{activeBooking.vehicle.make} {activeBooking.vehicle.model}</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{activeBooking.vehicle.plateNumber}</span>
            </div>
          </div>

          {/* Turn-by-Turn External Handoff Button */}
          <button
            type="button"
            onClick={() => window.open(`https://maps.google.com/?q=${activeBooking.address.lat},${activeBooking.address.lng}`, '_blank')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
          >
            <ExternalLink size={14} className="text-cyan-600" />
            <span>Open in Google Maps Navigation</span>
          </button>

          {/* State Machine Status Step Display */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-slate-700 block">Strict State Machine:</span>
            <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
              {[
                { key: 'assigned', label: '1. Assigned' },
                { key: 'en_route', label: '2. En Route' },
                { key: 'arrived', label: '3. Arrived' },
                { key: 'washing', label: '4. Washing' },
              ].map((s) => {
                const isCurrent = activeBooking.status === s.key;
                const isPast = ['completed'].includes(activeBooking.status);
                return (
                  <div
                    key={s.key}
                    className={`p-1.5 rounded-lg border ${
                      isCurrent
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Capture Area for Completion */}
          {(activeBooking.status === 'arrived' || activeBooking.status === 'washing') && (
            <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-cyan-900 font-bold text-xs">
                <Camera size={14} />
                <span>Mandatory Clean-Check Photos (Before & After)</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-1">Before Arrival Photo</span>
                  {beforePhoto ? (
                    <img src={beforePhoto} alt="Before wash" className="h-20 w-full object-cover rounded-lg border" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBeforePhoto('https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80')}
                      className="h-20 w-full border-2 border-dashed border-cyan-300 rounded-lg flex flex-col items-center justify-center text-[10px] text-cyan-700 font-semibold hover:bg-cyan-100/50"
                    >
                      <Camera size={16} />
                      <span>Snap Before</span>
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-1">After Wash Photo</span>
                  {afterPhoto ? (
                    <img src={afterPhoto} alt="After wash" className="h-20 w-full object-cover rounded-lg border" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAfterPhoto('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80')}
                      className="h-20 w-full border-2 border-dashed border-cyan-300 rounded-lg flex flex-col items-center justify-center text-[10px] text-cyan-700 font-semibold hover:bg-cyan-100/50"
                    >
                      <Sparkles size={16} />
                      <span>Snap After</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advance State Machine Button */}
          <button
            type="button"
            onClick={handleNextTransition}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>{getNextActionLabel(activeBooking.status)}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">All Jobs Dispatched & Completed</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your location is active in Indiranagar/Domlur zone. You will receive new offers as customers book.
            </p>
          </div>
        </div>
      )}

      {/* Payout Financial Integrity Notice */}
      <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs border border-slate-200 flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
        <span>
          <strong>Double-Entry Ledger Payout:</strong> Payout is credited to your ledger only when customer payment clears Razorpay gateway.
        </span>
      </div>
    </div>
  );
};
