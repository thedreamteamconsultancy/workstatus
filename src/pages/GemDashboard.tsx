import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { TaskTabs } from '@/components/tasks/TaskTabs';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskStatus } from '@/types';

const motivationalQuotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Every accomplishment starts with the decision to try.",
  "Your limitation—it's only your imagination.",
];

const GemDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Filter tasks by the logged-in gem's ID
  const { 
    tasks,
    presentTasks, 
    futureTasks, 
    pastTasks, 
    updateTaskStatus 
  } = useTasks(user?.role === 'gem' ? user.id : undefined);

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
    setSelectedTask(prev => prev ? { ...prev, status } : null);
  };

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const ongoingTasks = tasks.filter(t => t.status === 'ongoing').length;

  return (
    <Layout>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <Card variant="elevated" className="overflow-hidden border-primary/20">
          <CardContent className="p-0">
            <div className="relative bg-gradient-hero text-primary-foreground p-4 sm:p-6 lg:p-8">
              {/* Background decorations */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  <span className="text-xs sm:text-sm text-primary-foreground/80">Good to see you!</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 sm:mb-3">
                  Welcome back, {user?.name || 'Gem'}
                </h1>
                <p className="text-primary-foreground/80 text-sm sm:text-base lg:text-lg max-w-2xl line-clamp-3 sm:line-clamp-none">
                  "{randomQuote}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard
          title="Today's Tasks"
          value={presentTasks.length}
          icon={Target}
          variant="primary"
          index={0}
        />
        <StatsCard
          title="In Progress"
          value={ongoingTasks}
          icon={TrendingUp}
          variant="warning"
          index={1}
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle}
          variant="success"
          index={2}
        />
        <StatsCard
          title="Upcoming"
          value={futureTasks.length}
          icon={Sparkles}
          variant="default"
          index={3}
        />
      </div>

      {/* Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Your Tasks</h2>
        <TaskTabs
          presentTasks={presentTasks}
          futureTasks={futureTasks}
          pastTasks={pastTasks}
          onTaskClick={setSelectedTask}
        />
      </motion.div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={handleUpdateStatus}
        canUpdateStatus={true}
      />
    </Layout>
  );
};

export default GemDashboard;
