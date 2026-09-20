export type UserRole = 'customer' | 'technician' | 'admin';

export type VehicleType = 'car' | 'bike';

export interface Vehicle {
  id: string;
  userId: string;
  type: VehicleType;
  make: string;
  model: string;
  plateNumber: string;
  color: string;
  year?: number;
  photoUrl?: string;
}

export type ServiceTierLevel = 'basic' | 'foam' | 'interior' | 'full-detail';

export interface ServiceTier {
  id: string;
  name: string;
  vehicleType: VehicleType;
  basePrice: number;
  durationMin: number;
  tier: ServiceTierLevel;
  tagline: string;
  features: string[];
  popular?: boolean;
  ecoMetrics: {
    waterSavedLiters: number;
    biodegradableShampoo: boolean;
  };
}

export type BookingStatus = 
  | 'requested'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'washing'
  | 'completed'
  | 'cancelled';

export interface BookingEvent {
  id: string;
  bookingId: string;
  status: BookingStatus;
  actor: 'system' | 'customer' | 'technician' | 'admin';
  timestamp: string;
  note: string;
  photoUrl?: string;
}

export interface PricingBreakdown {
  basePrice: number;
  surgeAmount: number;
  weatherSurge: number;
  zoneMultiplier: number;
  tax: number;
  total: number;
  currency: 'INR';
  demandLevel: 'NORMAL' | 'HIGH_DEMAND';
  isRainSurge: boolean;
  appliedCoupon?: string;
  couponDiscount?: number;
}

export interface CleanCheckReport {
  approved: boolean;
  overallScore: number;
  metrics: {
    surfaceDirtRemoval: number;
    glossAndReflectivity: number;
    wheelAndTireDressing: number;
    glassStreakFree: number;
  };
  feedback: string;
  defectsDetected: string[];
  payoutEligibility: 'APPROVED_FOR_INSTANT_TRANSFER' | 'MANUAL_REVIEW_REQUIRED';
  mode?: string;
}

export interface Review {
  bookingId: string;
  rating: number;
  comment: string;
  tags?: string[];
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianRating?: number;
  technicianPhoto?: string;
  vehicle: Vehicle;
  service: ServiceTier;
  status: BookingStatus;
  scheduledAt: string;
  address: {
    label: string;
    area: string;
    city: string;
    pin: string;
    lat: number;
    lng: number;
    landmark?: string;
  };
  pricing: PricingBreakdown;
  payment: {
    method: 'upi' | 'card' | 'wallet' | 'cod';
    status: 'paid' | 'pending' | 'refunded';
    gatewayRef: string;
    upiId?: string;
  };
  timeline: BookingEvent[];
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  cleanCheckReport?: CleanCheckReport;
  review?: Review;
  technicianLocation?: {
    lat: number;
    lng: number;
    heading: number;
    speedKmH: number;
    lastUpdated: string;
  };
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalJobs: number;
  avatar: string;
  status: 'available' | 'busy' | 'offline';
  currentLat: number;
  currentLng: number;
  vehicleType: 'electric_scooter' | 'utility_van';
  kycStatus: 'approved' | 'pending' | 'rejected';
  batteryPct: number;
  waterTankPct: number;
  joinedDate: string;
  earningsToday: number;
}

export interface ServiceZone {
  id: string;
  name: string;
  city: string;
  active: boolean;
  surgeMultiplier: number;
  activeDemands: number;
  techniciansOnline: number;
  centerLat: number;
  centerLng: number;
  polygonPoints: [number, number][];
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  bookingId?: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: 'INR';
  description: string;
  reference: string;
  balanceAfter: number;
  createdAt: string;
}

export interface Wallet {
  id: string;
  ownerId: string;
  ownerType: 'customer' | 'technician';
  balance: number;
  currency: 'INR';
}

export interface JobOffer {
  id: string;
  bookingId: string;
  technicianId: string;
  distanceKm: number;
  expiresAt: number; // Unix timestamp ms
  status: 'pending' | 'accepted' | 'declined' | 'timed_out';
  estimatedEarnings: number;
  vehicleSummary: string;
  serviceTierName: string;
  addressSummary: string;
}

export interface KYCApplication {
  id: string;
  technicianId: string;
  technicianName: string;
  phone: string;
  city: string;
  aadhaarLast4: string;
  dlNumber: string;
  vehicleReg: string;
  equipmentChecklist: { item: string; verified: boolean }[];
  status: 'approved' | 'pending' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export interface Coupon {
  code: string;
  discountPct: number;
  maxDiscount: number;
  minBooking: number;
  active: boolean;
  usageCount: number;
  usageLimit: number;
}
