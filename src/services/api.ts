import {
  User,
  Quest,
  Task,
  ApiResponse,
  VerificationResult,
  DashboardData,
} from "../types";

// Mock User Data
let users: User[] = [];
let quests: Quest[] = [];
let tasks: Task[] = [];

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Auth APIs
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    await delay(800);

    // For demo purposes, create a user if not exists
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return {
        success: true,
        data: existingUser,
      };
    }

    // Create new user for demo
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: email.split("@")[0],
      email,
      score: 0,
      retryChances: 3,
    };

    users.push(newUser);

    return {
      success: true,
      data: newUser,
    };
  },

  // Quests APIs
  async createQuests(
    userId: string,
    mainQuest: string,
    sideQuests: string[],
    quarter: number
  ): Promise<ApiResponse<Quest[]>> {
    await delay(600);

    const year = new Date().getFullYear();

    // Create main quest
    const mainQuestObj: Quest = {
      id: `quest-${Date.now()}-main`,
      userId,
      title: mainQuest,
      type: "main",
      quarter,
      year,
      completed: false,
      progress: 0,
    };

    // Create side quests
    const sideQuestObjs: Quest[] = sideQuests.map((title, idx) => ({
      id: `quest-${Date.now()}-side-${idx}`,
      userId,
      title,
      type: "side",
      quarter,
      year,
      completed: false,
      progress: 0,
    }));

    const newQuests = [mainQuestObj, ...sideQuestObjs];
    quests = [...quests, ...newQuests];

    return {
      success: true,
      data: newQuests,
    };
  },

  // Tasks APIs
  async createTask(
    userId: string,
    questId: string,
    title: string,
    notes?: string
  ): Promise<ApiResponse<Task>> {
    await delay(500);

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      questId,
      userId,
      notes,
      status: "not_started",
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    return {
      success: true,
      data: newTask,
    };
  },

  async updateTaskStatus(
    taskId: string,
    status: Task["status"]
  ): Promise<ApiResponse<Task>> {
    await delay(400);

    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return {
        success: false,
        error: "Task not found",
      };
    }

    const updatedTask = {
      ...tasks[taskIndex],
      status,
      completedAt:
        status === "completed" ? new Date().toISOString() : undefined,
    };

    tasks[taskIndex] = updatedTask;

    return {
      success: true,
      data: updatedTask,
    };
  },

  async verifyTaskCompletion(
    taskId: string,
    proofImage: File | string
  ): Promise<ApiResponse<VerificationResult>> {
    console.log("Verifying task completion... TYB");
    await delay(1200);

    if (proofImage instanceof File) {
      if (!proofImage.type.startsWith("image/")) {
        console.log("Uploaded file is not an image.");
        return {
          success: false,
          error: "Uploaded file is not an image",
        };
      }
      const fileUrl = URL.createObjectURL(proofImage);
      console.log("Image file URL:", fileUrl);
    } else if (typeof proofImage === "string") {
      console.log("Image file URL:", proofImage);
    } else {
      console.log("Invalid proof image type.");
    }
    // Simulate verification (always success for demo)
    const points = Math.floor(Math.random() * 50) + 20;

    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return {
        success: false,
        error: "Task not found",
      };
    }

    // Update task with verification result
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      verified: true,
      points,
      proof:
        typeof proofImage === "string" ? proofImage : "image-url-placeholder",
    };

    // Update user score
    const user = users.find((u) => u.id === tasks[taskIndex].userId);
    if (user) {
      user.score += points;
    }

    // Update quest progress
    const questId = tasks[taskIndex].questId;
    const quest = quests.find((q) => q.id === questId);
    if (quest) {
      const questTasks = tasks.filter((t) => t.questId === questId);
      const completedTasks = questTasks.filter(
        (t) => t.status === "completed" && t.verified
      );
      quest.progress = Math.min(
        100,
        Math.floor(
          (completedTasks.length / Math.max(questTasks.length, 1)) * 100
        )
      );
      quest.completed = quest.progress === 100;
    }

    return {
      success: true,
      data: {
        verified: true,
        points,
      },
    };
  },

  async retryVerification(
    taskId: string,
    proofImage: File | string,
    additionalNotes: string
  ): Promise<ApiResponse<VerificationResult>> {
    await delay(1000);

    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return {
        success: false,
        error: "Task not found",
      };
    }

    // Find user and decrease retry chances
    const user = users.find((u) => u.id === tasks[taskIndex].userId);
    if (user && user.retryChances > 0) {
      user.retryChances -= 1;
    } else {
      return {
        success: false,
        error: "No retry chances left",
      };
    }

    // Update points (usually higher on retry for demo)
    const newPoints = tasks[taskIndex].points
      ? tasks[taskIndex].points + 15
      : 50;

    // Update user score with difference
    if (user) {
      user.score = user.score - (tasks[taskIndex].points || 0) + newPoints;
    }

    // Update task
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      points: newPoints,
      notes: additionalNotes,
      retryUsed: true,
    };

    return {
      success: true,
      data: {
        verified: true,
        points: newPoints,
      },
    };
  },

  // Dashboard APIs
  async getDashboard(userId: string): Promise<ApiResponse<DashboardData>> {
    await delay(700);

    const userQuests = quests.filter((q) => q.userId === userId);
    const userTasks = tasks.filter((t) => t.userId === userId);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const currentQuarter = Math.floor(new Date().getMonth() / 3 + 1);
    const completedTasks = userTasks.filter(
      (t) => t.status === "completed" && t.verified
    ).length;

    return {
      success: true,
      data: {
        quests: userQuests,
        tasks: userTasks,
        totalScore: user.score,
        retryChances: user.retryChances,
        currentQuarter,
        completedTasks,
      },
    };
  },

  async getCurrentQuarter(): Promise<ApiResponse<number>> {
    const currentQuarter = Math.floor(new Date().getMonth() / 3 + 1);
    return {
      success: true,
      data: currentQuarter,
    };
  },
};
