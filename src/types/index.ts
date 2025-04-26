export interface User {
  id: string;
  username: string;
  email: string;
  score: number;
  retryChances: number;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  is_main: boolean;
  quarter: string;
  completed: boolean;
  progress: number;
  created_at: string;
}

export type Task = {
  id: string;
  user_id: string;
  quest_id: string;
  title: string;
  description?: string;
  status: "not_started" | "in_progress" | "completed" | "pending";
  due_date?: string;
  completed_at?: string;
  verified: boolean;
  proof_url?: string;
  points?: number;
  created_at: string;
  updated_at: string;
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VerificationResult {
  verified: boolean;
  points: number;
}

export interface DashboardData {
  quests: Quest[];
  tasks: Task[];
  totalScore: number;
  retryChances: number;
  currentQuarter: number;
  completedTasks: number;
}
