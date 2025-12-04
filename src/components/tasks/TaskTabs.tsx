import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, History } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskCard } from './TaskCard';
import { Task, TaskCategory, Client } from '@/types';

interface TaskTabsProps {
  presentTasks: Task[];
  futureTasks: Task[];
  pastTasks: Task[];
  onTaskClick: (task: Task) => void;
  clients?: Client[];
}

const EmptyState: React.FC<{ category: TaskCategory }> = ({ category }) => {
  const config = {
    present: { icon: <Clock className="w-8 h-8 sm:w-12 sm:h-12" />, text: 'No tasks due today' },
    future: { icon: <Calendar className="w-8 h-8 sm:w-12 sm:h-12" />, text: 'No upcoming tasks' },
    past: { icon: <History className="w-8 h-8 sm:w-12 sm:h-12" />, text: 'No past tasks' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-10 sm:py-16 text-muted-foreground"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary flex items-center justify-center mb-3 sm:mb-4">
        {config[category].icon}
      </div>
      <p className="text-base sm:text-lg font-medium">{config[category].text}</p>
      <p className="text-xs sm:text-sm text-center">Tasks will appear here when they're assigned</p>
    </motion.div>
  );
};

export const TaskTabs: React.FC<TaskTabsProps> = ({
  presentTasks,
  futureTasks,
  pastTasks,
  onTaskClick,
  clients = [],
}) => {
  return (
    <Tabs defaultValue="present" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4 sm:mb-6 h-10 sm:h-12 bg-secondary/50 p-1 rounded-xl">
        <TabsTrigger value="present" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Today</span>
          {presentTasks.length > 0 && (
            <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {presentTasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="future" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Upcoming</span>
          {futureTasks.length > 0 && (
            <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {futureTasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="past" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">Past</span>
          {pastTasks.length > 0 && (
            <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-muted-foreground/20 text-muted-foreground rounded-full">
              {pastTasks.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="present">
        {presentTasks.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {presentTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} clients={clients} />
            ))}
          </div>
        ) : (
          <EmptyState category="present" />
        )}
      </TabsContent>

      <TabsContent value="future">
        {futureTasks.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {futureTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} clients={clients} />
            ))}
          </div>
        ) : (
          <EmptyState category="future" />
        )}
      </TabsContent>

      <TabsContent value="past">
        {pastTasks.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {pastTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} index={index} clients={clients} />
            ))}
          </div>
        ) : (
          <EmptyState category="past" />
        )}
      </TabsContent>
    </Tabs>
  );
};
