import React from 'react';
import { Dumbbell, Target, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  onViewChange: (view: 'workouts' | 'records' | 'bodycomp') => void;
}

export function QuickActions({ onViewChange }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        onClick={() => onViewChange('workouts')}
        className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition-all duration-200 text-white text-left"
      >
        <Dumbbell className="h-8 w-8 mb-2" />
        <h3 className="text-lg font-semibold">Nouvel entraînement</h3>
        <p className="text-white/80 text-sm">Enregistrer une nouvelle séance</p>
      </button>
      
      <button
        onClick={() => onViewChange('records')}
        className="bg-purple-600 hover:bg-purple-700 p-6 rounded-lg transition-all duration-200 text-white text-left"
      >
        <Target className="h-8 w-8 mb-2" />
        <h3 className="text-lg font-semibold">Nouveau record</h3>
        <p className="text-white/80 text-sm">Enregistrer une performance</p>
      </button>
      
      <button
        onClick={() => onViewChange('bodycomp')}
        className="bg-green-600 hover:bg-green-700 p-6 rounded-lg transition-all duration-200 text-white text-left"
      >
        <BarChart3 className="h-8 w-8 mb-2" />
        <h3 className="text-lg font-semibold">Composition corporelle</h3>
        <p className="text-white/80 text-sm">Suivre votre évolution</p>
      </button>
    </div>
  );
}