import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, Link, Upload, Building2, Target, Hash, HardDrive, FolderSync } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskPriority, Client, CommitmentType, WORK_TYPES, WorkType, Task, DriveMode } from '@/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    deadline: Date;
    priority: TaskPriority;
    driveMode?: DriveMode;
    assetUrl?: string;
    uploadUrl?: string;
    clientId?: string;
    commitmentType?: CommitmentType;
    quantity?: number;
  }) => void;
  gemName: string;
  clients?: Client[];
  existingTasks?: Task[]; // To calculate remaining commitments
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit, gemName, clients = [], existingTasks = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [driveMode, setDriveMode] = useState<DriveMode>('fixed');
  const [assetUrl, setAssetUrl] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [commitmentType, setCommitmentType] = useState<CommitmentType | ''>('');
  const [workType, setWorkType] = useState<WorkType | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Get selected client to determine available commitment types
  const selectedClient = clients.find(c => c.id === clientId);

  // Calculate already assigned quantities for each commitment type for the selected client
  const assignedQuantities = useMemo(() => {
    if (!clientId) return {};
    
    const clientTasks = existingTasks.filter(t => t.clientId === clientId);
    const assigned: Record<CommitmentType, number> = {
      realVideo: 0,
      aiVideo: 0,
      poster: 0,
      digitalMarketing: 0,
      other: 0,
    };
    
    clientTasks.forEach(task => {
      if (task.commitmentType) {
        assigned[task.commitmentType] += task.quantity || 1;
      }
    });
    
    return assigned;
  }, [clientId, existingTasks]);
  
  // Determine available commitment types based on client's project type
  const getAvailableCommitmentTypes = () => {
    if (!selectedClient) return [];
    
    const projectType = selectedClient.projectType;
    
    if (projectType === 'social_media_management') {
      return [
        { value: 'realVideo' as CommitmentType, label: 'Real Video', target: selectedClient.socialMediaCommitment?.realVideos || 0 },
        { value: 'aiVideo' as CommitmentType, label: 'AI Video', target: selectedClient.socialMediaCommitment?.aiVideos || 0 },
        { value: 'poster' as CommitmentType, label: 'Poster', target: selectedClient.socialMediaCommitment?.posters || 0 },
        { value: 'digitalMarketing' as CommitmentType, label: 'Digital Marketing Views', target: selectedClient.socialMediaCommitment?.digitalMarketingViews || 0 },
      ].filter(ct => ct.target > 0).map(ct => ({
        ...ct,
        assigned: assignedQuantities[ct.value] || 0,
        remaining: ct.target - (assignedQuantities[ct.value] || 0),
      }));
    }
    
    // For other project types, allow "other" commitment
    return [{ value: 'other' as CommitmentType, label: 'General Task', target: 0, assigned: 0, remaining: 999 }];
  };

  // Get remaining quantity for selected commitment type
  const getRemainingQuantity = () => {
    if (!commitmentType || commitmentType === 'other') return 999;
    const types = getAvailableCommitmentTypes();
    const selectedType = types.find(t => t.value === commitmentType);
    return selectedType?.remaining || 0;
  };

  // Reset commitment type and quantity when client changes
  useEffect(() => {
    setCommitmentType('');
    setQuantity(1);
  }, [clientId]);

  // Reset quantity when commitment type changes
  useEffect(() => {
    setQuantity(1);
  }, [commitmentType]);

  // Auto-fill title when work type is selected
  const handleWorkTypeChange = (value: string) => {
    if (value === 'none') {
      setWorkType('');
      return;
    }
    setWorkType(value as WorkType);
    if (value !== 'Other') {
      setTitle(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate quantity doesn't exceed remaining
    const remaining = getRemainingQuantity();
    if (commitmentType && commitmentType !== 'other' && quantity > remaining) {
      return; // Don't submit if exceeds limit
    }
    
    setLoading(true);
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const deadlineDate = new Date(deadline);
      deadlineDate.setHours(hours, minutes, 0, 0);

      await onSubmit({
        title,
        description,
        deadline: deadlineDate,
        priority,
        driveMode,
        assetUrl: driveMode === 'dynamic' && assetUrl ? assetUrl : undefined,
        uploadUrl: driveMode === 'dynamic' && uploadUrl ? uploadUrl : undefined,
        clientId: clientId || undefined,
        commitmentType: commitmentType || undefined,
        quantity: commitmentType ? quantity : undefined,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setTime('09:00');
      setPriority('medium');
      setDriveMode('fixed');
      setAssetUrl('');
      setUploadUrl('');
      setClientId('');
      setCommitmentType('');
      setWorkType('');
      setQuantity(1);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
            className="w-full max-w-lg my-4 sm:my-8"
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
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Create Task</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">Assign a new task to {gemName}</p>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Work Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="workType" className="text-sm">Work Type</Label>
                    <Select value={workType || 'none'} onValueChange={handleWorkTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Custom Task</SelectItem>
                        {WORK_TYPES.map(wt => (
                          <SelectItem key={wt} value={wt}>{wt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">Task Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  {/* Client Selection */}
                  {clients.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="client" className="text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Link to Client (optional)
                          </Label>
                          <Select value={clientId || 'none'} onValueChange={(v) => setClientId(v === 'none' ? '' : v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No client</SelectItem>
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.businessName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Commitment Type - only show for social media clients */}
                        {selectedClient && getAvailableCommitmentTypes().length > 0 && (
                          <div className="space-y-2">
                            <Label htmlFor="commitmentType" className="text-sm flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Commitment Type
                            </Label>
                            <Select value={commitmentType || 'none'} onValueChange={(v) => setCommitmentType(v === 'none' ? '' : v as CommitmentType)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Select type</SelectItem>
                                {getAvailableCommitmentTypes().map(ct => (
                                  <SelectItem 
                                    key={ct.value} 
                                    value={ct.value}
                                    disabled={ct.remaining <= 0 && ct.value !== 'other'}
                                  >
                                    {ct.label} {ct.target > 0 && `(${ct.remaining}/${ct.target} left)`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Quantity Input - Show when commitment type is selected */}
                      {commitmentType && commitmentType !== 'other' && (
                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-sm flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Quantity (Max: {getRemainingQuantity()})
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            min={1}
                            max={getRemainingQuantity()}
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setQuantity(Math.min(val, getRemainingQuantity()));
                            }}
                            className="max-w-[150px]"
                          />
                          {quantity > getRemainingQuantity() && (
                            <p className="text-xs text-destructive">
                              Cannot exceed remaining commitment ({getRemainingQuantity()})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="text-sm">Deadline Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="deadline"
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm">Priority</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the task requirements..."
                      rows={4}
                    />
                  </div>

                  {/* Drive Mode Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Drive Mode
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={driveMode === 'fixed' ? 'default' : 'outline'}
                        className={`h-auto py-2.5 px-3 flex flex-col items-center gap-1 ${driveMode === 'fixed' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setDriveMode('fixed')}
                      >
                        <HardDrive className="w-4 h-4" />
                        <span className="text-xs font-medium">Fixed Drive</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          Use gem's assigned folder
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={driveMode === 'dynamic' ? 'default' : 'outline'}
                        className={`h-auto py-2.5 px-3 flex flex-col items-center gap-1 ${driveMode === 'dynamic' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setDriveMode('dynamic')}
                      >
                        <FolderSync className="w-4 h-4" />
                        <span className="text-xs font-medium">Dynamic Drive</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          Custom URLs for this task
                        </span>
                      </Button>
                    </div>
                    {driveMode === 'fixed' && (
                      <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                        💡 The gem will use their pre-assigned Google Drive folder for assets and uploads.
                      </p>
                    )}
                  </div>

                  {/* Dynamic Drive URLs - Only show when Dynamic mode is selected */}
                  {driveMode === 'dynamic' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="assetUrl" className="text-sm">Assets URL</Label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="assetUrl"
                            value={assetUrl}
                            onChange={(e) => setAssetUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="uploadUrl" className="text-sm">Upload URL</Label>
                        <div className="relative">
                          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="uploadUrl"
                            value={uploadUrl}
                            onChange={(e) => setUploadUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="gradient" className="flex-1 order-1 sm:order-2" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Task'}
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
