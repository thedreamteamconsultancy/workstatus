export type UserRole = 'admin' | 'gem';

export type TaskStatus = 'pending' | 'ongoing' | 'completed' | 'delayed';

export type TaskPriority = 'low' | 'medium' | 'urgent';

export type TaskCategory = 'present' | 'future' | 'past';

export type ProjectType = 
  | 'website' 
  | 'social_media_management' 
  | 'ads' 
  | 'digital_marketing' 
  | 'ads_digital_marketing' 
  | 'custom';

export type TransactionType = 'income' | 'expense';

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

// Social Media Management Project Commitment
export interface SocialMediaCommitment {
  realVideos: number;
  aiVideos: number;
  posters: number;
  digitalMarketingViews: number;
}

// Digital Marketing Cost Entry (for dropdown)
export interface DigitalMarketingCost {
  id: string;
  amount: number;
  description: string;
  date: Date;
}

// Client Project
export interface Client {
  id: string;
  businessName: string;
  phone: string;
  projectType: ProjectType;
  customProjectType?: string | null;
  
  // Social Media Management specific fields
  socialMediaCommitment?: SocialMediaCommitment;
  
  // Financial Information
  totalProjectCost: number;
  
  // Work Split (50%) - Admin Only
  workSplit: {
    clientManager: string;
    projectManager: string;
    assignedGems: string[]; // gem IDs
  };
  
  // Company Split (50%)
  companySplit: {
    digitalMarketingCosts: DigitalMarketingCost[];
    travellingCharges: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Categories
export interface TransactionCategory {
  id: string;
  name: string;
  createdAt: Date;
}

// Income/Expense Transaction
export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  createdAt: Date;
}

// Financial Summary
export interface FinancialSummary {
  totalRevenue: number;
  totalProjectCosts: number;
  totalWorkSplit: number;
  totalCompanySplit: number;
  totalDigitalMarketingCosts: number;
  totalTravellingCharges: number;
  totalOtherIncome: number;
  totalOtherExpenses: number;
  netProfit: number;
}
