import React from "react";
import { motion } from "framer-motion";
import Navigation from "../components/UI/Navigation";
import QuestCard from "../components/Quests/QuestCard";
import TaskItem from "../components/Tasks/TaskItem";
import VerificationModal from "../components/Tasks/VerificationModal";
import AddTaskModal from "../components/Tasks/AddTaskModal";
import { useQuests } from "../context/QuestContext";
import { Trophy, Star, CheckCircle, Clock, X, Plus } from "lucide-react";
import { Task } from "../types";

const QuestsPage: React.FC = () => {
  const {
    quests,
    tasks,
    retryChances,
    updateTaskStatus,
    verifyTask,
    retryVerification,
    createTask,
  } = useQuests();

  const [selectedQuest, setSelectedQuest] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] =
    React.useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = React.useState(false);

  const mainQuest = quests.find((q) => q.is_main);
  const sideQuests = quests.filter((q) => !q.is_main);

  // Get tasks for selected quest, or all tasks if no quest is selected
  const filteredTasks = selectedQuest
    ? tasks.filter((task) => task.quest_id === selectedQuest)
    : tasks;

  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed"
  );
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "in_progress"
  );
  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "pending"
  );

  const handleQuestClick = (questId: string) => {
    setSelectedQuest(questId === selectedQuest ? null : questId);
  };

  const handleVerifyTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setVerificationModalOpen(true);
    }
  };

  const handleAddTask = async (
    questId: string,
    title: string,
    description?: string,
    dueDate?: string
  ) => {
    try {
      // Create task with description and due date
      await createTask(questId, title, description || "", dueDate);
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  // Get selected quest details
  const activeQuest = selectedQuest
    ? quests.find((q) => q.id === selectedQuest)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Add Task Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setAddTaskModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-[#0071e3] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* Rest of your existing JSX */}
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 via-[#0071e3] to-blue-600 p-6 md:p-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">My Quests</h1>
              <p className="text-blue-100">
                {selectedQuest
                  ? `Viewing tasks for: ${activeQuest?.title}`
                  : "Select a quest to view its tasks"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-12 gap-6">
          {/* Left Column - Quests List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 space-y-4"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 text-[#0071e3] mr-2" />
                Main Quest
              </h2>

              {mainQuest && (
                <QuestCard
                  quest={mainQuest}
                  onClick={() => handleQuestClick(mainQuest.id)}
                />
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 text-[#0071e3] mr-2" />
                Side Quests
              </h2>

              <div className="space-y-3">
                {sideQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onClick={() => handleQuestClick(quest.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Tasks for Selected Quest */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-8"
          >
            {selectedQuest ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Completed
                    </h2>

                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      {completedTasks.length}
                    </span>
                  </div>

                  {completedTasks.length > 0 ? (
                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onStatusChange={updateTaskStatus}
                          onVerify={handleVerifyTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      No completed tasks yet
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Clock className="w-5 h-5 text-amber-500 mr-2" />
                      In Progress
                    </h2>

                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      {inProgressTasks.length}
                    </span>
                  </div>

                  {inProgressTasks.length > 0 ? (
                    <div className="space-y-2">
                      {inProgressTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onStatusChange={updateTaskStatus}
                          onVerify={handleVerifyTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      No tasks in progress
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <X className="w-5 h-5 text-gray-400 mr-2" />
                      Not Started
                    </h2>

                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      {pendingTasks.length}
                    </span>
                  </div>

                  {pendingTasks.length > 0 ? (
                    <div className="space-y-2">
                      {pendingTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onStatusChange={updateTaskStatus}
                          onVerify={handleVerifyTask}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      No pending tasks
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="max-w-md mx-auto">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Quest
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Choose a quest from the left to view its tasks and track
                    your progress.
                  </p>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-[#f5f5f7] rounded-lg p-4 text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {quests.length}
                      </p>
                      <p className="text-xs text-gray-600">Total Quests</p>
                    </div>

                    <div className="bg-[#f5f5f7] rounded-lg p-4 text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {tasks.length}
                      </p>
                      <p className="text-xs text-gray-600">Total Tasks</p>
                    </div>

                    <div className="bg-[#f5f5f7] rounded-lg p-4 text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {completedTasks.length}
                      </p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        quests={quests}
      />

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        task={selectedTask}
        retryChances={retryChances}
        onVerify={verifyTask}
        onRetry={retryVerification}
      />
    </div>
  );
};

export default QuestsPage;
