import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  CreditCard,
  Droplet,
  Award
} from 'lucide-react';
import { LedgerEntry } from '../types';
import confetti from 'canvas-confetti';

interface CustomerWalletViewProps {
  balance: number;
  ledgerEntries: LedgerEntry[];
  onAddFunds: (amount: number) => void;
  onSubscribe: (planName: string, price: number) => void;
  activeSubscription?: string;
}

export const CustomerWalletView: React.FC<CustomerWalletViewProps> = ({
  balance,
  ledgerEntries,
  onAddFunds,
  onSubscribe,
  activeSubscription,
}) => {
  const [topUpAmount, setTopUpAmount] = useState<number>(500);

  const handleTopUp = () => {
    onAddFunds(topUpAmount);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handlePlanSelect = (name: string, price: number) => {
    if (balance < price) {
      alert(`Insufficient wallet balance (₹${balance}). Please add at least ₹${price - balance} to activate subscription.`);
      return;
    }
    onSubscribe(name, price);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div id="customer-wallet-view" className="space-y-6">
      {/* Wallet Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 text-white shadow-xl border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <WalletIcon size={14} />
              <span>SudsGo Audited Doorstep Wallet</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono">₹{balance}</span>
              <span className="text-xs text-slate-400">Available Credits</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Protected by Double-Entry Ledger. Instant 100% refund for unserviced bookings.
            </p>
          </div>

          {/* Quick Top-Up */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
            <span className="text-xs text-slate-300 font-semibold block">Quick Top-Up (UPI):</span>
            <div className="flex items-center gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    topUpAmount === amt ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleTopUp}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
            >
              <ArrowUpRight size={14} />
              <span>Load ₹{topUpAmount} via UPI</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-400" />
            Double-entry immutable ledger table
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Droplet size={14} />
            Saved 390L Groundwater with SudsGo
          </span>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <span>Monthly Doorstep Subscriptions</span>
          </h3>
          <p className="text-xs text-slate-500">
            Save up to 35% with scheduled recurring doorstep washes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plan 1 */}
          <div className="p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bi-Weekly Clean Routine</h4>
                  <p className="text-xs text-slate-500 mt-0.5">2 Suds Signature Foam Washes per month</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">₹699</span>
                  <span className="text-slate-500 text-xs block">/ month</span>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-cyan-600 shrink-0" />
                  <span>2 Signature Foam Washes + Alloy Scrub</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-cyan-600 shrink-0" />
                  <span>Roll over unused washes to next month</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-cyan-600 shrink-0" />
                  <span>10% off any deep interior add-on</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handlePlanSelect('Bi-Weekly Clean Routine', 699)}
              disabled={activeSubscription === 'Bi-Weekly Clean Routine'}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-emerald-600 text-white font-bold text-xs transition-colors"
            >
              {activeSubscription === 'Bi-Weekly Clean Routine' ? 'Active Subscription ✔' : 'Subscribe for ₹699/mo'}
            </button>
          </div>

          {/* Plan 2 */}
          <div className="relative p-4 rounded-xl border-2 border-cyan-600 bg-cyan-50/30 flex flex-col justify-between space-y-3 shadow-sm">
            <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase">
              Founder Pick
            </span>
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">SudsGo Unlimited Pass</h4>
                  <p className="text-xs text-slate-500 mt-0.5">4 Full Foam Washes + Priority Monsoon Dispatch</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-cyan-900">₹1,199</span>
                  <span className="text-slate-500 text-xs block">/ month</span>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-cyan-600 shrink-0" />
                  <span>4 Foam Washes (Exterior + Interior Vacuum)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-cyan-600 shrink-0" />
                  <span>Zero Rain Surge surcharge forever</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-cyan-600 shrink-0" />
                  <span>AI Computer Vision clean certificate on every wash</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handlePlanSelect('SudsGo Unlimited Pass', 1199)}
              disabled={activeSubscription === 'SudsGo Unlimited Pass'}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm"
            >
              {activeSubscription === 'SudsGo Unlimited Pass' ? 'Active Subscription ✔' : 'Subscribe for ₹1,199/mo'}
            </button>
          </div>
        </div>
      </div>

      {/* Double-Entry Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Customer Wallet Ledger Activity</h3>
            <p className="text-xs text-slate-500">Every credit and debit is immutable and cryptographically audited</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {ledgerEntries.map((entry) => (
            <div key={entry.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    entry.type === 'credit'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {entry.type === 'credit' ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">{entry.description}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ref: {entry.reference} • {entry.createdAt}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-mono font-bold block ${
                    entry.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {entry.type === 'credit' ? '+' : '-'}₹{entry.amount}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Bal: ₹{entry.balanceAfter}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
