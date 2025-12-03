import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, User, Phone, Mail } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Layout } from '@/components/layout/Layout';
import { TaskTabs } from '@/components/tasks/TaskTabs';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { Gem, Task, TaskStatus } from '@/types';

const GemPanel: React.FC = () => {
  const { gemId } = useParams<{ gemId: string }>();
  const navigate = useNavigate();
  
  const [gem, setGem] = useState<Gem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { 
    tasks,
    presentTasks, 
    futureTasks, 
    pastTasks, 
    createTask, 
    updateTaskStatus 
  } = useTasks(gemId);

  useEffect(() => {
    const fetchGem = async () => {
      if (!gemId) return;
      
      try {
        const gemDoc = await getDoc(doc(db, 'gems', gemId));
        if (gemDoc.exists()) {
          setGem({ id: gemDoc.id, ...gemDoc.data() } as Gem);
        }
      } catch (error) {
        console.error('Error fetching gem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGem();
  }, [gemId]);

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    deadline: Date;
    priority: 'low' | 'medium' | 'urgent';
    assetUrl?: string;
    uploadUrl?: string;
  }) => {
    if (!gemId) return;
    
    await createTask({
      ...data,
      gemId,
      status: 'pending',
    });
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
    setSelectedTask(prev => prev ? { ...prev, status } : null);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading gem data..." />;
  }

  if (!gem) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Gem not found</h2>
          <Button onClick={() => navigate('/admin')}>Return to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button variant="ghost" onClick={() => navigate('/admin')} className="-ml-2">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
      </motion.div>

      {/* Gem Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <Card variant="elevated">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-xl sm:text-2xl">
                    {gem.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{gem.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{gem.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{gem.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="gradient" className="w-full sm:w-auto" onClick={() => setShowCreateTask(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Create Task
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{presentTasks.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{futureTasks.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{tasks.filter(t => t.status === 'completed').length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TaskTabs
          presentTasks={presentTasks}
          futureTasks={futureTasks}
          pastTasks={pastTasks}
          onTaskClick={setSelectedTask}
        />
      </motion.div>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={handleCreateTask}
        gemName={gem.name}
      />
    </Layout>
  );
};

export default GemPanel;
