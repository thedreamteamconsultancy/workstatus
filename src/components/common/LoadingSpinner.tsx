import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, text }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-glow-pulse">
          <span className="text-primary-foreground font-bold text-2xl">W</span>
        </div>
        <Loader2 className="w-8 h-8 text-primary absolute -bottom-2 -right-2 animate-spin" />
      </div>
      {text && <p className="text-muted-foreground animate-pulse-soft">{text}</p>}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-20">{content}</div>;
};
