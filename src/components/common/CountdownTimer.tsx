import React, { useState, useEffect } from 'react';
import { differenceInSeconds, isPast } from 'date-fns';

interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
  className?: string;
  showSeconds?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
  totalSeconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  deadline, 
  onExpire,
  className = '',
  showSeconds = true 
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(deadline));
  const [hasExpired, setHasExpired] = useState(false);

  function calculateTimeLeft(targetDate: Date): TimeLeft {
    const now = new Date();
    const totalSeconds = differenceInSeconds(targetDate, now);
    const isOverdue = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    
    const days = Math.floor(absSeconds / (60 * 60 * 24));
    const hours = Math.floor((absSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((absSeconds % (60 * 60)) / 60);
    const seconds = absSeconds % 60;

    return { days, hours, minutes, seconds, isOverdue, totalSeconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(deadline);
      setTimeLeft(newTimeLeft);
      
      // Check if just expired
      if (newTimeLeft.isOverdue && !hasExpired && onExpire) {
        setHasExpired(true);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, hasExpired, onExpire]);

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value}${unit}`;
  };

  const getDisplayText = () => {
    const { days, hours, minutes, seconds, isOverdue } = timeLeft;
    
    if (isOverdue) {
      // Show overdue time
      const parts: string[] = [];
      if (days > 0) parts.push(formatTimeUnit(days, 'd'));
      if (hours > 0 || days > 0) parts.push(formatTimeUnit(hours, 'h'));
      if (minutes > 0 || hours > 0 || days > 0) parts.push(formatTimeUnit(minutes, 'm'));
      if (showSeconds) parts.push(formatTimeUnit(seconds, 's'));
      
      return `Overdue by ${parts.join(' ')}`;
    }
    
    // Show remaining time
    const parts: string[] = [];
    if (days > 0) parts.push(formatTimeUnit(days, 'd'));
    if (hours > 0 || days > 0) parts.push(formatTimeUnit(hours, 'h'));
    parts.push(formatTimeUnit(minutes, 'm'));
    if (showSeconds) parts.push(formatTimeUnit(seconds, 's'));
    
    return parts.join(' ');
  };

  const getUrgencyClass = () => {
    const { isOverdue, totalSeconds } = timeLeft;
    
    if (isOverdue) return 'text-destructive animate-pulse';
    
    // Less than 1 hour - critical
    if (totalSeconds < 3600) return 'text-destructive';
    
    // Less than 24 hours - warning
    if (totalSeconds < 86400) return 'text-amber-500';
    
    // More than 24 hours - normal
    return 'text-emerald-500';
  };

  return (
    <span className={`font-mono font-semibold ${getUrgencyClass()} ${className}`}>
      {getDisplayText()}
    </span>
  );
};

// Compact version for cards
export const CompactCountdownTimer: React.FC<CountdownTimerProps> = ({ 
  deadline, 
  onExpire,
  className = '' 
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(deadline));
  const [hasExpired, setHasExpired] = useState(false);

  function calculateTimeLeft(targetDate: Date): TimeLeft {
    const now = new Date();
    const totalSeconds = differenceInSeconds(targetDate, now);
    const isOverdue = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    
    const days = Math.floor(absSeconds / (60 * 60 * 24));
    const hours = Math.floor((absSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((absSeconds % (60 * 60)) / 60);
    const seconds = absSeconds % 60;

    return { days, hours, minutes, seconds, isOverdue, totalSeconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(deadline);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.isOverdue && !hasExpired && onExpire) {
        setHasExpired(true);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, hasExpired, onExpire]);

  const getDisplayText = () => {
    const { days, hours, minutes, seconds, isOverdue } = timeLeft;
    
    if (isOverdue) {
      if (days > 0) return `${days}d ${hours}h late`;
      if (hours > 0) return `${hours}h ${minutes}m late`;
      return `${minutes}m ${seconds}s late`;
    }
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  const getUrgencyClass = () => {
    const { isOverdue, totalSeconds } = timeLeft;
    
    if (isOverdue) return 'text-destructive';
    if (totalSeconds < 3600) return 'text-destructive';
    if (totalSeconds < 86400) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  return (
    <span className={`font-mono text-xs ${getUrgencyClass()} ${className}`}>
      {getDisplayText()}
    </span>
  );
};
