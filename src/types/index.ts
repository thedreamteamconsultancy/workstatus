export type UserRole = 'admin' | 'gem';

export type TaskStatus = 'pending' | 'ongoing' | 'completed' | 'delayed';

export type TaskPriority = 'low' | 'medium' | 'urgent';

export type TaskCategory = 'present' | 'future' | 'past';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Gem {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  createdAt: Date;
  userId?: string;
}

export interface Task {
  id: string;
  gemId: string;
  title: string;
  description: string;
  deadline: Date;
  priority: TaskPriority;
  status: TaskStatus;
  assetUrl?: string;
  uploadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
