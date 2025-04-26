import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-blue-400 via-[#0071e3] to-blue-600" />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:block"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Track your goals.<br />
                Complete your quests.<br />
                <span className="text-[#0071e3]">Level up your life.</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Quest Tracker helps you turn your goals into achievable missions, complete with verification 
                and points to keep you motivated.
              </p>
              
              <div className="flex space-x-4">
                <div className="bg-[#f5f5f7] rounded-xl p-4 flex-1">
                  <div className="text-sm font-medium text-gray-500 mb-1">Set Quarterly Goals</div>
                  <div className="text-base font-medium text-gray-900">Track progress with ease</div>
                </div>
                
                <div className="bg-[#f5f5f7] rounded-xl p-4 flex-1">
                  <div className="text-sm font-medium text-gray-500 mb-1">Earn Points</div>
                  <div className="text-base font-medium text-gray-900">Stay motivated daily</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Mobile-only title */}
              <div className="md:hidden text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Quest Tracker
                </h1>
                <p className="text-gray-600">
                  Track goals. Complete quests. Level up your life.
                </p>
              </div>
              
              <LoginForm />
            </motion.div>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© 2025 Quest Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;