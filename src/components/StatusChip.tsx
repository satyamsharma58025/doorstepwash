import React from 'react';
import { BookingStatus } from '../types';
import { STATUS_CHIP_STYLES } from '../tokens';
import { 
  Clock, 
  UserCheck, 
  Navigation, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface StatusChipProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const style = STATUS_CHIP_STYLES[status] || STATUS_CHIP_STYLES.requested;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold',
  }[size];

  const renderIcon = () => {
    if (!showIcon) return null;
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

    switch (status) {
      case 'requested':
        return <Clock size={iconSize} className="shrink-0" aria-hidden="true" />;
      case 'assigned':
        return <UserCheck size={iconSize} className="shrink-0" aria-hidden="true" />;
      case 'en_route':
        return <Navigation size={iconSize} className="shrink-0 animate-pulse" aria-hidden="true" />;
      case 'arrived':
        return <MapPin size={iconSize} className="shrink-0" aria-hidden="true" />;
      case 'washing':
        return <Sparkles size={iconSize} className="shrink-0 animate-spin text-cyan-600" aria-hidden="true" />;
      case 'completed':
        return <CheckCircle2 size={iconSize} className="shrink-0 text-emerald-600" aria-hidden="true" />;
      case 'cancelled':
        return <XCircle size={iconSize} className="shrink-0 text-rose-600" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <span
      id={`status-chip-${status}`}
      className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
      role="status"
      aria-label={`Booking status: ${style.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot} shrink-0`} aria-hidden="true" />
      {renderIcon()}
      <span className="truncate">{style.label}</span>
    </span>
  );
};
