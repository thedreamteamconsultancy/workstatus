import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, User, Phone, Mail, MessageCircle, Send, HardDrive } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Layout } from '@/components/layout/Layout';
import { TaskTabs } from '@/components/tasks/TaskTabs';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { WhatsAppMessageModal } from '@/components/common/WhatsAppMessageModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { Gem, Task, TaskStatus, CommitmentType, TaskPriority, TaskNote } from '@/types';

// Key for saving custom messages in localStorage
const CUSTOM_MESSAGES_KEY = 'workstatus_custom_messages';

// WhatsApp utility functions
const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
};

// Get raw phone number without country code (for password display)
const getRawPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  // If starts with 91 and is 12 digits, remove the 91 prefix
  if (digits.startsWith('91') && digits.length === 12) {
    return digits.substring(2);
  }
  // If it's 10 digits, return as-is
  if (digits.length === 10) {
    return digits;
  }
  // Return original digits if format is unknown
  return digits;
};

const openWhatsAppChat = (phone: string) => {
  const phoneNumber = formatPhoneNumber(phone);
  window.open(`https://wa.me/${phoneNumber}`, '_blank');
};

const sendCredentialsMessage = (gem: { name: string; email: string; phone: string; password?: string }) => {
  const phoneNumber = formatPhoneNumber(gem.phone);
  // Use the actual password from the gem record, or fall back to phone number if password not available
  const passwordToSend = gem.password && gem.password.trim() ? gem.password : getRawPhoneNumber(gem.phone);
  const message = `🌟 *Welcome to the Team, ${gem.name.split(' ')[0]}!* 🌟\n\nWe're thrilled to have you onboard! Your talent and dedication are about to shine. 💎\n\n🔐 *Your Login Credentials*\n\n🌐 Platform: https://workstatus-dts.vercel.app/\n📧 Email: ${gem.email}\n🔑 Password: ${passwordToSend}\n\n✨ Pro Tips:\n• Bookmark the platform link for easy access\n• Keep your credentials safe and private\n• Check your dashboard daily for new tasks\n\nYou've got this! Let's achieve greatness together! 🚀\n\nBest regards,\nThe Dream Team 💜`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};

const GemPanel: React.FC = () => {
  const { gemId } = useParams<{ gemId: string }>();
  const navigate = useNavigate();
  
  const [gem, setGem] = useState<Gem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [messageTask, setMessageTask] = useState<Task | null>(null);
  const [savedCustomMessages, setSavedCustomMessages] = useState<string[]>([]);

  // Load saved custom messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CUSTOM_MESSAGES_KEY);
    if (saved) {
      setSavedCustomMessages(JSON.parse(saved));
    }
  }, []);

  const handleSaveCustomMessage = (message: string) => {
    const updated = [...savedCustomMessages, message].slice(-10); // Keep last 10 messages
    setSavedCustomMessages(updated);
    localStorage.setItem(CUSTOM_MESSAGES_KEY, JSON.stringify(updated));
  };

  const { 
    tasks,
    presentTasks, 
    futureTasks, 
    pastTasks, 
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskNotes,
    verifyTask
  } = useTasks(gemId);

  const { clients } = useClients();

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
    clientId?: string;
    commitmentType?: CommitmentType;
    quantity?: number;
    taskNotes?: TaskNote[];
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

  const handleVerifyTask = async (taskId: string, verified: boolean) => {
    await verifyTask(taskId, verified);
    setSelectedTask(prev => prev ? { ...prev, adminVerified: verified } : null);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(null);
    setEditTask(task);
  };

  const handleUpdateTask = async (taskId: string, data: {
    title: string;
    description: string;
    deadline: Date;
    priority: TaskPriority;
    assetUrl?: string;
    uploadUrl?: string;
    clientId?: string;
    commitmentType?: CommitmentType;
    quantity?: number;
    taskNotes?: TaskNote[];
  }) => {
    await updateTask(taskId, data);
    setEditTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(null);
      setTaskToDelete(task);
    }
  };

  const handleUpdateTaskNotes = async (taskId: string, notes: TaskNote[]) => {
    await updateTaskNotes(taskId, notes);
    // Update local selectedTask state for real-time UI update
    setSelectedTask(prev => prev ? { ...prev, taskNotes: notes } : null);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
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

            {/* Action Icon Buttons */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                onClick={() => sendCredentialsMessage(gem)}
                title="Send Credentials"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                onClick={() => openWhatsAppChat(gem.phone)}
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              {gem.fixedDriveUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700"
                  onClick={() => window.open(gem.fixedDriveUrl, '_blank')}
                  title="Open Drive"
                >
                  <HardDrive className="w-4 h-4" />
                </Button>
              )}
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
          onTaskMessage={setMessageTask}
          onTaskEdit={handleEditTask}
          onTaskDelete={(task) => handleDeleteTask(task.id)}
          showMessageButton={true}
          showEditDelete={true}
          clients={clients}
        />
      </motion.div>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={handleUpdateStatus}
        onVerifyTask={handleVerifyTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onUpdateTaskNotes={handleUpdateTaskNotes}
        onMessage={(task) => {
          setSelectedTask(null);
          setMessageTask(task);
        }}
        canAddNotes={true}
        isAdmin={true}
        clients={clients}
        gemFixedDriveUrl={gem?.fixedDriveUrl}
      />

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={handleCreateTask}
        gemName={gem.name}
        clients={clients}
        existingTasks={tasks}
      />

      <EditTaskModal
        task={editTask}
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleUpdateTask}
        clients={clients}
        existingTasks={tasks}
      />

      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {messageTask && gem && (
        <WhatsAppMessageModal
          isOpen={!!messageTask}
          onClose={() => setMessageTask(null)}
          task={messageTask}
          gem={gem}
          savedCustomMessages={savedCustomMessages}
          onSaveCustomMessage={handleSaveCustomMessage}
        />
      )}
    </Layout>
  );
};

export default GemPanel;
