import React, { useState } from 'react';
import { Loader2, TrendingUp, Zap, HeartPulse, HelpCircle } from 'lucide-react';
import AdviceModal from './AdviceModal';

interface ScoreCircleProps {
  score: number | null;
  title: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, title, icon: Icon, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group transition-transform duration-200 hover:scale-105">
    <div className={`relative w-24 h-24 rounded-full border-8 bg-gray-50 dark:bg-gray-800 ${color} flex items-center justify-center`}>
      <span className="text-3xl font-bold text-gray-800 dark:text-white">{score ?? '-'}</span>
    </div>
    <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {title}
    </h3>
  </button>
);

interface IndicesPanelProps {
  loading: boolean;
  scoreForme: any;
  scorePerformance: any;
  scoreEvolution: any;
}

export function IndicesPanel({ loading, scoreForme, scorePerformance, scoreEvolution }: IndicesPanelProps) {
  const [modalContent, setModalContent] = useState<{ type: 'forme' | 'performance' | 'evolution'; data: any } | null>(null);

  const handleScoreClick = (type: 'forme' | 'performance' | 'evolution', data: any) => {
    if (data && data.indice !== null) {
      setModalContent({ type, data });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Calcul des indices...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vos Indices de Performance</h2>
        <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-around items-start">
        <ScoreCircle score={scoreForme?.indice} title="Forme" icon={HeartPulse} color="border-green-400" onClick={() => handleScoreClick('forme', scoreForme)} />
        <ScoreCircle score={scorePerformance?.indice} title="Performance" icon={Zap} color="border-blue-400" onClick={() => handleScoreClick('performance', scorePerformance)} />
        <ScoreCircle score={scoreEvolution?.indice} title="Évolution" icon={TrendingUp} color="border-purple-400" onClick={() => handleScoreClick('evolution', scoreEvolution)} />
      </div>
      
      {modalContent && <AdviceModal content={modalContent} onClose={() => setModalContent(null)} />}
    </div>
  );
}