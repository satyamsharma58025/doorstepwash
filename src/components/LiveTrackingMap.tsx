import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Compass, Shield, Phone, ExternalLink } from 'lucide-react';
import { Booking } from '../types';

interface LiveTrackingMapProps {
  booking: Booking;
  heightClass?: string;
  showDetailsOverlay?: boolean;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  booking,
  heightClass = 'h-80',
  showDetailsOverlay = true,
}) => {
  // Simulated dynamic vehicle coordinates moving smoothly towards target
  const [progress, setProgress] = useState(0.45); // 0 to 1 along path
  const [zoomLevel] = useState(1);

  useEffect(() => {
    if (booking.status !== 'en_route') return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) return 0.95;
        return Number((prev + 0.015).toFixed(3));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [booking.status]);

  // Interpolate route coordinates for SVG path
  // Start: DOM hub (20%, 80%), End: Customer (75%, 28%)
  const startX = 60;
  const startY = 240;
  const midX = 180;
  const midY = 170;
  const endX = 320;
  const endY = 85;

  // Bezier curve point calculation
  const t = progress;
  const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
  const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;

  const remainingMinutes = Math.max(2, Math.round((1 - progress) * 12));
  const remainingKm = Math.max(0.4, Number(((1 - progress) * 3.2).toFixed(1)));

  return (
    <div id="live-tracking-map-container" className={`relative w-full ${heightClass} bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner select-none`}>
      {/* Map SVG Canvas */}
      <svg 
        className="w-full h-full object-cover" 
        viewBox="0 0 400 300" 
        preserveAspectRatio="xMidYMid slice"
        aria-label="Interactive technician live dispatch map"
      >
        <defs>
          {/* Street grid pattern */}
          <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
          {/* Glow filter */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Map Background Grid */}
        <rect width="100%" height="100%" fill="#0f172a" />
        <rect width="100%" height="100%" fill="url(#roadGrid)" />

        {/* City Blocks & Parks representation */}
        <path d="M 20 20 H 90 V 70 H 20 Z" fill="#132338" opacity="0.6" />
        <path d="M 120 30 H 240 V 90 H 120 Z" fill="#132338" opacity="0.6" />
        <path d="M 270 20 H 380 V 110 H 270 Z" fill="#132338" opacity="0.6" />
        <path d="M 30 130 H 110 V 220 H 30 Z" fill="#132338" opacity="0.6" />
        <path d="M 140 180 H 280 V 270 H 140 Z" fill="#132338" opacity="0.6" />

        {/* Park / Greenery Zone */}
        <path d="M 290 150 C 310 140, 360 160, 370 200 C 375 230, 330 250, 300 240 Z" fill="#064e3b" opacity="0.25" />

        {/* Major Arterial Roads */}
        <path d="M 0 100 Q 200 80 400 120" stroke="#334155" strokeWidth="6" fill="none" />
        <path d="M 100 0 Q 140 150 80 300" stroke="#334155" strokeWidth="5" fill="none" />
        <path d="M 260 0 Q 240 180 310 300" stroke="#334155" strokeWidth="5" fill="none" />
        <path d="M 0 250 C 150 220, 250 200, 400 240" stroke="#334155" strokeWidth="6" fill="none" />

        {/* Active Dispatch Route Polyline */}
        <path
          d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
          stroke="#06b6d4"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 4"
          fill="none"
          filter="url(#routeGlow)"
        />

        {/* Completed portion of route */}
        <path
          d={`M ${startX} ${startY} Q ${(1-t/2)*startX + (t/2)*midX} ${(1-t/2)*startY + (t/2)*midY} ${currentX} ${currentY}`}
          stroke="#22d3ee"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Customer Location Pin */}
        <g transform={`translate(${endX}, ${endY})`}>
          {/* Target pulse ring */}
          <circle r="16" fill="#0891b2" opacity="0.2" className="animate-ping" />
          <circle r="10" fill="#0891b2" />
          <circle r="4" fill="#ffffff" />
          {/* Pin marker icon */}
          <g transform="translate(-12, -26)">
            <path
              d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32S24 21 24 12C24 5.37 18.63 0 12 0Z"
              fill="#06b6d4"
            />
            <circle cx="12" cy="11" r="5" fill="#ffffff" />
          </g>
          {/* Customer Address Label */}
          <rect x="-45" y="10" width="90" height="18" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <text x="0" y="22" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="600">
            Doorstep Spot
          </text>
        </g>

        {/* Live Technician Vehicle Marker */}
        <g transform={`translate(${currentX}, ${currentY})`}>
          {/* Radar ripple */}
          <circle r="22" fill="#06b6d4" opacity="0.15" className="animate-pulse" />
          <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
          {/* Direction indicator arrow */}
          <g transform="rotate(35)">
            <polygon points="0,-8 5,5 0,2 -5,5" fill="#ffffff" />
          </g>
          {/* Vehicle Tooltip */}
          <rect x="-40" y="-32" width="80" height="18" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
          <text x="0" y="-20" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="700">
            SudsGo Rig #04
          </text>
        </g>
      </svg>

      {/* Top Map Status Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2 pointer-events-auto shadow-lg">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-semibold text-slate-100">Live GPS Link</span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-xs text-cyan-300 font-mono">4-6s interval</span>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2 pointer-events-auto shadow-lg text-xs font-medium text-slate-200">
          <Shield size={13} className="text-emerald-400" />
          <span>Equipped & Insured</span>
        </div>
      </div>

      {/* Bottom Dispatch Info Overlay */}
      {showDetailsOverlay && (
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Navigation size={18} className="text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {booking.status === 'en_route' ? `${remainingMinutes} mins away` : 'At Your Doorstep'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
                    {remainingKm} km
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                  {booking.technicianName} • Mobile Pressure Van (140 Bar)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${booking.technicianPhone || '+919845012839'}`}
                className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 transition-colors"
                aria-label="Call assigned technician"
              >
                <Phone size={15} />
              </a>
              <button
                type="button"
                onClick={() => window.open(`https://maps.google.com/?q=${booking.address.lat},${booking.address.lng}`, '_blank')}
                className="h-9 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Navigate</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
