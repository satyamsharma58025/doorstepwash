import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  ShieldAlert, 
  Receipt, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  Booking, 
  Technician, 
  ServiceZone, 
  KYCApplication, 
  LedgerEntry, 
  Coupon 
} from '../types';
import { StatusChip } from './StatusChip';

interface AdminOpsViewProps {
  bookings: Booking[];
  technicians: Technician[];
  zones: ServiceZone[];
  kycApplications: KYCApplication[];
  ledger: LedgerEntry[];
  coupons: Coupon[];
  onApproveKYC: (appId: string) => void;
  onRejectKYC: (appId: string, reason: string) => void;
  onUpdateZoneMultiplier: (zoneId: string, multiplier: number) => void;
  onIssueLedgerRefund: (bookingId: string, amount: number, reason: string) => void;
  onToggleRainMode: () => void;
  isRainSurgeActive: boolean;
}

export const AdminOpsView: React.FC<AdminOpsViewProps> = ({
  bookings,
  technicians,
  zones,
  kycApplications,
  ledger,
  coupons,
  onApproveKYC,
  onRejectKYC,
  onUpdateZoneMultiplier,
  onIssueLedgerRefund,
  onToggleRainMode,
  isRainSurgeActive,
}) => {
  const [activeTab, setActiveTab] = useState<'ops_map' | 'kyc' | 'zones' | 'ledger' | 'coupons'>('ops_map');
  const [rejectReason, setRejectReason] = useState<string>('Kit missing 140 bar washer');
  const [refundBookingId, setRefundBookingId] = useState<string>('');

  const activeBookings = bookings.filter((b) => !['completed', 'cancelled'].includes(b.status));

  return (
    <div id="admin-ops-portal" className="space-y-6">
      {/* Ops KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Active Doorstep Rigs</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{technicians.filter((t) => t.status !== 'offline').length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Online</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Live Dispatch Queue</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-cyan-700">{activeBookings.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">In Transit</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">KYC Pending Review</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">
              {kycApplications.filter((k) => k.status === 'pending').length}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Review</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Immutable Ledger Volume</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">₹{ledger.reduce((acc, l) => acc + (l.type === 'credit' ? l.amount : 0), 0)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">Audited</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ops_map', label: 'Live Ops Map & Dispatch', icon: MapPin },
          { key: 'kyc', label: 'Technician KYC Queue', icon: Users },
          { key: 'zones', label: 'Zones & Dynamic Pricing', icon: Layers },
          { key: 'ledger', label: 'Ledger & Dispute Refunds', icon: Receipt },
          { key: 'coupons', label: 'Coupons & Fraud Shield', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Live Ops Map & Active Dispatch List */}
      {activeTab === 'ops_map' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  Real-Time Fleet & Dispatch Grid (Bengaluru & Mumbai)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Socket.IO namespaced live coordinate telemetry (4-6s interval)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" /> Active Rig (Van)
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Doorstep Spot
                </span>
              </div>
            </div>

            {/* Visual Vector Grid of Online Technicians */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {technicians.map((t) => (
                <div key={t.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{t.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-cyan-300">
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Van Rig • 140 Bar High-Pressure Rig</p>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700 font-mono">
                    <span>Batt: {t.batteryPct}%</span>
                    <span>Tank: {t.waterTankPct}%</span>
                    <span>Jobs: {t.totalJobs}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Active Doorstep Service Orders</h4>
              <span className="text-xs text-slate-500">{activeBookings.length} order(s) live</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer & Vehicle</th>
                    <th className="p-3">Service Tier</th>
                    <th className="p-3">Assigned Rig</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="p-3">
                        <span className="font-semibold block text-slate-900">{b.customerName}</span>
                        <span className="text-slate-500 text-[11px]">
                          {b.vehicle.make} {b.vehicle.model} ({b.vehicle.plateNumber})
                        </span>
                      </td>
                      <td className="p-3 font-medium">{b.service.name}</td>
                      <td className="p-3">
                        {b.technicianName ? (
                          <span className="text-slate-800 font-semibold">{b.technicianName}</span>
                        ) : (
                          <span className="text-amber-600 italic">Finding nearest...</span>
                        )}
                      </td>
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

      {/* Tab 2: Technician KYC Queue */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Technician Onboarding & KYC Queue</h3>
              <p className="text-xs text-slate-500">
                Verify government ID, driving license, and 140 Bar pressure equipment readiness
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {kycApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900">{app.technicianName}</span>
                    <p className="text-xs text-slate-500">{app.phone} • {app.city} Hub</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      app.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Aadhaar Verified</span>
                    <span className="font-bold">XXXX-XXXX-{app.aadhaarLast4}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Driving License</span>
                    <span className="font-bold">{app.dlNumber}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Vehicle Reg</span>
                    <span className="font-bold">{app.vehicleReg}</span>
                  </div>
                </div>

                {/* Equipment Checklist */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Equipment Verification Checklist:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {app.equipmentChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-600">
                        {item.verified ? (
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={13} className="text-rose-500 shrink-0" />
                        )}
                        <span>{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onRejectKYC(app.id, rejectReason)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
                    >
                      Reject with Reason
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveKYC(app.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                    >
                      Approve & Grant Dispatch Access
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Zones & Dynamic Pricing Multipliers */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">PostGIS Service Zones & Dynamic Pricing Multipliers</h3>
              <p className="text-xs text-slate-500">
                Rule-based algorithm: Zone Surge = Base × Zone Multiplier × Weather Factor × Demand Surge
              </p>
            </div>

            {/* Global Monsoon / Rain Surge Toggle */}
            <button
              type="button"
              onClick={onToggleRainMode}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isRainSurgeActive
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>🌧️ Weather Surge (+20% Mud Wash Factor):</span>
              <span className="uppercase font-mono font-black">{isRainSurgeActive ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{zone.name}</h4>
                    <span className="text-xs text-slate-500">{zone.city} Metro Hub</span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                    {zone.surgeMultiplier}x Multiplier
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Active Doorstep Requests:</span>
                    <span className="font-bold text-slate-800">{zone.activeDemands}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Pressure Rigs:</span>
                    <span className="font-bold text-emerald-600">{zone.techniciansOnline}</span>
                  </div>
                </div>

                {/* Adjust Multiplier Slider */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 flex justify-between">
                    <span>Adjust Pricing Surge:</span>
                    <span className="text-cyan-700 font-mono font-bold">{zone.surgeMultiplier}x</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="1.8"
                    step="0.05"
                    value={zone.surgeMultiplier}
                    onChange={(e) => onUpdateZoneMultiplier(zone.id, Number(e.target.value))}
                    className="w-full accent-cyan-600 mt-1 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>1.0x (Normal)</span>
                    <span>1.4x (High)</span>
                    <span>1.8x (Peak Surge)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Double-Entry Immutable Ledger & Dispute Refunds */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Audit Ledger (Double-Entry Financial Accounting)
              </h3>
              <p className="text-xs text-slate-500">
                Complies with strict auditability: debits & credits are immutable append-only rows.
              </p>
            </div>
          </div>

          {/* Refund Trigger Box */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2.5">
            <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>Issue Ledger-Backed Customer Dispute Refund</span>
            </h4>
            <p className="text-xs text-rose-700">
              Under Phase 4 compliance, refunds must create a new credit ledger entry linked to the booking, never deleting or altering past records.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Booking ID (e.g. SG-2609-082)"
                value={refundBookingId}
                onChange={(e) => setRefundBookingId(e.target.value)}
                className="text-xs p-2 rounded-lg border border-rose-300 bg-white focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!refundBookingId) return;
                  onIssueLedgerRefund(refundBookingId, 499, 'Ops verified doorstep water delay compensation');
                  setRefundBookingId('');
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Execute 100% Wallet Refund
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Entry ID</th>
                  <th className="p-3">Reference / Booking</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{entry.id}</td>
                    <td className="p-3 text-cyan-800">{entry.reference}</td>
                    <td className="p-3 font-sans text-slate-700">{entry.description}</td>
                    <td className="p-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          entry.type === 'credit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-bold ${
                        entry.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {entry.type === 'credit' ? '+' : '-'}₹{entry.amount}
                    </td>
                    <td className="p-3 text-right text-slate-500">₹{entry.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Coupons & Referral Engine */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Coupons & Referral Engine with Fraud Guardrails</h3>
            <p className="text-xs text-slate-500">
              Enforces single-device fingerprint and payment-card deduplication to prevent referral credit abuse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {coupons.map((c) => (
              <div key={c.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-base text-slate-900">{c.code}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {c.discountPct}% OFF
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Max Cap: ₹{c.maxDiscount} • Min Booking: ₹{c.minBooking}
                </p>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Redeemed:</span>
                  <span className="font-bold text-slate-800">{c.usageCount} / {c.usageLimit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-700 flex items-center gap-2">
            <ShieldAlert size={16} className="text-cyan-600 shrink-0" />
            <span>
              <strong>Active Anti-Fraud Rule:</strong> Customer referrals require 1 successful doorstep wash completion before credit release.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
