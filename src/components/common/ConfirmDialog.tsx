import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card variant="elevated">
              <CardHeader className="relative text-center pb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${variant === 'danger' ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                  <AlertTriangle className={`w-7 h-7 ${variant === 'danger' ? 'text-destructive' : 'text-warning'}`} />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    {cancelText}
                  </Button>
                  <Button 
                    variant={variant === 'danger' ? 'destructive' : 'warning'} 
                    onClick={onConfirm} 
                    className="flex-1"
                  >
                    {confirmText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
