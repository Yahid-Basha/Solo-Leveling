import axios from "axios";
import { supabase } from "./supabaseClient";
import { Quest, Task } from "../types";

const API_URL = "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    // Try to refresh the session
    const {
      data: { session: refreshedSession },
      error,
    } = await supabase.auth.refreshSession();

    if (error || !refreshedSession?.access_token) {
      console.error("No valid session found and refresh failed:", error);
      throw new Error("No valid session found");
    }

    return {
      Authorization: `Bearer ${refreshedSession.access_token}`,
      "Content-Type": "application/json",
    };
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
};

export const questsApi = {
  getQuests: async (): Promise<Array<Quest>> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/quests`, { headers });
    return response.data;
  },

  createQuest: async (title: string, isMain: boolean, quarter: string) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/quests`,
      { title, is_main: isMain, quarter },
      { headers }
    );
    return response.data;
  },

  updateQuest: async (id: string, updates: Partial<Quest>) => {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/quests/${id}`, updates, {
      headers,
    });
    return response.data;
  },

  deleteQuest: async (id: string) => {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_URL}/quests/${id}`, { headers });
  },

  getTasks: async (questId?: string): Promise<ApiResponse<Array<Task>>> => {
    try {
      const headers = await getAuthHeaders();
      const url = questId
        ? `${API_URL}/tasks?quest_id=${questId}`
        : `${API_URL}/tasks`;
      const response = await axios.get<Array<Task>>(url, { headers });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Error fetching tasks:", error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  createTask: async (
    questId: string,
    title: string,
    description?: string,
    dueDate?: string
  ) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/tasks`,
        {
          quest_id: questId,
          title,
          description,
          due_date: dueDate,
        },
        { headers }
      );
      console.log(response);
      // If response.data contains the created task, return it as success
      if (response.status === 201 && response.data && !response.data.error) {
        return {
          success: true,
          data: response.data,
        };
      }
      // If there's an error property in data, return as error
      if (response.data && response.data.error) {
        return {
          success: false,
          error: response.data.error,
        };
      }
      // Fallback error
      return {
        success: false,
        error: "Failed to create task",
      };
    } catch (error: unknown) {
      console.error("Error creating task:", error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  // Update the updateTask function
  updateTask: async (
    id: string,
    updates: Partial<Task>
  ): Promise<ApiResponse<Task>> => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.put<{
        success: boolean;
        data: Task;
        error?: string;
      }>(`${API_URL}/tasks/${id}`, updates, { headers });

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.error || "Failed to update task",
        };
      }
    } catch (error: unknown) {
      console.error("Error updating task:", error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  verifyTaskCompletion: async (
    taskId: string,
    proofImage: File | string
  ): Promise<ApiResponse<{ verified: boolean; points: number }>> => {
    // For now, return a mock response
    return {
      success: true,
      data: {
        verified: true,
        points: Math.floor(Math.random() * 50) + 20,
      },
    };
  },

  retryVerification: async (
    taskId: string,
    proofImage: File | string,
    notes: string
  ): Promise<ApiResponse<{ verified: boolean; points: number }>> => {
    // For now, return a mock response
    return {
      success: true,
      data: {
        verified: true,
        points: Math.floor(Math.random() * 30) + 40,
      },
    };
  },
};
