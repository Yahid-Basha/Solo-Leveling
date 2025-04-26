import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutGrid, Plus, Trophy, LogOut, Menu, X, BarChart2 } from 'lucide-react';

const Navigation: React.FC = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutGrid className="w-5 h-5" />
    },
    {
      to: "/add-task",
      label: "Add Task",
      icon: <Plus className="w-5 h-5" />
    },
    {
      to: "/quests",
      label: "My Quests",
      icon: <Trophy className="w-5 h-5" />
    },
    {
      to: "/scoreboard",
      label: "Scoreboard",
      icon: <BarChart2 className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 bg-white bg-opacity-90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Quest Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ul className="flex space-x-2">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => 
                        `px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                          isActive 
                            ? 'text-[#0071e3] font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#0071e3] after:rounded-full' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
                
                <li>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden sticky top-0 bg-white bg-opacity-95 backdrop-blur-md z-50 shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Quest Tracker</h1>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {isOpen && (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-md ${
                    isActive 
                      ? 'bg-[#f5f5f7] text-[#0071e3] font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </NavLink>
            ))}
            
            <button
              onClick={logout}
              className="w-full text-left block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        )}
      </nav>
      
      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex flex-col items-center py-3 ${
                  isActive 
                    ? 'text-[#0071e3]' 
                    : 'text-gray-600'
                }`
              }
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;