import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Quest, Task, DashboardData } from "../types";
import { questsApi } from "../utils/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface QuestContextType {
  loading: boolean;
  quests: Quest[];
  tasks: Task[];
  totalScore: number;
  retryChances: number;
  currentQuarter: number;
  completedTasks: number;
  setQuests: (quests: Quest[]) => void;
  refreshDashboard: () => Promise<void>;
  createQuests: (mainQuest: string, sideQuests: string[]) => Promise<void>;
  createTask: (
    questId: string,
    title: string,
    notes?: string,
    due_date?: string
  ) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>;
  verifyTask: (
    taskId: string,
    proofImage: File | string
  ) => Promise<{ verified: boolean; points: number }>;
  retryVerification: (
    taskId: string,
    proofImage: File | string,
    notes: string
  ) => Promise<{ verified: boolean; points: number }>;
}

const QuestContext = createContext<QuestContextType>({
  loading: false,
  quests: [],
  tasks: [],
  totalScore: 0,
  retryChances: 0,
  currentQuarter: 0,
  completedTasks: 0,
  setQuests: () => {},
  refreshDashboard: async () => {},
  createQuests: async () => {},
  createTask: async () => {},
  updateTaskStatus: async () => {},
  verifyTask: async () => ({ verified: false, points: 0 }),
  retryVerification: async () => ({ verified: false, points: 0 }),
});

export const useQuests = () => useContext(QuestContext);

export const QuestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, session, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    quests: [],
    tasks: [],
    totalScore: 0,
    retryChances: 0,
    currentQuarter: 0,
    completedTasks: 0,
  });

  const setQuests = (quests: Quest[]) => {
    setDashboardData((prev) => ({
      ...prev,
      quests,
    }));
  };

  const refreshDashboard = React.useCallback(async () => {
    if (!user || !session) {
      await logout();
      return;
    }

    setLoading(true);
    try {
      // Fetch quests and tasks from backend
      const [quests, tasksResponse] = await Promise.all([
        questsApi.getQuests(),
        questsApi.getTasks(),
      ]);

      // If tasks fetch failed, throw error
      if (!tasksResponse.success) {
        throw new Error(tasksResponse.error || "Failed to fetch tasks");
      }

      const tasks = tasksResponse.data || [];

      // Calculate completed tasks
      const completedTasksCount = tasks.filter(
        (t: Task) => t.status === "completed" && t.verified
      ).length;

      // Update dashboard data
      setDashboardData((prev) => ({
        ...prev,
        quests,
        tasks,
        completedTasks: completedTasksCount,
        currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
      }));
    } catch (error: unknown) {
      console.error("Failed to load dashboard:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Force logout on 401 error to clear any invalid session
        await logout();
      }
    } finally {
      setLoading(false);
    }
  }, [user, session, logout]);

  useEffect(() => {
    if (user && session) {
      refreshDashboard();
    } else {
      setLoading(false);
      logout();
    }
  }, [user, session, refreshDashboard, logout]);

  const createQuests = async (mainQuest: string, sideQuests: string[]) => {
    if (!user || !session) {
      await logout();
      navigate("/login");
      throw new Error("User not authenticated");
    }

    setLoading(true);
    try {
      const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`;

      // Create main quest
      await questsApi.createQuest(mainQuest, true, currentQuarter);

      // Create side quests
      for (const quest of sideQuests) {
        await questsApi.createQuest(quest, false, currentQuarter);
      }

      await refreshDashboard();
    } catch (error: unknown) {
      console.error("Error creating quests:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    questId: string,
    title: string,
    notes?: string,
    due_date?: string
  ) => {
    if (!user || !session) {
      await logout();
      throw new Error("User not authenticated");
    }

    setLoading(true);
    try {
      const response = await questsApi.createTask(
        questId,
        title,
        notes,
        due_date
      );

      if (response.success) {
        await refreshDashboard();
      } else {
        throw new Error(response.error || "Failed to create task");
      }
    } catch (error: unknown) {
      console.error("Error creating task:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    status: Task["status"]
  ): Promise<void> => {
    if (!user || !session) {
      await logout();
      throw new Error("User not authenticated");
    }
    try {
      const response = await questsApi.updateTask(taskId, { status });

      if (response.success) {
        await refreshDashboard();
      } else {
        throw new Error(response.error || "Failed to update task");
      }
    } catch (error: unknown) {
      console.error("Error updating task:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await logout();
      }
      throw error;
    }
  };

  const verifyTask = async (taskId: string, proofImage: File | string) => {
    if (!user || !session) {
      await logout();
      throw new Error("User not authenticated");
    }

    setLoading(true);
    try {
      const response = await questsApi.verifyTaskCompletion(taskId, proofImage);

      if (response.success && response.data) {
        await refreshDashboard();
        return response.data;
      } else {
        throw new Error(response.error || "Verification failed");
      }
    } catch (error: unknown) {
      console.error("Error verifying task:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const retryVerification = async (
    taskId: string,
    proofImage: File | string,
    notes: string
  ) => {
    if (!user || !session) {
      await logout();
      throw new Error("User not authenticated");
    }

    setLoading(true);
    try {
      const response = await questsApi.retryVerification(
        taskId,
        proofImage,
        notes
      );

      if (response.success && response.data) {
        await refreshDashboard();
        return response.data;
      } else {
        throw new Error(response.error || "Retry verification failed");
      }
    } catch (error: unknown) {
      console.error("Error retrying verification:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuestContext.Provider
      value={{
        loading,
        quests: dashboardData.quests,
        tasks: dashboardData.tasks,
        totalScore: dashboardData.totalScore,
        retryChances: dashboardData.retryChances,
        currentQuarter: dashboardData.currentQuarter,
        completedTasks: dashboardData.completedTasks,
        setQuests,
        refreshDashboard,
        createQuests,
        createTask,
        updateTaskStatus,
        verifyTask,
        retryVerification,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};
