import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ExternalLink, Upload, AlertTriangle, CheckCircle2, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  canUpdateStatus?: boolean;
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

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateStatus,
  canUpdateStatus = true 
}) => {
  if (!task) return null;

  const deadline = new Date(task.deadline);
  const isOverdue = isPast(deadline) && !isToday(deadline);
  const timeRemaining = isOverdue 
    ? `Overdue by ${formatDistanceToNow(deadline)}`
    : isToday(deadline)
      ? `Due today at ${format(deadline, 'h:mm a')}`
      : formatDistanceToNow(deadline, { addSuffix: true });

  const statuses: TaskStatus[] = ['pending', 'ongoing', 'completed', 'delayed'];

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Badge variant={priorityConfig[task.priority].variant} className="text-xs">
                    {priorityConfig[task.priority].label}
                  </Badge>
                  <Badge variant={statusConfig[task.status].variant} className="text-xs">
                    {statusConfig[task.status].icon}
                    <span className="ml-1">{statusConfig[task.status].label}</span>
                  </Badge>
                </div>
                
                <CardTitle className="text-lg sm:text-2xl pr-8 sm:pr-10">{task.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
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
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                      <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Time Remaining</p>
                      <p className={`font-medium text-sm sm:text-base ${isOverdue ? 'text-destructive' : ''}`}>{timeRemaining}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">Description</h4>
                    <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                {/* Links */}
                {(task.assetUrl || task.uploadUrl) && (
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

                {/* Status Update */}
                {canUpdateStatus && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Update Status</h4>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {statuses.map((status) => (
                        <Button
                          key={status}
                          variant={task.status === status ? 'default' : 'outline'}
                          size="sm"
                          className="justify-start text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                          onClick={() => onUpdateStatus(task.id, status)}
                        >
                          {statusConfig[status].icon}
                          <span className="ml-1.5 sm:ml-2 truncate">{statusConfig[status].label}</span>
                        </Button>
                      ))}
                    </div>
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
