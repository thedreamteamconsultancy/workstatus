import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, History } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskCard } from './TaskCard';
import { Task, TaskCategory } from '@/types';

interface TaskTabsProps {
  presentTasks: Task[];
  futureTasks: Task[];
  pastTasks: Task[];
  onTaskClick: (task: Task) => void;
}

const EmptyState: React.FC<{ category: TaskCategory }> = ({ category }) => {
  const config = {
    present: { icon: <Clock className="w-12 h-12" />, text: 'No tasks due today' },
    future: { icon: <Calendar className="w-12 h-12" />, text: 'No upcoming tasks' },
    past: { icon: <History className="w-12 h-12" />, text: 'No past tasks' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-muted-foreground"
    >
      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        {config[category].icon}
      </div>
      <p className="text-lg font-medium">{config[category].text}</p>
      <p className="text-sm">Tasks will appear here when they're assigned</p>
    </motion.div>
  );
};

export const TaskTabs: React.FC<TaskTabsProps> = ({
  presentTasks,
  futureTasks,
  pastTasks,
  onTaskClick,
}) => {
  return (
    <Tabs defaultValue="present" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-6 h-12 bg-secondary/50 p-1 rounded-xl">
        <TabsTrigger value="present" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
          <Clock className="w-4 h-4 mr-2" />
          Today
          {presentTasks.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {presentTasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="future" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
          <Calendar className="w-4 h-4 mr-2" />
          Upcoming
          {futureTasks.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {futureTasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
          <History className="w-4 h-4 mr-2" />
          Past
          {pastTasks.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-muted-foreground/20 text-muted-foreground rounded-full">
              {pastTasks.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="present">
        {presentTasks.length > 0 ? (
          <div className="space-y-3">
            {presentTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState category="present" />
        )}
      </TabsContent>

      <TabsContent value="future">
        {futureTasks.length > 0 ? (
          <div className="space-y-3">
            {futureTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState category="future" />
        )}
      </TabsContent>

      <TabsContent value="past">
        {pastTasks.length > 0 ? (
          <div className="space-y-3">
            {pastTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState category="past" />
        )}
      </TabsContent>
    </Tabs>
  );
};
