import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuests } from "../hooks/useQuest";
import Navigation from "../components/UI/Navigation";
import QuestCard from "../components/Quests/QuestCard";
import TaskItem from "../components/Tasks/TaskItem";
import VerificationModal from "../components/Tasks/VerificationModal";
import ProgressBar from "../components/UI/ProgressBar";
import { Trophy, Award, Plus, Star, BarChart2 } from "lucide-react";
import { Task } from "../types";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const {
    quests,
    tasks,
    totalScore,
    retryChances,
    currentQuarter,
    completedTasks,
    loading,
    updateTaskStatus,
    verifyTask,
    retryVerification,
  } = useQuests();
  const navigate = useNavigate();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  useEffect(() => {
    // Redirect to Quarter Setup if no quests are set up
    if (!loading && quests.length === 0) {
      navigate("/quarter-setup");
    }
  }, [quests, loading, navigate]);

  const mainQuest = quests.find((q) => q.is_main === true);

  const sideQuests = quests.filter((q) => q.is_main === false);

  // Get tasks that need verification
  const tasksNeedingVerification = tasks.filter(
    (task) => task.status === "completed" && !task.verified
  );
  // console.log("Tasks needing verification:", tasksNeedingVerification);

  // Get latest tasks (limit to 5)
  const latestTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const handleVerifyTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setVerificationModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-16 md:pb-0">
      <Navigation />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8"
      >
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 via-[#0071e3] to-blue-600 p-6 md:p-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.username}
              </h1>
              <p className="text-blue-100 mb-6">
                Q{currentQuarter} Progress • {new Date().getFullYear()}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy className="w-4 h-4" />
                    <h3 className="font-medium">Total Score</h3>
                  </div>
                  <p className="text-2xl font-bold">{totalScore}</p>
                </div>

                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Award className="w-4 h-4" />
                    <h3 className="font-medium">Tasks Completed</h3>
                  </div>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                </div>

                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="w-4 h-4" />
                    <h3 className="font-medium">Quests</h3>
                  </div>
                  <p className="text-2xl font-bold">{quests.length}</p>
                </div>

                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <BarChart2 className="w-4 h-4" />
                    <h3 className="font-medium">Retry Chances</h3>
                  </div>
                  <p className="text-2xl font-bold">{retryChances}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Quests */}
          <div className="md:col-span-2 space-y-6">
            {/* Main Quest */}
            {mainQuest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 text-[#0071e3] mr-2" />
                  Main Quest
                </h2>

                <QuestCard quest={mainQuest} />
              </motion.div>
            )}

            {/* Side Quests */}
            {sideQuests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-[#0071e3] mr-2" />
                  Side Quests
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sideQuests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tasks Needing Verification */}
            {tasksNeedingVerification.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 text-[#0071e3] mr-2" />
                  Tasks Needing Verification
                </h2>

                <div className="space-y-2">
                  {tasksNeedingVerification.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onVerify={handleVerifyTask}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Stats and Latest Tasks */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quarter Progress
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Main Quest</span>
                    <span className="text-sm font-medium text-gray-700">
                      {mainQuest?.progress || 0}%
                    </span>
                  </div>
                  <ProgressBar
                    progress={mainQuest?.progress || 0}
                    height="h-3"
                    glowing={true}
                  />
                </div>

                {sideQuests.map((quest) => (
                  <div key={quest.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {quest.title.length > 20
                          ? quest.title.substring(0, 20) + "..."
                          : quest.title}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {quest.progress}%
                      </span>
                    </div>
                    <ProgressBar progress={quest.progress} height="h-3" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Latest Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Latest Tasks
                </h2>

                <button
                  onClick={() => navigate("/add-task")}
                  className="p-2 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {latestTasks.length > 0 ? (
                <div className="space-y-2">
                  {latestTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onVerify={handleVerifyTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks yet. Add your first task!</p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => navigate("/add-task")}
                  className="w-full py-2 bg-[#f5f5f7] text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Task
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        task={selectedTask}
        onVerify={verifyTask}
        onRetry={retryVerification}
        retryChances={retryChances}
      />
    </div>
  );
};

export default DashboardPage;
