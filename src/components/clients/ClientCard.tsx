import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Phone, Briefcase, ChevronRight, Trash2, Pencil, DollarSign, Video, Image, Eye, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Client, Gem, ProjectType } from '@/types';

interface ClientCardProps {
  client: Client;
  gems: Gem[];
  onOpen: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  index: number;
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  website: 'Website',
  social_media_management: 'Social Media Management',
  ads: 'Ads',
  digital_marketing: 'Digital Marketing',
  ads_digital_marketing: 'Ads & Digital Marketing',
  custom: 'Custom',
};

const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  website: 'bg-blue-500/10 text-blue-500',
  social_media_management: 'bg-purple-500/10 text-purple-500',
  ads: 'bg-orange-500/10 text-orange-500',
  digital_marketing: 'bg-green-500/10 text-green-500',
  ads_digital_marketing: 'bg-pink-500/10 text-pink-500',
  custom: 'bg-gray-500/10 text-gray-500',
};

export const ClientCard: React.FC<ClientCardProps> = ({ client, gems, onOpen, onEdit, onDelete, index }) => {
  const assignedGemNames = client.workSplit.assignedGems
    .map(gemId => gems.find(g => g.id === gemId)?.name)
    .filter(Boolean);

  const totalDigitalMarketingCost = client.companySplit.digitalMarketingCosts
    .reduce((sum, cost) => sum + cost.amount, 0);

  const companySplitAmount = client.totalProjectCost * 0.5;
  const netProfit = companySplitAmount - totalDigitalMarketingCost - client.companySplit.travellingCharges;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card variant="elevated" className="group hover:border-primary/30 cursor-pointer" onClick={() => onOpen(client)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">{client.businessName}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {client.projectType === 'custom' ? client.customProjectType : PROJECT_TYPE_LABELS[client.projectType]}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Badge className={`text-xs ${PROJECT_TYPE_COLORS[client.projectType]}`}>
                  {client.projectType === 'custom' ? client.customProjectType : PROJECT_TYPE_LABELS[client.projectType]}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span className="truncate">{client.phone}</span>
                </div>
              </div>
              
              {/* Social Media Commitment Preview */}
              {client.projectType === 'social_media_management' && client.socialMediaCommitment && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-xs">
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary">
                    <Video className="w-3 h-3" /> {client.socialMediaCommitment.realVideos}
                  </span>
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-warning/10 text-warning">
                    <Video className="w-3 h-3" /> {client.socialMediaCommitment.aiVideos}
                  </span>
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-success/10 text-success">
                    <Image className="w-3 h-3" /> {client.socialMediaCommitment.posters}
                  </span>
                </div>
              )}
              
              {/* Financial Overview */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-xs sm:text-sm">
                <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground text-xs">Project Cost</p>
                  <p className="font-semibold text-foreground text-sm sm:text-base">₹{client.totalProjectCost.toLocaleString()}</p>
                </div>
                <div className={`p-1.5 sm:p-2 rounded-lg ${netProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <p className="text-muted-foreground text-xs">Net Profit</p>
                  <p className={`font-semibold text-sm sm:text-base ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ₹{netProfit.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Assigned Team */}
              {assignedGemNames.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{assignedGemNames.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(client);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(client);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="w-full mt-2 sm:mt-3 text-sm sm:text-base group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
