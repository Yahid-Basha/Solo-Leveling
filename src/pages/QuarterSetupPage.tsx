import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuests } from '../context/QuestContext';
import { questsApi } from '../utils/api';

const QuarterSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { quests, setQuests } = useQuests();
  const navigate = useNavigate();
  
  const [currentQuarter, setCurrentQuarter] = useState<string>('');
  const [mainQuest, setMainQuest] = useState('');
  const [sideQuest1, setSideQuest1] = useState('');
  const [sideQuest2, setSideQuest2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set current quarter in the format 'Q1-2025'
    const now = new Date();
    const quarter = Math.floor((now.getMonth() / 3)) + 1;
    const year = now.getFullYear();
    setCurrentQuarter(`Q${quarter}-${year}`);
  }, []);

  useEffect(() => {
    // Redirect if user already has quests set up for this quarter
    if (quests.length > 0) {
      navigate('/dashboard');
    }
  }, [quests, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('Please log in to create quests');
      return;
    }
    
    if (!mainQuest || !sideQuest1 || !sideQuest2) {
      setError('Please fill in all quest fields');
      return;
    }
    
    setLoading(true);
    try {
      // Create main quest
      const mainQuestResult = await questsApi.createQuest(mainQuest, true, currentQuarter);
      
      // Create side quests
      const sideQuest1Result = await questsApi.createQuest(sideQuest1, false, currentQuarter);
      const sideQuest2Result = await questsApi.createQuest(sideQuest2, false, currentQuarter);
      
      // Update quests context with new quests
      setQuests([mainQuestResult, sideQuest1Result, sideQuest2Result]);
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to set up quests. Please try again.');
      console.error('Setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-1.5 bg-gradient-to-r from-blue-400 via-[#0071e3] to-blue-600" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto p-6 md:p-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to your Quest Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's define your mission for {currentQuarter}. What do you want to accomplish this quarter?
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md border-2 border-[#0071e3] overflow-hidden"
            >
              <div className="bg-[#0071e3] p-4 text-white">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <h3 className="font-semibold">Main Quest</h3>
                </div>
                <p className="text-sm text-blue-100 mt-1">
                  Your primary goal for {currentQuarter}
                </p>
              </div>
              
              <div className="p-5">
                <textarea
                  value={mainQuest}
                  onChange={(e) => setMainQuest(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Launch my new website"
                ></textarea>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="bg-[#f5f5f7] p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-800">Side Quest 1</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Secondary goal to support your mission
                </p>
              </div>
              
              <div className="p-5">
                <textarea
                  value={sideQuest1}
                  onChange={(e) => setSideQuest1(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Read 3 books on marketing"
                ></textarea>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="bg-[#f5f5f7] p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-800">Side Quest 2</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Additional goal to round out your quarter
                </p>
              </div>
              
              <div className="p-5">
                <textarea
                  value={sideQuest2}
                  onChange={(e) => setSideQuest2(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Exercise 3 times per week"
                ></textarea>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center mb-6 text-gray-500">
              <Calendar className="w-5 h-5 mr-2" />
              <p>Your goals for {currentQuarter}</p>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0071e3] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md disabled:opacity-70 min-w-[200px]"
            >
              {loading ? 'Setting Up...' : 'Start My Journey'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QuarterSetupPage;