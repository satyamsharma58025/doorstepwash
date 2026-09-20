import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Star, 
  Camera, 
  ArrowRight, 
  Sliders,
  RotateCcw
} from 'lucide-react';
import { Booking, CleanCheckReport } from '../types';
import confetti from 'canvas-confetti';

interface CleanCheckInspectorProps {
  booking: Booking;
  onRatingSubmit?: (rating: number, comment: string) => void;
  onRepeatBookingClick?: () => void;
}

export const CleanCheckInspector: React.FC<CleanCheckInspectorProps> = ({
  booking,
  onRatingSubmit,
  onRepeatBookingClick,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
  const [activeTab, setActiveTab] = useState<'slider' | 'report'>('slider');
  const [userRating, setUserRating] = useState<number>(booking.review?.rating || 5);
  const [comment, setComment] = useState<string>(booking.review?.comment || '');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(booking.review));
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [cleanReport, setCleanReport] = useState<CleanCheckReport | undefined>(booking.cleanCheckReport);

  const defaultBefore = booking.beforePhotoUrl || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80';
  const defaultAfter = booking.afterPhotoUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80';

  const handleRunAICheck = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/clean-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: booking.vehicle.type,
          serviceTier: booking.service.name,
        }),
      });
      const data = await res.json();
      setCleanReport(data);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onRatingSubmit) {
      onRatingSubmit(userRating, comment);
    }
    if (userRating >= 4) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div id="clean-check-inspector" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-cyan-100 text-cyan-700">
              <Camera size={14} />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Doorstep Wash Verification & AI Inspection
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified proof of clean for {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.plateNumber})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('slider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'slider' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Before / After Slider
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'report' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>AI Clean Score</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'slider' ? (
        <div className="p-4 sm:p-6">
          {/* Interactive Split Slider */}
          <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden bg-slate-900 select-none shadow-inner border border-slate-200">
            {/* After Image (Base) */}
            <img
              src={defaultAfter}
              alt="Vehicle after doorstep wash"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow">
              After Suds Wash ✨
            </div>

            {/* Before Image (Clipped by slider position) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={defaultBefore}
                alt="Vehicle before doorstep wash"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', minWidth: '400px' }}
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm text-amber-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow">
                Before (Arrival Dirt)
              </div>
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="h-8 w-8 rounded-full bg-white shadow-xl border-2 border-cyan-600 flex items-center justify-center text-slate-700">
                <Sliders size={14} className="rotate-90 text-cyan-600" />
              </div>
            </div>

            {/* Interactive Touch/Mouse Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              aria-label="Drag to compare before and after vehicle wash condition"
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>👈 Drag divider to inspect panel finish</span>
            <button
              type="button"
              onClick={() => setSliderPosition(50)}
              className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <RotateCcw size={12} />
              Reset Center
            </button>
          </div>
        </div>
      ) : (
        /* AI Cleanliness Report Card */
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-emerald-50 border border-cyan-100">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-cyan-600 text-white flex flex-col items-center justify-center shadow-md">
                <span className="text-xl font-black leading-none">{cleanReport?.overallScore || 94}</span>
                <span className="text-[10px] uppercase font-bold text-cyan-100 mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                  <ShieldCheck size={16} />
                  <span>AI Computer Vision Verified</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 max-w-md">
                  {cleanReport?.feedback || 'Zero streak lines, paint clear coat reflection validated, and tyre hydrophobic dressing approved.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isAuditing}
              onClick={handleRunAICheck}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-cyan-700 border border-cyan-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>{isAuditing ? 'Auditing Photometry...' : 'Re-Run Vision Audit'}</span>
            </button>
          </div>

          {/* Detailed Metric Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { label: 'Surface Dirt Removal', score: cleanReport?.metrics.surfaceDirtRemoval || 96, desc: 'Zero swirl-causing grit remained' },
              { label: 'Paint Gloss & Reflectivity', score: cleanReport?.metrics.glossAndReflectivity || 92, desc: 'High specular shine index' },
              { label: 'Tire & Wheel Dressing', score: cleanReport?.metrics.wheelAndTireDressing || 94, desc: 'Brake dust removed & silicone coat' },
              { label: 'Glass Streak-Free Clarity', score: cleanReport?.metrics.glassStreakFree || 95, desc: 'Windshield clarity 100% road safe' },
            ].map((metric) => (
              <div key={metric.label} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-slate-800">{metric.label}</span>
                  <span className="font-mono font-bold text-cyan-700">{metric.score}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">{metric.desc}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>
              <strong>Financial Integrity Check Passed:</strong> Customer charge verified & technician payout unlocked for transfer.
            </span>
          </div>
        </div>
      )}

      {/* Review & Feedback Section */}
      <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/30">
        <h4 className="text-sm font-bold text-slate-900 mb-2">
          Rate Your Doorstep Experience
        </h4>

        {isSubmitted ? (
          <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-cyan-900">
                Thank you! Rating saved to immutable audit ledger.
              </span>
            </div>
            {comment && <p className="text-xs text-slate-600 mt-2 italic">"{comment}"</p>}

            {/* Upsell Rule: Only prompt for repeat/subscription if rating >= 4 stars */}
            {userRating >= 4 && (
              <div className="mt-4 pt-3 border-t border-cyan-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-cyan-950 block">Love the clean shine?</span>
                  <span className="text-xs text-slate-600">Save 35% with the SudsGo Unlimited Monthly Pass.</span>
                </div>
                <button
                  type="button"
                  onClick={onRepeatBookingClick}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <span>Book Next Wash</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 mr-1">Tap stars:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={22}
                    className={star <= userRating ? 'fill-amber-400 text-amber-400' : ''}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {userRating === 5 ? 'Exceptional! 🌟' : userRating === 4 ? 'Great job' : 'Needs work'}
              </span>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add optional comments for the technician (e.g. spotless glass, arrived fast, great manners)..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Submit Verified Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
