import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  index?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  index = 0 
}) => {
  const variantStyles = {
    default: 'bg-secondary/50 text-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 truncate">{title}</p>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{value}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${variantStyles[variant]}`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
