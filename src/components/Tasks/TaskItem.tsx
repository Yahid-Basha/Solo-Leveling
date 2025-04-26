import React, { useState } from "react";
import { CheckCircle, Circle, Clock, Award, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Task } from "../../types";

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task["status"]) => Promise<void>;
  onVerify: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onStatusChange,
  onVerify,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = () => {
    if (isUpdating) {
      return <Loader2 className="w-5 h-5 text-[#0071e3] animate-spin" />;
    }

    switch (task.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  const handleStatusClick = async () => {
    if (isUpdating) return; // Prevent multiple clicks while updating

    const nextStatus =
      task.status === "not_started"
        ? "in_progress"
        : task.status === "in_progress"
          ? "completed"
          : "not_started";

    setIsUpdating(true);
    try {
      await onStatusChange(task.id, nextStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const needsVerification = task.status === "completed" && !task.verified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl p-4 shadow-sm mb-3 border ${
        task.verified ? "border-green-100" : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStatusClick}
            className="flex-shrink-0"
            disabled={isUpdating}
          >
            {getStatusIcon()}
          </button>

          <div>
            <h3
              className={`font-medium ${task.verified ? "text-gray-700" : "text-gray-900"}`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {task.verified && task.points && (
            <div className="flex items-center space-x-1 bg-[#f5f5f7] px-2 py-1 rounded-full">
              <Award className="w-4 h-4 text-[#0071e3]" />
              <span className="text-sm font-medium text-gray-700">
                {task.points}
              </span>
            </div>
          )}

          <div
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              task.status === "completed"
                ? "bg-green-50 text-green-700"
                : task.status === "in_progress"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {getStatusText()}
          </div>
        </div>
      </div>

      {needsVerification && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVerify(task.id)}
            className="w-full py-2 bg-[#0071e3] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit Proof to Verify Completion
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default TaskItem;
