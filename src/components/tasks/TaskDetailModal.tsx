import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ExternalLink, Upload, AlertTriangle, CheckCircle2, Loader2, Timer, Building2, Target, ShieldCheck, ShieldOff, Pencil, Trash2, Hash, AlertCircle, HardDrive, FolderSync } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus, TaskPriority, Client, getCommitmentUnitLabel } from '@/types';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { CountdownTimer } from '@/components/common/CountdownTimer';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onVerifyTask?: (taskId: string, verified: boolean) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateCompletedQuantity?: (taskId: string, completedQuantity: number) => void;
  canUpdateStatus?: boolean;
  isAdmin?: boolean;
  clients?: Client[];
  gemFixedDriveUrl?: string; // The gem's pre-assigned drive folder URL
}

const statusConfig: Record<TaskStatus, { label: string; icon: React.ReactNode; variant: 'pending' | 'ongoing' | 'completed' | 'delayed' }> = {
  pending: { label: 'Pending', icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, variant: 'pending' },
  ongoing: { label: 'In Progress', icon: <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />, variant: 'ongoing' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, variant: 'completed' },
  delayed: { label: 'Delayed', icon: <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, variant: 'delayed' },
};

const priorityConfig: Record<TaskPriority, { label: string; variant: 'success' | 'warning' | 'urgent' }> = {
  low: { label: 'Low Priority', variant: 'success' },
  medium: { label: 'Medium Priority', variant: 'warning' },
  urgent: { label: 'Urgent Priority', variant: 'urgent' },
};

const commitmentTypeLabels: Record<string, string> = {
  realVideo: 'Real Video',
  aiVideo: 'AI Video',
  poster: 'Poster',
  digitalMarketing: 'Digital Marketing',
  other: 'General Task',
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateStatus,
  onVerifyTask,
  onEditTask,
  onDeleteTask,
  onUpdateCompletedQuantity,
  canUpdateStatus = true,
  isAdmin = false,
  clients = [],
  gemFixedDriveUrl
}) => {
  const [localCompletedQty, setLocalCompletedQty] = React.useState<number>(0);

  // Sync local state with task
  React.useEffect(() => {
    if (task) {
      setLocalCompletedQty(task.completedQuantity || 0);
    }
  }, [task]);
  if (!task) return null;

  const deadline = new Date(task.deadline);
  const isOverdue = isPast(deadline) && !isToday(deadline);
  const isCompleted = task.status === 'completed';
  const isDelayed = task.status === 'delayed';

  const statuses: TaskStatus[] = ['pending', 'ongoing', 'completed', 'delayed'];
  
  // Get linked client if any
  const linkedClient = task.clientId ? clients.find(c => c.id === task.clientId) : null;

  // Calculate delay duration if task was delayed
  const getDelayInfo = () => {
    if (!isDelayed || !task.delayedAt) return null;
    const delayedAt = new Date(task.delayedAt);
    return formatDistanceToNow(deadline, { addSuffix: false });
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
              <CardHeader className="relative pb-3 sm:pb-4 p-4 sm:p-6">
                <div className="absolute right-2 sm:right-4 top-2 sm:top-4 flex items-center gap-1">
                  {isAdmin && onEditTask && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => onEditTask(task)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                  {isAdmin && onDeleteTask && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Badge variant={priorityConfig[task.priority].variant} className="text-xs">
                    {priorityConfig[task.priority].label}
                  </Badge>
                  <Badge variant={statusConfig[task.status].variant} className="text-xs">
                    {statusConfig[task.status].icon}
                    <span className="ml-1">{statusConfig[task.status].label}</span>
                  </Badge>
                  {task.adminVerified && (
                    <Badge variant="success" className="text-xs">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-lg sm:text-2xl pr-8 sm:pr-10">{task.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
                {/* Delayed Task Message */}
                {isDelayed && (
                  <div className="p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-600 mb-1">Task Delayed</h4>
                        <p className="text-xs text-muted-foreground">
                          This task missed its deadline by <span className="font-medium text-amber-600">{getDelayInfo()}</span>.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          💪 Don't worry! Complete this task as soon as possible. Time management improves with practice. You've got this!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Information */}
                <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-medium text-sm sm:text-base">{format(deadline, 'PPP')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{format(deadline, 'h:mm a')}</p>
                    </div>
                  </div>
                  
                  {!isCompleted && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue || isDelayed ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                        <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${isOverdue || isDelayed ? 'text-destructive' : 'text-primary'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {isOverdue || isDelayed ? 'Time Overdue' : 'Time Remaining'}
                        </p>
                        <CountdownTimer deadline={deadline} className="text-sm sm:text-base" />
                      </div>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-medium text-sm sm:text-base text-emerald-500">Task Completed</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Client & Project Info */}
                {linkedClient && (
                  <div className="p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Linked Client</p>
                        <p className="font-medium text-sm sm:text-base text-blue-500">{linkedClient.businessName}</p>
                      </div>
                    </div>
                    {task.commitmentType && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Deliverable: </span>
                        <Badge variant="outline" className="text-xs">
                          {commitmentTypeLabels[task.commitmentType] || task.commitmentType}
                        </Badge>
                        {task.quantity && task.quantity > 0 && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/30">
                            <Hash className="w-3 h-3 mr-1" />
                            {task.completedQuantity || 0}/{task.quantity} {getCommitmentUnitLabel(task.commitmentType, task.quantity)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {task.description && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">Description</h4>
                    <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                {/* Drive Mode & Links */}
                <div className="space-y-3">
                  {/* Fixed Drive - Show clickable button */}
                  {(!task.driveMode || task.driveMode === 'fixed') && (
                    <div className="flex flex-col gap-2">
                      {gemFixedDriveUrl ? (
                        <Button
                          variant="outline"
                          className="w-full text-sm bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20"
                          onClick={() => window.open(gemFixedDriveUrl, '_blank')}
                        >
                          <HardDrive className="w-4 h-4 mr-2" />
                          Your Work Drive
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No drive folder assigned. Contact admin to set up your work drive.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Dynamic Drive Links */}
                  {task.driveMode === 'dynamic' && (task.assetUrl || task.uploadUrl) && (
                    <div className="flex flex-col gap-2 sm:gap-3">
                      {task.assetUrl && (
                        <Button
                          variant="outline"
                          className="w-full text-sm"
                          onClick={() => window.open(task.assetUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Assets
                        </Button>
                      )}
                      {task.uploadUrl && (
                        <Button
                          variant="outline"
                          className="w-full text-sm"
                          onClick={() => window.open(task.uploadUrl, '_blank')}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Completed Quantity Update - For gems with quantity-based tasks */}
                {!isAdmin && canUpdateStatus && task.quantity && task.quantity > 1 && task.commitmentType && onUpdateCompletedQuantity && (
                  <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-2 sm:mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Update Completed Progress
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      How many {getCommitmentUnitLabel(task.commitmentType, task.quantity)} have you completed out of {task.quantity}?
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setLocalCompletedQty(Math.max(0, localCompletedQty - 1))}
                          disabled={localCompletedQty <= 0}
                        >
                          -
                        </Button>
                        <span className="text-lg font-bold min-w-[3rem] text-center">
                          {localCompletedQty} / {task.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setLocalCompletedQty(Math.min(task.quantity, localCompletedQty + 1))}
                          disabled={localCompletedQty >= task.quantity}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => onUpdateCompletedQuantity(task.id, localCompletedQty)}
                        disabled={localCompletedQty === (task.completedQuantity || 0)}
                      >
                        Save Progress
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                {canUpdateStatus && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Update Status</h4>
                    {isDelayed && !isAdmin && (
                      <p className="text-xs text-amber-600 mb-2">
                        ⚠️ This task is delayed. Please complete it as soon as possible.
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {statuses.map((status) => {
                        // If task is delayed and overdue, only allow marking as completed
                        const isDisabled = isDelayed && isOverdue && status !== 'completed' && status !== 'delayed';
                        return (
                          <Button
                            key={status}
                            variant={task.status === status ? 'default' : 'outline'}
                            size="sm"
                            className={`justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 ${isDisabled ? 'opacity-50' : ''}`}
                            onClick={() => onUpdateStatus(task.id, status)}
                            disabled={isDisabled}
                          >
                            {statusConfig[status].icon}
                            <span className="ml-1.5 sm:ml-2 truncate">{statusConfig[status].label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin Verification - Only show for completed tasks linked to clients */}
                {isAdmin && task.clientId && task.status === 'completed' && onVerifyTask && (
                  <div className="pt-2 border-t border-border">
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Admin Verification</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Verify this task to count it towards the client's project progress.
                    </p>
                    {task.adminVerified ? (
                      <Button
                        variant="outline"
                        className="w-full text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
                        onClick={() => onVerifyTask(task.id, false)}
                      >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Remove Verification
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => onVerifyTask(task.id, true)}
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Verify & Count Progress
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
