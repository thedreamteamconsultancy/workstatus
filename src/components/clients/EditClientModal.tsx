import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Phone, Briefcase, DollarSign, Users, Video, Image, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Client, ProjectType, SocialMediaCommitment, Gem } from '@/types';

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Client>) => void;
  gems: Gem[];
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'social_media_management', label: 'Social Media Management' },
  { value: 'ads', label: 'Ads' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'ads_digital_marketing', label: 'Ads & Digital Marketing' },
  { value: 'custom', label: '+ Custom' },
];

export const EditClientModal: React.FC<EditClientModalProps> = ({ 
  client,
  isOpen, 
  onClose, 
  onSubmit,
  gems 
}) => {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('website');
  const [customProjectType, setCustomProjectType] = useState('');
  
  // Social Media Commitment
  const [realVideos, setRealVideos] = useState('');
  const [aiVideos, setAiVideos] = useState('');
  const [posters, setPosters] = useState('');
  const [digitalMarketingViews, setDigitalMarketingViews] = useState('');
  
  // Financial
  const [totalProjectCost, setTotalProjectCost] = useState('');
  
  // Work Split
  const [clientManager, setClientManager] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [assignedGems, setAssignedGems] = useState<string[]>([]);
  
  // Company Split
  const [travellingCharges, setTravellingCharges] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Populate form when client changes
  useEffect(() => {
    if (client) {
      setBusinessName(client.businessName);
      setPhone(client.phone);
      setProjectType(client.projectType);
      setCustomProjectType(client.customProjectType || '');
      setRealVideos(client.socialMediaCommitment?.realVideos?.toString() || '');
      setAiVideos(client.socialMediaCommitment?.aiVideos?.toString() || '');
      setPosters(client.socialMediaCommitment?.posters?.toString() || '');
      setDigitalMarketingViews(client.socialMediaCommitment?.digitalMarketingViews?.toString() || '');
      setTotalProjectCost(client.totalProjectCost.toString());
      setClientManager(client.workSplit.clientManager);
      setProjectManager(client.workSplit.projectManager);
      setAssignedGems(client.workSplit.assignedGems);
      setTravellingCharges(client.companySplit.travellingCharges.toString());
    }
  }, [client]);

  const handleGemToggle = (gemId: string) => {
    setAssignedGems(prev => 
      prev.includes(gemId) 
        ? prev.filter(id => id !== gemId)
        : [...prev, gemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    
    setLoading(true);
    
    try {
      const socialMediaCommitment: SocialMediaCommitment | undefined = 
        projectType === 'social_media_management' 
          ? { 
              realVideos: Number(realVideos) || 0, 
              aiVideos: Number(aiVideos) || 0, 
              posters: Number(posters) || 0, 
              digitalMarketingViews: Number(digitalMarketingViews) || 0 
            }
          : undefined;
      
      await onSubmit(client.id, {
        businessName,
        phone,
        projectType,
        customProjectType: projectType === 'custom' ? customProjectType : null,
        socialMediaCommitment,
        totalProjectCost: Number(totalProjectCost) || 0,
        workSplit: {
          clientManager,
          projectManager,
          assignedGems,
        },
        companySplit: {
          ...client.companySplit,
          travellingCharges: Number(travellingCharges) || 0,
        },
      });
      
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const workSplitAmount = (Number(totalProjectCost) || 0) * 0.5;
  const companySplitAmount = (Number(totalProjectCost) || 0) * 0.5;

  if (!client) return null;

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
            className="w-full max-w-2xl my-4 sm:my-8"
          >
            <Card variant="elevated" className="border-primary/20 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <CardHeader className="relative sticky top-0 bg-card z-10 p-4 sm:p-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-3 sm:mb-4 shadow-soft">
                  <Pencil className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Edit Client</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">Update client information</p>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                      <Building2 className="w-4 h-4" />
                      Business Information
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-businessName" className="text-sm">Business Name</Label>
                        <Input
                          id="edit-businessName"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Company Name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone" className="text-sm">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="edit-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 9876543210"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Project Type</Label>
                      <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {projectType === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-customType" className="text-sm">Custom Project Type</Label>
                        <Input
                          id="edit-customType"
                          value={customProjectType}
                          onChange={(e) => setCustomProjectType(e.target.value)}
                          placeholder="Enter custom project type"
                          required
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Social Media Commitment (Only for Social Media Management) */}
                  {projectType === 'social_media_management' && (
                    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-secondary/30 border border-border">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                        <Video className="w-4 h-4" />
                        Project Commitment
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-realVideos" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <Video className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            Real Videos
                          </Label>
                          <Input
                            id="edit-realVideos"
                            type="number"
                            min="0"
                            value={realVideos}
                            onChange={(e) => setRealVideos(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-aiVideos" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <Video className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
                            AI Videos
                          </Label>
                          <Input
                            id="edit-aiVideos"
                            type="number"
                            min="0"
                            value={aiVideos}
                            onChange={(e) => setAiVideos(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-posters" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <Image className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                            Posters
                          </Label>
                          <Input
                            id="edit-posters"
                            type="number"
                            min="0"
                            value={posters}
                            onChange={(e) => setPosters(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-views" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-info" />
                            Views/Video
                          </Label>
                          <Input
                            id="edit-views"
                            type="number"
                            min="0"
                            value={digitalMarketingViews}
                            onChange={(e) => setDigitalMarketingViews(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Financial Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                      <DollarSign className="w-4 h-4" />
                      Financial Information
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-totalCost" className="text-sm">Total Project Cost (₹)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          id="edit-totalCost"
                          type="number"
                          min="0"
                          value={totalProjectCost}
                          onChange={(e) => setTotalProjectCost(e.target.value)}
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>
                    
                    {Number(totalProjectCost) > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg bg-secondary/30">
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-muted-foreground">Work (50%)</p>
                          <p className="text-base sm:text-lg font-bold text-foreground">₹{workSplitAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-muted-foreground">Company (50%)</p>
                          <p className="text-base sm:text-lg font-bold text-foreground">₹{companySplitAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Work Split (Admin Only) */}
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                      <Users className="w-4 h-4" />
                      Work Split (50%) - Team Assignment
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-clientManager" className="text-sm">Client Manager</Label>
                        <Input
                          id="edit-clientManager"
                          value={clientManager}
                          onChange={(e) => setClientManager(e.target.value)}
                          placeholder="Manager name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-projectManager" className="text-sm">Project Manager</Label>
                        <Input
                          id="edit-projectManager"
                          value={projectManager}
                          onChange={(e) => setProjectManager(e.target.value)}
                          placeholder="Manager name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Assigned Gems</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 rounded-lg bg-background/50">
                        {gems.length > 0 ? gems.map(gem => (
                          <div key={gem.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`edit-gem-${gem.id}`}
                              checked={assignedGems.includes(gem.id)}
                              onCheckedChange={() => handleGemToggle(gem.id)}
                            />
                            <Label htmlFor={`edit-gem-${gem.id}`} className="text-xs sm:text-sm cursor-pointer">
                              {gem.name}
                            </Label>
                          </div>
                        )) : (
                          <p className="text-xs sm:text-sm text-muted-foreground col-span-full">No gems available</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Split */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                      <Briefcase className="w-4 h-4" />
                      Company Split (50%) - Costs
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-travellingCharges" className="text-sm">Travelling Charges for Shooting (₹)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          id="edit-travellingCharges"
                          type="number"
                          min="0"
                          value={travellingCharges}
                          onChange={(e) => setTravellingCharges(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      * Digital Marketing Costs can be managed from the client detail view
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
