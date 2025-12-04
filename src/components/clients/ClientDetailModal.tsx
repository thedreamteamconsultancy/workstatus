import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Phone, DollarSign, Users, Plus, Video, Image, Eye, Calendar, Trash2, CheckCircle2, Clock, Target, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Client, Gem, ProjectType, DigitalMarketingCost, CommitmentType } from '@/types';

interface ClientProgress {
  realVideo: { completed: number; verified: number; total: number };
  aiVideo: { completed: number; verified: number; total: number };
  poster: { completed: number; verified: number; total: number };
  digitalMarketing: { completed: number; verified: number; total: number };
  other: { completed: number; verified: number; total: number };
}

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onAddDigitalMarketingCost: (clientId: string, cost: Omit<DigitalMarketingCost, 'id'>) => void;
  onUpdateTravellingCharges: (clientId: string, amount: number) => void;
  gems: Gem[];
  progress?: ClientProgress;
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  website: 'Website',
  social_media_management: 'Social Media Management',
  ads: 'Ads',
  digital_marketing: 'Digital Marketing',
  ads_digital_marketing: 'Ads & Digital Marketing',
  custom: 'Custom',
};

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isOpen,
  onClose,
  onAddDigitalMarketingCost,
  onUpdateTravellingCharges,
  gems,
  progress
}) => {
  const [newCostAmount, setNewCostAmount] = useState('');
  const [newCostDescription, setNewCostDescription] = useState('');
  const [showAddCost, setShowAddCost] = useState(false);
  const [travelCharges, setTravelCharges] = useState(client?.companySplit.travellingCharges || 0);

  if (!client) return null;

  const assignedGemNames = client.workSplit.assignedGems
    .map(gemId => gems.find(g => g.id === gemId)?.name)
    .filter(Boolean);

  const totalDigitalMarketingCost = client.companySplit.digitalMarketingCosts
    .reduce((sum, cost) => sum + cost.amount, 0);

  const workSplitAmount = client.totalProjectCost * 0.5;
  const companySplitAmount = client.totalProjectCost * 0.5;
  const netProfit = companySplitAmount - totalDigitalMarketingCost - client.companySplit.travellingCharges;

  const handleAddCost = () => {
    if (!newCostAmount || Number(newCostAmount) <= 0) return;
    
    onAddDigitalMarketingCost(client.id, {
      amount: Number(newCostAmount),
      description: newCostDescription || 'Digital Marketing Cost',
      date: new Date(),
    });
    
    setNewCostAmount('');
    setNewCostDescription('');
    setShowAddCost(false);
  };

  const handleUpdateTravel = () => {
    onUpdateTravellingCharges(client.id, travelCharges);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl my-8"
          >
            <Card variant="elevated" className="border-primary/20 max-h-[90vh] overflow-y-auto">
              <CardHeader className="relative sticky top-0 bg-card z-10 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                    <Building2 className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{client.businessName}</CardTitle>
                    <p className="text-muted-foreground">
                      {client.projectType === 'custom' ? client.customProjectType : PROJECT_TYPE_LABELS[client.projectType]}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {client.phone}
                  </Badge>
                  <Badge variant="outline">
                    {client.projectType === 'custom' ? client.customProjectType : PROJECT_TYPE_LABELS[client.projectType]}
                  </Badge>
                </div>
                
                {/* Social Media Commitment */}
                {client.projectType === 'social_media_management' && client.socialMediaCommitment && (
                  <div className="p-4 rounded-lg bg-secondary/30 border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Project Commitment
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-lg bg-background">
                        <Video className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">{client.socialMediaCommitment.realVideos}</p>
                        <p className="text-xs text-muted-foreground">Real Videos</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background">
                        <Video className="w-5 h-5 text-warning mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">{client.socialMediaCommitment.aiVideos}</p>
                        <p className="text-xs text-muted-foreground">AI Videos</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background">
                        <Image className="w-5 h-5 text-success mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">{client.socialMediaCommitment.posters}</p>
                        <p className="text-xs text-muted-foreground">Posters</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background">
                        <Eye className="w-5 h-5 text-info mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">{client.socialMediaCommitment.digitalMarketingViews}</p>
                        <p className="text-xs text-muted-foreground">Views/Video</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Progress - Shows verified tasks progress */}
                {client.projectType === 'social_media_management' && client.socialMediaCommitment && progress && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Delivery Progress
                      <Badge variant="outline" className="ml-auto text-xs">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified Tasks Only
                      </Badge>
                    </h3>
                    <div className="space-y-4">
                      {/* Real Videos Progress */}
                      {client.socialMediaCommitment.realVideos > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-primary" />
                              Real Videos
                            </span>
                            <span className="font-medium">
                              {progress.realVideo.verified} / {client.socialMediaCommitment.realVideos}
                              {progress.realVideo.completed > progress.realVideo.verified && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({progress.realVideo.completed - progress.realVideo.verified} pending verification)
                                </span>
                              )}
                            </span>
                          </div>
                          <Progress 
                            value={(progress.realVideo.verified / client.socialMediaCommitment.realVideos) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      {/* AI Videos Progress */}
                      {client.socialMediaCommitment.aiVideos > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-warning" />
                              AI Videos
                            </span>
                            <span className="font-medium">
                              {progress.aiVideo.verified} / {client.socialMediaCommitment.aiVideos}
                              {progress.aiVideo.completed > progress.aiVideo.verified && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({progress.aiVideo.completed - progress.aiVideo.verified} pending verification)
                                </span>
                              )}
                            </span>
                          </div>
                          <Progress 
                            value={(progress.aiVideo.verified / client.socialMediaCommitment.aiVideos) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      {/* Posters Progress */}
                      {client.socialMediaCommitment.posters > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                              <Image className="w-4 h-4 text-success" />
                              Posters
                            </span>
                            <span className="font-medium">
                              {progress.poster.verified} / {client.socialMediaCommitment.posters}
                              {progress.poster.completed > progress.poster.verified && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({progress.poster.completed - progress.poster.verified} pending verification)
                                </span>
                              )}
                            </span>
                          </div>
                          <Progress 
                            value={(progress.poster.verified / client.socialMediaCommitment.posters) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Overall Progress Summary */}
                    <div className="mt-4 pt-3 border-t border-emerald-500/20">
                      {(() => {
                        const totalTarget = 
                          (client.socialMediaCommitment?.realVideos || 0) + 
                          (client.socialMediaCommitment?.aiVideos || 0) + 
                          (client.socialMediaCommitment?.posters || 0);
                        const totalVerified = 
                          progress.realVideo.verified + 
                          progress.aiVideo.verified + 
                          progress.poster.verified;
                        const percentage = totalTarget > 0 ? Math.round((totalVerified / totalTarget) * 100) : 0;
                        
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <Badge 
                              variant={percentage >= 100 ? 'success' : percentage >= 50 ? 'warning' : 'secondary'}
                              className="text-sm"
                            >
                              {percentage}% Complete
                            </Badge>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Financial Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-lg bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-xl font-bold text-foreground">₹{client.totalProjectCost.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-sm text-muted-foreground">Work (50%)</p>
                    <p className="text-xl font-bold text-blue-500">₹{workSplitAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                    <p className="text-sm text-muted-foreground">Company (50%)</p>
                    <p className="text-xl font-bold text-purple-500">₹{companySplitAmount.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${netProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{netProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Work Split (Admin Only) */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Work Split (50%) - ₹{workSplitAmount.toLocaleString()}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Client Manager</p>
                      <p className="font-medium text-foreground">{client.workSplit.clientManager || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Project Manager</p>
                      <p className="font-medium text-foreground">{client.workSplit.projectManager || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Assigned Gems</p>
                      <p className="font-medium text-foreground">
                        {assignedGemNames.length > 0 ? assignedGemNames.join(', ') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Company Split Costs */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Company Split Costs (50%) - ₹{companySplitAmount.toLocaleString()}
                  </h3>
                  
                  {/* Digital Marketing Costs */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">Digital Marketing Costs</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCost(!showAddCost)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Cost
                      </Button>
                    </div>
                    
                    {showAddCost && (
                      <div className="flex gap-2 mb-3 p-3 rounded-lg bg-secondary/30">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={newCostAmount}
                          onChange={(e) => setNewCostAmount(e.target.value)}
                          className="w-32"
                        />
                        <Input
                          placeholder="Description"
                          value={newCostDescription}
                          onChange={(e) => setNewCostDescription(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleAddCost} variant="gradient" size="sm">
                          Add
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {client.companySplit.digitalMarketingCosts.length > 0 ? (
                        client.companySplit.digitalMarketingCosts.map((cost, idx) => (
                          <div key={cost.id} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {cost.date.toLocaleDateString()}
                              </span>
                              <span className="text-foreground">{cost.description}</span>
                            </div>
                            <span className="font-medium text-destructive">-₹{cost.amount.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">No costs added yet</p>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Digital Marketing</span>
                      <span className="font-semibold text-destructive">-₹{totalDigitalMarketingCost.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Travelling Charges */}
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium text-foreground mb-3">Travelling Charges for Shooting</h4>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          value={travelCharges}
                          onChange={(e) => setTravelCharges(Number(e.target.value))}
                          className="pl-8"
                        />
                      </div>
                      <Button onClick={handleUpdateTravel} variant="outline">
                        Update
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Current: ₹{client.companySplit.travellingCharges.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Net Profit Calculation */}
                  <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'} border`}>
                    <h4 className="font-medium text-foreground mb-2">Company Net Profit</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Company Split (50%)</span>
                        <span>₹{companySplitAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>- Digital Marketing Costs</span>
                        <span>₹{totalDigitalMarketingCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>- Travelling Charges</span>
                        <span>₹{client.companySplit.travellingCharges.toLocaleString()}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className={`flex justify-between font-bold text-lg ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        <span>Net Profit</span>
                        <span>₹{netProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
