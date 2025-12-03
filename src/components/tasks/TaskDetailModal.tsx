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
  pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, variant: 'pending' },
  ongoing: { label: 'In Progress', icon: <Loader2 className="w-4 h-4 animate-spin" />, variant: 'ongoing' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" />, variant: 'completed' },
  delayed: { label: 'Delayed', icon: <AlertTriangle className="w-4 h-4" />, variant: 'delayed' },
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg my-8"
          >
            <Card variant="elevated" className="border-primary/20">
              <CardHeader className="relative pb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={priorityConfig[task.priority].variant}>
                    {priorityConfig[task.priority].label}
                  </Badge>
                  <Badge variant={statusConfig[task.status].variant}>
                    {statusConfig[task.status].icon}
                    <span className="ml-1">{statusConfig[task.status].label}</span>
                  </Badge>
                </div>
                
                <CardTitle className="text-2xl pr-10">{task.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Time Information */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-medium">{format(deadline, 'PPP')}</p>
                      <p className="text-sm text-muted-foreground">{format(deadline, 'h:mm a')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                      <Timer className={`w-5 h-5 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time Remaining</p>
                      <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>{timeRemaining}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                    <p className="text-foreground whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                {/* Links */}
                {(task.assetUrl || task.uploadUrl) && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {task.assetUrl && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(task.assetUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Assets
                      </Button>
                    )}
                    {task.uploadUrl && (
                      <Button
                        variant="outline"
                        className="flex-1"
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Update Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {statuses.map((status) => (
                        <Button
                          key={status}
                          variant={task.status === status ? 'default' : 'outline'}
                          size="sm"
                          className="justify-start"
                          onClick={() => onUpdateStatus(task.id, status)}
                        >
                          {statusConfig[status].icon}
                          <span className="ml-2">{statusConfig[status].label}</span>
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
