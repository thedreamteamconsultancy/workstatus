import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Eye, Trash2, ChevronRight, Pencil, HardDrive, MessageCircle, Send, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem } from '@/types';

// Metrics type for gem performance
interface GemMetrics {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
  ongoingCount: number;
  delayedCount: number;
  onTimeCompletedCount: number;
  completionRate: number;
  performanceScore: number;
  hasActiveTasks: boolean;
}

// WhatsApp utility functions
const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
};

const openWhatsAppChat = (phone: string) => {
  const phoneNumber = formatPhoneNumber(phone);
  window.open(`https://wa.me/${phoneNumber}`, '_blank');
};

const sendCredentials = (gem: Gem) => {
  const phoneNumber = formatPhoneNumber(gem.phone);
  const message = `🌟 *Welcome to the Team, ${gem.name.split(' ')[0]}!* 🌟\n\nWe're thrilled to have you onboard! Your talent and dedication are about to shine. 💎\n\n🔐 *Your Login Credentials*\n\n🌐 Platform: https://workstatus-dts.vercel.app/\n📧 Email: ${gem.email}\n🔑 Password: ${gem.phone}\n\n✨ Pro Tips:\n• Bookmark the platform link for easy access\n• Keep your credentials safe and private\n• Check your dashboard daily for new tasks\n\nYou've got this! Let's achieve greatness together! 🚀\n\nBest regards,\nThe Dream Team 💜`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};

interface GemCardProps {
  gem: Gem;
  onOpen: (gem: Gem) => void;
  onEdit: (gem: Gem) => void;
  onDelete: (gem: Gem) => void;
  index: number;
  metrics?: GemMetrics;
}

export const GemCard: React.FC<GemCardProps> = ({ gem, onOpen, onEdit, onDelete, index, metrics }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card variant="elevated" className="group hover:border-primary/30 cursor-pointer" onClick={() => onOpen(gem)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-base sm:text-lg">
                    {gem.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">{gem.name}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="truncate">{gem.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                <Badge variant="secondary" className="font-mono text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  {gem.password}
                </Badge>
              </div>

              {/* Task Metrics */}
              {metrics && metrics.totalTasks > 0 && (
                <div className="flex items-center gap-1.5 mb-3 sm:mb-4 flex-wrap">
                  {metrics.completedCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-1.5 py-0.5">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {metrics.completedCount}
                    </Badge>
                  )}
                  {metrics.pendingCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30 px-1.5 py-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {metrics.pendingCount}
                    </Badge>
                  )}
                  {metrics.ongoingCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30 px-1.5 py-0.5">
                      <Loader2 className="w-3 h-3 mr-1" />
                      {metrics.ongoingCount}
                    </Badge>
                  )}
                  {metrics.delayedCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30 px-1.5 py-0.5">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {metrics.delayedCount}
                    </Badge>
                  )}
                </div>
              )}

              {/* Action Icon Buttons */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendCredentials(gem);
                  }}
                  title="Send Credentials"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    openWhatsAppChat(gem.phone);
                  }}
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                {gem.fixedDriveUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(gem.fixedDriveUrl, '_blank');
                    }}
                    title="Open Drive"
                  >
                    <HardDrive className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(gem);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(gem);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="w-full text-sm sm:text-base group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Open Gem Panel
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
