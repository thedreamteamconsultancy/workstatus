import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2, Timer, ExternalLink, Building2, ShieldCheck, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskPriority, TaskStatus, Client, getCommitmentUnitLabel } from '@/types';
import { CompactCountdownTimer } from '@/components/common/CountdownTimer';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  index: number;
  compact?: boolean;
  clients?: Client[];
}

const priorityConfig: Record<TaskPriority, { icon: React.ReactNode; label: string }> = {
  low: { icon: <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, label: 'Low' },
  medium: { icon: <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, label: 'Medium' },
  urgent: { icon: <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, label: 'Urgent' },
};

const statusConfig: Record<TaskStatus, { label: string; variant: 'pending' | 'ongoing' | 'completed' | 'delayed' }> = {
  pending: { label: 'Pending', variant: 'pending' },
  ongoing: { label: 'In Progress', variant: 'ongoing' },
  completed: { label: 'Completed', variant: 'completed' },
  delayed: { label: 'Delayed', variant: 'delayed' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, index, compact = false, clients = [] }) => {
  const linkedClient = task.clientId ? clients.find(c => c.id === task.clientId) : null;
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        variant="elevated" 
        className="group hover:border-primary/30 cursor-pointer transition-all duration-200"
        onClick={() => onClick(task)}
      >
        <CardContent className={compact ? "p-3 sm:p-4" : "p-4 sm:p-5"}>
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold text-foreground ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} line-clamp-2`}>
                {task.title}
              </h3>
              {linkedClient && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <Building2 className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-500 truncate">{linkedClient.businessName}</span>
                  {task.quantity && task.quantity > 1 && task.commitmentType && (
                    <span className="flex items-center gap-0.5 text-xs text-orange-500 ml-1">
                      <Hash className="w-3 h-3" />
                      {task.completedQuantity || 0}/{task.quantity} {getCommitmentUnitLabel(task.commitmentType, task.quantity)}
                    </span>
                  )}
                  {task.adminVerified && (
                    <ShieldCheck className="w-3 h-3 text-emerald-500 ml-1" />
                  )}
                </div>
              )}
            </div>
            <Badge 
              variant={task.priority === 'urgent' ? 'urgent' : task.priority === 'medium' ? 'warning' : 'success'}
              className="text-xs flex-shrink-0"
            >
              {priorityConfig[task.priority].icon}
              <span className="ml-1 hidden sm:inline">{priorityConfig[task.priority].label}</span>
            </Badge>
          </div>

          {!compact && task.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Badge variant={statusConfig[task.status].variant} className="text-xs">
                {statusConfig[task.status].label}
              </Badge>
              {!isCompleted && (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                  <CompactCountdownTimer deadline={new Date(task.deadline)} />
                </div>
              )}
            </div>

            {(task.assetUrl || task.uploadUrl) && (
              <div className="flex items-center gap-1">
                {task.assetUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(task.assetUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="ml-1 hidden sm:inline">Assets</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
