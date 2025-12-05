import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, Plus, Clock, Upload, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, Gem } from '@/types';

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  gem: Gem;
  savedCustomMessages?: string[];
  onSaveCustomMessage?: (message: string) => void;
}

interface PredefinedMessage {
  id: string;
  label: string;
  icon: React.ReactNode;
  getMessage: (gemName: string, taskTitle: string) => string;
  variant: 'default' | 'warning' | 'success' | 'info';
}

const predefinedMessages: PredefinedMessage[] = [
  {
    id: 'status',
    label: 'Ask Status',
    icon: <Clock className="w-4 h-4" />,
    getMessage: (gemName, taskTitle) => 
      `Hi ${gemName}! 👋\n\nHope you're doing great! Just wanted to check in on the task "${taskTitle}".\n\nCould you please share a quick update on the progress? Let me know if you need any help!\n\nThank you! 🙏`,
    variant: 'info',
  },
  {
    id: 'upload',
    label: 'Request Upload',
    icon: <Upload className="w-4 h-4" />,
    getMessage: (gemName, taskTitle) => 
      `Hi ${gemName}! 👋\n\nGreat work on "${taskTitle}"! 🎉\n\nWhen you're ready, please upload the completed work to your designated folder.\n\nLooking forward to seeing the final result! Keep up the amazing work! ✨`,
    variant: 'success',
  },
  {
    id: 'reminder',
    label: 'Gentle Reminder',
    icon: <AlertTriangle className="w-4 h-4" />,
    getMessage: (gemName, taskTitle) => 
      `Hi ${gemName}! 👋\n\nJust a friendly reminder about the task "${taskTitle}".\n\nThe deadline is approaching, so please prioritize this when you can. I believe in your ability to deliver quality work! 💪\n\nLet me know if there's anything blocking you. We're here to help! 🤝`,
    variant: 'warning',
  },
  {
    id: 'delayed',
    label: 'Delayed Task',
    icon: <AlertTriangle className="w-4 h-4" />,
    getMessage: (gemName, taskTitle) => 
      `Hi ${gemName}! 👋\n\n⚠️ The task "${taskTitle}" is now marked as *DELAYED*.\n\nI understand things can get busy, but this task needs immediate attention. Please prioritize this and let me know:\n\n1. What's blocking you?\n2. When can you complete it?\n3. Do you need any help?\n\nLet's work together to get this done ASAP! I'm here to support you. 💪\n\nPlease update me today. Thank you! 🙏`,
    variant: 'warning',
  },
  {
    id: 'late',
    label: 'Start Working',
    icon: <Sparkles className="w-4 h-4" />,
    getMessage: (gemName, taskTitle) => 
      `Hi ${gemName}! 👋\n\nI noticed the task "${taskTitle}" might need some attention.\n\nNo worries at all - let's get this moving! Please start working on it when you can, and don't hesitate to reach out if you need any clarification or resources.\n\nYou've got this! 🌟`,
    variant: 'default',
  },
  {
    id: 'appreciation',
    label: 'Appreciation',
    icon: <CheckCircle className="w-4 h-4" />,
    getMessage: (gemName, taskTitle) => 
      `Hi ${gemName}! 🌟\n\nJust wanted to say thank you for your excellent work on "${taskTitle}"!\n\nYour dedication and quality really shows. Keep up the fantastic work - you're a valuable part of our team! 🎉\n\nLooking forward to more great things! 💎`,
    variant: 'success',
  },
];

export const WhatsAppMessageModal: React.FC<WhatsAppMessageModalProps> = ({
  isOpen,
  onClose,
  task,
  gem,
  savedCustomMessages = [],
  onSaveCustomMessage,
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Add country code if not present (assuming India +91 or modify as needed)
    if (digits.startsWith('91') && digits.length === 12) {
      return digits;
    }
    if (digits.length === 10) {
      return '91' + digits;
    }
    return digits;
  };

  const openWhatsApp = (message: string) => {
    const phoneNumber = formatPhoneNumber(gem.phone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleSendCustomMessage = () => {
    if (!customMessage.trim()) return;
    
    // Save the custom message if handler is provided
    if (onSaveCustomMessage && !savedCustomMessages.includes(customMessage.trim())) {
      onSaveCustomMessage(customMessage.trim());
    }
    
    openWhatsApp(customMessage);
    setCustomMessage('');
    setShowCustomInput(false);
  };

  const getVariantStyles = (variant: PredefinedMessage['variant']) => {
    switch (variant) {
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20';
      default:
        return 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20';
    }
  };

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
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3 sm:mb-4 shadow-soft">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Message {gem.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Task: <span className="font-medium text-foreground">{task.title}</span>
                </p>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                {/* Predefined Messages */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Quick Messages</p>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedMessages.map((msg) => (
                      <Button
                        key={msg.id}
                        variant="outline"
                        className={`h-auto py-2.5 px-3 flex flex-col items-center gap-1 text-xs ${getVariantStyles(msg.variant)}`}
                        onClick={() => openWhatsApp(msg.getMessage(gem.name.split(' ')[0], task.title))}
                      >
                        {msg.icon}
                        <span>{msg.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Saved Custom Messages */}
                {savedCustomMessages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Saved Messages</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {savedCustomMessages.map((msg, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full h-auto py-2 px-3 text-left text-xs justify-start"
                          onClick={() => openWhatsApp(msg)}
                        >
                          <span className="line-clamp-2">{msg}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Message */}
                <div className="space-y-2">
                  {!showCustomInput ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCustomInput(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write Custom Message
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder={`Hi ${gem.name.split(' ')[0]}! ...`}
                        rows={4}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomMessage('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleSendCustomMessage}
                          disabled={!customMessage.trim()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
