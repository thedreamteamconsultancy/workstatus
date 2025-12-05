import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, TaskStatus, TaskCategory, CommitmentType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { isPast } from 'date-fns';

interface UseTasksOptions {
  gemId?: string;
  skipFetch?: boolean; // When true, don't fetch any tasks (useful when waiting for auth)
}

export const useTasks = (gemIdOrOptions?: string | UseTasksOptions) => {
  // Handle both old API (just gemId string) and new API (options object)
  const options = typeof gemIdOrOptions === 'string' 
    ? { gemId: gemIdOrOptions, skipFetch: false }
    : gemIdOrOptions || {};
  
  const { gemId, skipFetch = false } = options;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If skipFetch is true, don't fetch anything and keep loading true
    if (skipFetch) {
      setTasks([]);
      setLoading(true);
      return;
    }

    let q;
    if (gemId) {
      q = query(
        collection(db, 'tasks'),
        where('gemId', '==', gemId),
        orderBy('deadline', 'asc')
      );
    } else {
      q = query(collection(db, 'tasks'), orderBy('deadline', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData: Task[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        delayedAt: doc.data().delayedAt?.toDate() || undefined,
      } as Task));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gemId, skipFetch]);

  // Auto-mark overdue tasks as delayed
  // Track tasks being processed to prevent duplicate operations
  const processingTasksRef = useRef<Set<string>>(new Set());
  
  const markTaskAsDelayed = useCallback(async (taskId: string) => {
    // Skip if already processing this task
    if (processingTasksRef.current.has(taskId)) {
      return;
    }
    
    try {
      processingTasksRef.current.add(taskId);
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'delayed',
        priority: 'urgent', // Delayed tasks should always be urgent
        delayedAt: Timestamp.now(),
        autoDelayed: true,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error auto-marking task as delayed:', error);
    } finally {
      // Remove from processing set after a delay to prevent rapid re-processing
      setTimeout(() => {
        processingTasksRef.current.delete(taskId);
      }, 5000);
    }
  }, []);

  // Check and auto-delay overdue tasks periodically
  useEffect(() => {
    const checkOverdueTasks = () => {
      tasks.forEach(task => {
        // Only auto-delay if: task is overdue, not completed, and not already delayed
        if (
          task.status !== 'completed' && 
          task.status !== 'delayed' && 
          isPast(new Date(task.deadline))
        ) {
          markTaskAsDelayed(task.id);
        }
      });
    };

    // Check immediately
    if (tasks.length > 0) {
      checkOverdueTasks();
    }

    // Check every minute
    const interval = setInterval(checkOverdueTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks, markTaskAsDelayed]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now();
      
      // Filter out undefined values - Firebase doesn't accept undefined
      const cleanedData: Record<string, any> = {
        gemId: taskData.gemId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        deadline: Timestamp.fromDate(taskData.deadline),
        driveMode: taskData.driveMode || 'fixed', // Default to fixed drive
        createdAt: now,
        updatedAt: now,
      };
      
      // Only add URL fields if drive mode is dynamic and they have a value
      if (taskData.driveMode === 'dynamic') {
        if (taskData.assetUrl && taskData.assetUrl.trim() !== '') {
          cleanedData.assetUrl = taskData.assetUrl.trim();
        }
        if (taskData.uploadUrl && taskData.uploadUrl.trim() !== '') {
          cleanedData.uploadUrl = taskData.uploadUrl.trim();
        }
      }
      
      // Add client linking fields if provided
      if (taskData.clientId && taskData.clientId.trim() !== '') {
        cleanedData.clientId = taskData.clientId.trim();
      }
      if (taskData.commitmentType) {
        cleanedData.commitmentType = taskData.commitmentType;
      }
      // Add quantity if provided
      if (taskData.quantity && taskData.quantity > 0) {
        cleanedData.quantity = taskData.quantity;
      }
      // Admin verified starts as false for new tasks
      if (taskData.clientId) {
        cleanedData.adminVerified = false;
      }
      
      await addDoc(collection(db, 'tasks'), cleanedData);
      
      toast({
        title: "Task Created",
        description: `"${taskData.title}" has been assigned.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updateData: Record<string, any> = {
        status,
        updatedAt: Timestamp.now(),
      };
      
      // When status is delayed, automatically set priority to urgent
      if (status === 'delayed') {
        updateData.priority = 'urgent';
        updateData.delayedAt = Timestamp.now();
      }
      
      await updateDoc(doc(db, 'tasks', taskId), updateData);
      
      toast({
        title: "Status Updated",
        description: status === 'delayed' 
          ? "Task marked as delayed and priority set to urgent."
          : `Task status changed to ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Admin verify a completed task - marks the deliverable as counted towards progress
  const verifyTask = async (taskId: string, verified: boolean) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        adminVerified: verified,
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: verified ? "Task Verified" : "Verification Removed",
        description: verified 
          ? "Task has been verified and counted towards project progress."
          : "Task verification has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify task",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get progress for a specific client by commitment type
  const getClientProgress = (clientId: string) => {
    const clientTasks = tasks.filter(t => t.clientId === clientId);
    
    const progress: Record<CommitmentType, { completed: number; verified: number; total: number; assigned: number }> = {
      realVideo: { completed: 0, verified: 0, total: 0, assigned: 0 },
      aiVideo: { completed: 0, verified: 0, total: 0, assigned: 0 },
      poster: { completed: 0, verified: 0, total: 0, assigned: 0 },
      digitalMarketing: { completed: 0, verified: 0, total: 0, assigned: 0 },
      other: { completed: 0, verified: 0, total: 0, assigned: 0 },
    };
    
    clientTasks.forEach(task => {
      if (task.commitmentType) {
        const qty = task.quantity || 1; // Default to 1 for backward compatibility
        const completedQty = task.completedQuantity || (task.status === 'completed' ? qty : 0);
        progress[task.commitmentType].total++;
        progress[task.commitmentType].assigned += qty;
        // Use completedQuantity for partial progress tracking
        progress[task.commitmentType].completed += completedQty;
        if (task.adminVerified) {
          progress[task.commitmentType].verified += completedQty;
        }
      }
    });
    
    return progress;
  };

  // Get tasks by client
  const getTasksByClient = (clientId: string) => {
    return tasks.filter(t => t.clientId === clientId);
  };

  // Update task
  const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updateData: Record<string, any> = {
        ...taskData,
        updatedAt: Timestamp.now(),
      };
      
      // Handle deadline conversion if provided
      if (taskData.deadline) {
        updateData.deadline = Timestamp.fromDate(taskData.deadline);
      }
      
      await updateDoc(doc(db, 'tasks', taskId), updateData);
      
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update completed quantity (for gems to report partial progress)
  const updateCompletedQuantity = async (taskId: string, completedQuantity: number) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completedQuantity,
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: "Progress Updated",
        description: `Completed ${completedQuantity} items.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress",
        variant: "destructive",
      });
      throw error;
    }
  };

  const categorizeTask = (task: Task): TaskCategory => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    
    // If task is overdue (past deadline)
    if (taskDate < today) {
      // Incomplete tasks should stay in "Today" (present) - they need immediate attention
      // Only completed tasks go to "Past"
      if (task.status === 'completed') {
        return 'past';
      }
      // Overdue but not completed - show in Today
      return 'present';
    }
    
    // Task is due today
    if (taskDate.getTime() === today.getTime()) return 'present';
    
    // Task is in the future
    return 'future';
  };

  const getTasksByCategory = (category: TaskCategory) => {
    return tasks.filter(task => categorizeTask(task) === category);
  };

  return { 
    tasks, 
    loading, 
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateCompletedQuantity,
    verifyTask,
    categorizeTask,
    getTasksByCategory,
    getClientProgress,
    getTasksByClient,
    presentTasks: getTasksByCategory('present'),
    futureTasks: getTasksByCategory('future'),
    pastTasks: getTasksByCategory('past'),
  };
};
