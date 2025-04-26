import React, { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "../components/UI/Navigation";
import AddTaskModal from "../components/Tasks/AddTaskModal";
import QuestCard from "../components/Quests/QuestCard";
import { useQuests } from "../context/QuestContext";
import { Plus } from "lucide-react";

const AddTaskPage: React.FC = () => {
  const { quests, createTask } = useQuests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  const mainQuest = quests.find((q) => q.is_main === true);
  const sideQuests = quests.filter((q) => q.is_main === false);

  const handleQuestClick = (questId: string) => {
    setSelectedQuestId(questId);
    setIsModalOpen(true);
  };

  const handleAddTask = async (
    questId: string,
    title: string,
    notes?: string
  ) => {
    await createTask(questId, title, notes);
    setIsModalOpen(false);
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
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 via-[#0071e3] to-blue-600 p-6 md:p-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Add a New Task
              </h1>
              <p className="text-blue-100">
                Select a quest to add a task to, or click the button below
              </p>
            </motion.div>
          </div>

          <div className="p-6 bg-white">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto py-3 px-6 bg-[#0071e3] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Task
            </button>
          </div>
        </div>

        {/* Quests Section */}
        <div className="space-y-8">
          {/* Main Quest */}
          {mainQuest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Main Quest
              </h2>

              <div className="mb-2">
                <QuestCard
                  quest={mainQuest}
                  onClick={() => handleQuestClick(mainQuest.id)}
                />
              </div>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Side Quests
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sideQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onClick={() => handleQuestClick(quest.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuestId(null);
        }}
        onAddTask={handleAddTask}
        quests={quests}
      />
    </div>
  );
};

export default AddTaskPage;
