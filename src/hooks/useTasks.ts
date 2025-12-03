import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, TaskStatus, TaskCategory } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useTasks = (gemId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } as Task));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gemId]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        deadline: Timestamp.fromDate(taskData.deadline),
        createdAt: now,
        updatedAt: now,
      });
      
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
      await updateDoc(doc(db, 'tasks', taskId), {
        status,
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: "Status Updated",
        description: `Task status changed to ${status}.`,
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

  const categorizeTask = (task: Task): TaskCategory => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    
    if (taskDate < today) return 'past';
    if (taskDate.getTime() === today.getTime()) return 'present';
    return 'future';
  };

  const getTasksByCategory = (category: TaskCategory) => {
    return tasks.filter(task => categorizeTask(task) === category);
  };

  return { 
    tasks, 
    loading, 
    createTask, 
    updateTaskStatus, 
    categorizeTask,
    getTasksByCategory,
    presentTasks: getTasksByCategory('present'),
    futureTasks: getTasksByCategory('future'),
    pastTasks: getTasksByCategory('past'),
  };
};
