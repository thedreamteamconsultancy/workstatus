import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem } from '@/types';

interface EditGemModalProps {
  gem: Gem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gemId: string, data: { name: string; phone: string; fixedDriveUrl?: string }) => void;
}

export const EditGemModal: React.FC<EditGemModalProps> = ({ gem, isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fixedDriveUrl, setFixedDriveUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form when gem changes
  useEffect(() => {
    if (gem) {
      setName(gem.name);
      setPhone(gem.phone);
      setFixedDriveUrl(gem.fixedDriveUrl || '');
    }
  }, [gem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gem) return;
    
    setLoading(true);
    try {
      await onSubmit(gem.id, { 
        name, 
        phone, 
        fixedDriveUrl: fixedDriveUrl.trim() || undefined 
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!gem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md my-4 sm:my-8"
          >
            <Card variant="elevated" className="border-primary/20 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <CardHeader className="relative p-4 sm:p-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-3 sm:mb-4 shadow-soft">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Edit Gem</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">Update gem information</p>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="fixedDriveUrl" className="text-sm">Fixed Drive Folder URL</Label>
                    <div className="relative">
                      <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fixedDriveUrl"
                        value={fixedDriveUrl}
                        onChange={(e) => setFixedDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/drive/folders/..."
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pre-assigned Google Drive folder for this gem's assets and uploads
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="gradient" className="flex-1 order-1 sm:order-2" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
