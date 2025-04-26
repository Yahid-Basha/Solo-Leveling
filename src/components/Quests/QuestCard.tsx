import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import ProgressBar from '../UI/ProgressBar';
import { Quest } from '../../types';

interface QuestCardProps {
  quest: Quest;
  onClick?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick }) => {
  const isMainQuest = quest.is_main;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isMainQuest ? 'border-2 border-[#0071e3] relative overflow-hidden' : 'border border-gray-100'
      }`}
      onClick={onClick}
    >
      {isMainQuest && (
        <div className="absolute -top-4 -right-4 bg-[#0071e3] text-white p-6 rotate-12 shadow-md">
          <Trophy className="w-4 h-4" />
        </div>
      )}
      
      <div className="flex items-start mb-3">
        <div className={`p-2 rounded-lg mr-3 ${isMainQuest ? 'bg-blue-50 text-[#0071e3]' : 'bg-gray-50 text-gray-500'}`}>
          {isMainQuest ? <Trophy className="w-5 h-5" /> : <Star className="w-5 h-5" />}
        </div>
        
        <div>
          <h3 className={`font-semibold text-gray-900 ${isMainQuest ? 'text-lg' : 'text-base'}`}>
            {quest.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {quest.quarter} • {isMainQuest ? 'Main Quest' : 'Side Quest'}
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-700">{quest.progress || 0}%</span>
        </div>
        <ProgressBar 
          progress={quest.progress || 0} 
          height="h-2" 
          glowing={isMainQuest}
        />
      </div>
      
      {quest.completed && (
        <div className="mt-3 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium inline-block">
          Completed
        </div>
      )}
    </motion.div>
  );
};

export default QuestCard;