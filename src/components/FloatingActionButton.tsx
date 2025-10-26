import React, { useState } from 'react';
import { Plus, Dumbbell, Activity, Weight } from 'lucide-react';
import { View } from '../../types';

interface FloatingActionButtonProps {
  onViewChange: (view: View) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { view: 'add-workout' as View, icon: Dumbbell, label: 'Nouvelle Séance' },
    { view: 'add-record' as View, icon: Activity, label: 'Nouveau Record' },
    { view: 'add-bodycomp' as View, icon: Weight, label: 'Nouvelle Pesée' },
  ];

  const handleActionClick = (view: View) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {isOpen && (
        <div className="flex flex-col items-center mb-4 space-y-3">
          {actions.map((action) => (
            <button
              key={action.view}
              onClick={() => handleActionClick(action.view)}
              className="group flex items-center"
            >
              <span className="mr-3 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm">
                {action.label}
              </span>
              <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center shadow-md">
                <action.icon size={24} className="text-gray-600 dark:text-gray-200" />
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-300 ${
          isOpen ? 'bg-red-500 rotate-45' : 'bg-blue-600'
        }`}
        aria-label="Ajouter une nouvelle entrée"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default FloatingActionButton;
