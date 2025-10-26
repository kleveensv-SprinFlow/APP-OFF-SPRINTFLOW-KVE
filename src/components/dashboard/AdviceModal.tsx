import React from 'react';
import { X, HeartPulse, Zap, TrendingUp, CheckCircle } from 'lucide-react';

const getThemeConfig = (color: string) => {
  switch (color) {
    case 'text-green-500':
      return { bg: 'bg-green-100 dark:bg-green-900/30', icon: HeartPulse, title: "Analyse de votre Forme" };
    case 'text-blue-500':
      return { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Zap, title: "Analyse de votre Performance" };
    case 'text-purple-500':
      return { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: TrendingUp, title: "Analyse de votre Évolution" };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-900/30', icon: CheckCircle, title: "Analyse" };
  }
};

const ADVICE_GENERATORS = {
  forme: (data: any) => [
      `Votre score de Forme de ${data.indice}/100 est basé sur votre récupération et votre charge d'entraînement.`,
      data.context.cause === 'SOMMEIL' && "Le principal facteur limitant est un manque de sommeil. Priorisez 7-9h par nuit.",
      data.context.cause === 'CHARGE' && "Vous semblez en surcharge. Un jour de repos supplémentaire pourrait être bénéfique.",
      data.indice > 80 && "Excellente forme ! C'est le moment idéal pour une séance intense ou pour tenter un nouveau record."
    ].filter(Boolean),
  performance: (data: any) => [
      `Votre score de Performance de ${data.indice}/100 reflète votre potentiel athlétique brut.`,
      `Il est composé à 40% de votre score de composition (${data.scoreCompo}/100) et à 60% de votre score de force (${data.scoreForce}/100).`,
      data.scoreCompo < 60 && `Votre point faible semble être la composition corporelle (calculé via ${data.context.compoMethod}). Se concentrer sur la nutrition pourrait débloquer votre potentiel.`,
      data.scoreForce < 60 && "Votre force relative est un axe de progression. Continuez le travail de renforcement !",
      data.indice > 80 && `Félicitations ! Votre profil de force est excellent et bien adapté à votre discipline : ${data.context.discipline}.`
    ].filter(Boolean),
  evolution: (data: any) => [
      `Votre score d'Évolution de ${data.indice}/100 indique que vous êtes à ${data.indice}% de votre meilleur niveau des 90 derniers jours.`,
      data.indice > 100 && `Vous êtes en pleine progression ! Vos records récents dépassent vos anciens meilleures performances.`,
      data.indice < 95 && `Vous semblez être dans une phase de récupération ou de désentraînement. Analysez votre fatigue et votre charge.`,
      ...(data.context.topProgress?.map((p: any) => `Point fort : forte progression sur ${p.name} (+${p.score - 100}%).`) || []),
      ...(data.context.bottomProgress?.map((p: any) => `Axe d'amélioration : ${p.name} est en retrait (${p.score}% du pic).`) || [])
    ].filter(Boolean)
};

const COLOR_MAP = {
    forme: 'text-green-500',
    performance: 'text-blue-500',
    evolution: 'text-purple-500'
}

interface AdviceModalProps {
  content: {
    type: 'forme' | 'performance' | 'evolution';
    data: any;
  };
  onClose: () => void;
}

const AdviceModal: React.FC<AdviceModalProps> = ({ content, onClose }) => {
  const color = COLOR_MAP[content.type];
  const { bg, icon: Icon, title } = getThemeConfig(color);
  const advices = ADVICE_GENERATORS[content.type](content.data);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full border dark:border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${bg}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-3">
            {advices.map((advice, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{advice}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdviceModal;