import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Eye, Trash2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem } from '@/types';

interface GemCardProps {
  gem: Gem;
  onOpen: (gem: Gem) => void;
  onDelete: (gem: Gem) => void;
  index: number;
}

export const GemCard: React.FC<GemCardProps> = ({ gem, onOpen, onDelete, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card variant="elevated" className="group hover:border-primary/30 cursor-pointer" onClick={() => onOpen(gem)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                  <span className="text-primary-foreground font-bold text-lg">
                    {gem.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg truncate">{gem.name}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{gem.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="font-mono text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  {gem.password}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(gem);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            variant="secondary" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Open Gem Panel
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
