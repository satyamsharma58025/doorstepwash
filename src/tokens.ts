/**
 * SudsGo Design System Tokens
 * Derived from Phase 0 design research:
 * Domain style: Clean modern trustworthy (Cyan / Ocean Blue) + Vibrant Energetic Accent (Amber Suds Glow)
 * Typography: Modern geometric sans-serif (Plus Jakarta Sans)
 * UX Correctness: Badge & chip overflow nowrap rules, WCAG AA compliance, accessible icon standards
 */

export const DESIGN_TOKENS = {
  colors: {
    // Primary Trustworthy Spectrum (Ocean / Cyan)
    brand: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2', // Primary Brand Action
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    // Energetic Foam Accent (Amber / Citron Suds)
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // High-energy badge / button
      600: '#d97706',
      700: '#b45309',
    },
    // Precision Eco Green (Sustainability / Completed)
    eco: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    // Sophisticated Cool Neutrals
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      display: "'Space Grotesk', system-ui, sans-serif",
    },
  },
  radii: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px (card max)
    full: '9999px', // pills / chips
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    card: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    glow: '0 0 20px -3px rgba(6, 182, 212, 0.25)',
  },
};

/**
 * Booking Status Chip Mapping
 * Conforms to UX Correctness:
 * - whitespace-nowrap, inline-flex, shrink-0
 * - Accessible contrast ratio ≥ 4.5:1
 * - Clear semantic icon pairing
 */
export const STATUS_CHIP_STYLES = {
  requested: {
    label: 'Requested',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    description: 'Matching nearby high-pressure wash team',
  },
  assigned: {
    label: 'Assigned',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
    description: 'Technician confirmed & prepping wash gear',
  },
  en_route: {
    label: 'En Route',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    dot: 'bg-indigo-600 animate-pulse',
    description: 'Van/scooter navigating to your doorstep',
  },
  arrived: {
    label: 'Arrived',
    bg: 'bg-cyan-50',
    text: 'text-cyan-900',
    border: 'border-cyan-300',
    dot: 'bg-cyan-500',
    description: 'Technician reached your parking spot',
  },
  washing: {
    label: 'Washing',
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-300',
    dot: 'bg-teal-500 animate-ping',
    description: 'High-pressure foam spray & detailing active',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
    description: 'CV clean-check passed & job finished',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    description: 'Booking cancelled & wallet refunded',
  },
} as const;
