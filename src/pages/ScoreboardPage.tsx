import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/UI/Navigation';
import ProgressBar from '../components/UI/ProgressBar';
import { useQuests } from '../context/QuestContext';
import { Award, Trophy, Star, Calendar, Flag } from 'lucide-react';
import { format } from 'date-fns';

const ScoreboardPage: React.FC = () => {
  const { 
    quests, 
    tasks, 
    totalScore, 
    currentQuarter, 
    completedTasks,
    retryChances
  } = useQuests();
  
  const mainQuest = quests.find(q => q.type === 'main');
  const sideQuests = quests.filter(q => q.type === 'side');
  
  // Get top scored tasks
  const topTasks = [...tasks]
    .filter(task => task.verified && task.points)
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-16 md:pb-0">
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8"
      >
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 via-[#0071e3] to-blue-600 p-6 md:p-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {totalScore} Points
              </h1>
              <p className="text-blue-100 mb-6">
                Q{currentQuarter} {new Date().getFullYear()} • {completedTasks} Tasks Completed
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Trophy className="w-4 h-4" />
                    <h3 className="font-medium">Main Quest</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {mainQuest?.progress || 0}%
                  </p>
                </div>
                
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Star className="w-4 h-4" />
                    <h3 className="font-medium">Side Quests</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {sideQuests.length}
                  </p>
                </div>
                
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Flag className="w-4 h-4" />
                    <h3 className="font-medium">Retry Chances</h3>
                  </div>
                  <p className="text-2xl font-bold">{retryChances}</p>
                </div>
                
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <h3 className="font-medium">Today</h3>
                  </div>
                  <p className="text-xl font-bold">
                    {format(new Date(), 'MMM d')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Progress Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Main Quest Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 text-[#0071e3] mr-2" />
              Main Quest Progress
            </h2>
            
            {mainQuest ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{mainQuest.title}</h3>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-700">
                      {mainQuest.progress}%
                    </span>
                  </div>
                  <ProgressBar 
                    progress={mainQuest.progress} 
                    height="h-4" 
                    glowing={true}
                    showPercentage
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    {mainQuest.completed 
                      ? '🎉 Congratulations! Main quest completed.' 
                      : `Keep going! You're making progress on your main quest.`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No main quest set.</p>
            )}
          </motion.div>
          
          {/* Side Quests Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-[#0071e3] mr-2" />
              Side Quests Progress
            </h2>
            
            {sideQuests.length > 0 ? (
              <div className="space-y-5">
                {sideQuests.map((quest) => (
                  <div key={quest.id}>
                    <h3 className="text-base font-medium text-gray-900 mb-2">{quest.title}</h3>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-700">
                          {quest.progress}%
                        </span>
                      </div>
                      <ProgressBar progress={quest.progress} showPercentage />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No side quests set.</p>
            )}
          </motion.div>
        </div>
        
        {/* Top Scored Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 text-[#0071e3] mr-2" />
            Top Scored Tasks
          </h2>
          
          {topTasks.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quest
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topTasks.map((task) => {
                    const taskQuest = quests.find(q => q.id === task.questId);
                    return (
                      <tr key={task.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {taskQuest?.title || 'Unknown Quest'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-[#0071e3]">
                            {task.points} pts
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              Complete tasks to see your top scored achievements!
            </p>
          )}
        </motion.div>
        
        {/* Quarter Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 text-[#0071e3] mr-2" />
            Q{currentQuarter} {new Date().getFullYear()} Stats
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#f5f5f7] rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{totalScore}</p>
            </div>
            
            <div className="bg-[#f5f5f7] rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            </div>
            
            <div className="bg-[#f5f5f7] rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Quests Set</p>
              <p className="text-2xl font-bold text-gray-900">{quests.length}</p>
            </div>
            
            <div className="bg-[#f5f5f7] rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Retry Chances Left</p>
              <p className="text-2xl font-bold text-gray-900">{retryChances}</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Keep going! You're making great progress this quarter.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ScoreboardPage;