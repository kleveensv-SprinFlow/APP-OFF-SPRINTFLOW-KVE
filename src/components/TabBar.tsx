import React from 'react';
import { Home, Dumbbell, Calendar, Users, MessageSquare, BarChart3, Lightbulb } from 'lucide-react';
import { View, Role } from '../../types';

interface TabBarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  userRole: Role;
}

const TabBar: React.FC<TabBarProps> = ({ currentView, onViewChange, userRole }) => {
  const athleteNavItems = [
    { view: 'dashboard' as View, icon: Home, label: 'Accueil' },
    { view: 'workouts' as View, icon: Dumbbell, label: 'Séances' },
    { view: 'planning' as View, icon: Calendar, label: 'Planning' },
    { view: 'ai' as View, icon: Lightbulb, label: 'Conseil' },
  ];

  const coachNavItems = [
    { view: 'dashboard' as View, icon: BarChart3, label: 'Dashboard' },
    { view: 'groups' as View, icon: Users, label: 'Athlètes' },
    { view: 'planning' as View, icon: Calendar, label: 'Planning' },
    { view: 'chat' as View, icon: MessageSquare, label: 'Chat' },
  ];

  const navItems = userRole === 'coach' ? coachNavItems : athleteNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.view}
          onClick={() => onViewChange(item.view)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            currentView === item.view
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300'
          }`}
        >
          <item.icon size={24} />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;