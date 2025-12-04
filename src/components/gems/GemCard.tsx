import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Eye, Trash2, ChevronRight, Pencil, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem } from '@/types';

interface GemCardProps {
  gem: Gem;
  onOpen: (gem: Gem) => void;
  onEdit: (gem: Gem) => void;
  onDelete: (gem: Gem) => void;
  index: number;
}

export const GemCard: React.FC<GemCardProps> = ({ gem, onOpen, onEdit, onDelete, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
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
                {gem.fixedDriveUrl && (
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    <HardDrive className="w-3 h-3 mr-1" />
                    Drive Set
                  </Badge>
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
