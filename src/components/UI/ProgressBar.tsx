import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  height?: string;
  showPercentage?: boolean;
  glowing?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress,
  height = 'h-2',
  showPercentage = false,
  glowing = false
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="w-full relative">
      <div className={`bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`bg-[#0071e3] h-full rounded-full ${
            glowing ? 'after:absolute after:top-0 after:right-0 after:h-full after:w-3 after:bg-blue-300 after:blur-sm after:rounded-full' : ''
          }`}
        />
      </div>
      
      {showPercentage && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-600">{clampedProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;