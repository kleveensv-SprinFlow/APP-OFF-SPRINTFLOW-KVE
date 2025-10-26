import React from 'react';
import { Home, Dumbbell, Trophy, BarChart3, X, Lightbulb, Users, Calendar, User, MessageCircle, Handshake, Settings, Apple } from 'lucide-react';
import useAuth from '../hooks/useAuth';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: any) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'athlete' | 'coach' | 'developer';
}

export default function Navigation({
  currentView,
  onViewChange,
  isOpen,
  onClose,
  userRole,
}: NavigationProps) {
  const { user } = useAuth();

  // Vérifier l'accès développeur avec l'ID utilisateur spécifique
  const isDeveloper = user?.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f';

  const athleteNavItems = [
    { key: 'dashboard', label: 'Tableau de bord', icon: Home },
    { key: 'workouts', label: 'Entraînements', icon: Dumbbell },
    { key: 'records', label: 'Records', icon: Trophy },
    { key: 'bodycomp', label: 'Composition corporelle', icon: BarChart3 },
    { key: 'nutrition', label: 'Nutrition', icon: Apple },
    { key: 'ai', label: 'Analyse Détaillée', icon: Lightbulb },
    { key: 'partnerships', label: 'Partenariats', icon: Handshake },
    { key: 'groups', label: 'Mon Groupe', icon: Users },
    { key: 'planning', label: 'Mon Planning', icon: Calendar },
  ];

  const coachNavItems = [
    { key: 'dashboard', label: 'Tableau de bord', icon: Home },
    { key: 'groups', label: 'Mes Groupes', icon: Users },
    { key: 'chat', label: 'Chat Groupes', icon: MessageCircle },
    { key: 'planning', label: 'Planning', icon: Calendar },
    { key: 'partnerships', label: 'Partenariats', icon: Handshake },
  ];

  // Ajouter l'onglet développeur si c'est le bon utilisateur
  if (isDeveloper) {
    coachNavItems.push({ key: 'developer', label: 'Développeur', icon: Settings });
  }

  // Forcer l'affichage pour le développeur même s'il est athlète
  const effectiveRole = isDeveloper ? 'coach' : userRole;
  const navItems = effectiveRole === 'coach' ? coachNavItems : athleteNavItems;

  const handleItemClick = (view: string) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:w-64 lg:block
        `}
      >
        {/* Header mobile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center lg:hidden">
          <div className="flex items-center space-x-3">
            <img 
              src="/PhotoRoom-20250915_123950.png" 
              alt="Sprintflow Logo" 
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sprintflow</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Logo desktop */}
        <div className="hidden lg:block p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img 
              src="/PhotoRoom-20250915_123950.png" 
              alt="Sprintflow Logo" 
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sprintflow</h2>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              
              return (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item.key)}
                  className={`w-full flex items-center space-x-3 px-6 py-4 rounded-lg transition-all duration-200 text-left group nav-3d ${
                    isActive 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-6 w-6 flex-shrink-0 transition-transform duration-200 ${
                    isActive ? '' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer avec version */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-auto">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sprintflow v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}