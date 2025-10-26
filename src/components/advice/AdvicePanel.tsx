import React, { useState, useEffect } from 'react';
import { Lightbulb, Moon, Activity, Pizza, TrendingUp, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdviceData {
  conseils: string[];
  details: any;
}

export function AdvicePanel() {
  const [adviceData, setAdviceData] = useState<AdviceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdvice();
  }, []);

  const loadAdvice = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/get_conseils_v2`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      const data = await response.json();
      setAdviceData(data);
    } catch (error) {
      console.error('Erreur chargement conseils:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adviceCards = {
    CONSEIL_SOMMEIL_CRITIQUE: {
      icon: <Moon className="w-8 h-8" />,
      color: 'red',
      title: '🚨 Sommeil Critique',
      content: (details: any) => (
        <>
          <p className="mb-2">
            Ton score de forme est impacté par un <strong>manque de sommeil important</strong>.
          </p>
          <p className="mb-2">
            Moyenne des 3 dernières nuits : <strong>{details?.sommeil?.moyenne_duree || '?'}h</strong>
          </p>
          <p className="text-sm">
            💡 <strong>Action :</strong> Priorise absolument le sommeil ce soir. Vise au moins 8h.
            Considère une sieste courte aujourd'hui si possible.
          </p>
        </>
      ),
    },
    CONSEIL_SOMMEIL: {
      icon: <Moon className="w-8 h-8" />,
      color: 'orange',
      title: '😴 Améliore ton Sommeil',
      content: (details: any) => (
        <>
          <p className="mb-2">
            Ton sommeil pourrait être optimisé pour améliorer ta récupération.
          </p>
          <p className="mb-2">
            Moyenne : <strong>{details?.sommeil?.moyenne_duree || '?'}h</strong> |
            Qualité : <strong>{details?.sommeil?.moyenne_qualite || '?'}/5</strong>
          </p>
          <p className="text-sm">
            💡 <strong>Conseils :</strong> Vise 7-9h par nuit. Établis une routine : couche-toi à heures fixes,
            évite les écrans 1h avant, et garde ta chambre fraîche (18-20°C).
          </p>
        </>
      ),
    },
    CONSEIL_RECUPERATION: {
      icon: <Activity className="w-8 h-8" />,
      color: 'orange',
      title: '⚠️ Attention : Fatigue Détectée',
      content: (details: any) => (
        <>
          <p className="mb-2">
            Ta dernière séance de <strong>vitesse maximale</strong> montre un drop-off élevé
            ({details?.derniere_seance?.fatigue_drop_off || '?'}%).
          </p>
          <p className="text-sm mb-2">
            Cela peut indiquer une fatigue importante ou un échauffement insuffisant.
          </p>
          <p className="text-sm">
            💡 <strong>Action :</strong> Prévois une journée de récupération active ou un repos complet.
            Assure-toi de bien dormir et de t'alimenter correctement.
          </p>
        </>
      ),
    },
    CONSEIL_PERI_TRAINING: {
      icon: <Pizza className="w-8 h-8" />,
      color: 'blue',
      title: '🍽️ Nutrition Post-Entraînement',
      content: () => (
        <>
          <p className="mb-2">
            Tu n'as pas enregistré de repas <strong>Post-Entraînement</strong> le jour de ta dernière séance.
          </p>
          <p className="text-sm mb-2">
            La fenêtre métabolique post-effort (30min-2h) est cruciale pour la récupération.
          </p>
          <p className="text-sm">
            💡 <strong>Conseils :</strong> Après l'entraînement, consomme des protéines (20-30g) + glucides.
            Exemples : shake protéiné + banane, poulet + riz, ou yaourt grec + fruits.
          </p>
        </>
      ),
    },
    FELICITATIONS_PROGRESSION: {
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'green',
      title: '🎉 Excellente Progression !',
      content: (details: any) => (
        <>
          <p className="mb-2">
            Ton rapport <strong>poids/puissance s'améliore</strong> !
          </p>
          {details?.progression && (
            <div className="space-y-1 mb-2">
              <p>📉 Perte de poids : <strong>{details.progression.perte_poids} kg</strong></p>
              <p>⚡ Amélioration record : <strong>{details.progression.amelioration_record}s</strong></p>
            </div>
          )}
          <p className="text-sm">
            💪 <strong>Continue comme ça !</strong> Ta composition corporelle évolue dans le bon sens
            et ta performance suit. Maintiens cette routine.
          </p>
        </>
      ),
    },
    EXCELLENTE_ROUTINE: {
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'green',
      title: '✅ Routine Excellente',
      content: (details: any) => (
        <>
          <p className="mb-2">
            Félicitations ! Ta routine est <strong>solide</strong>.
          </p>
          <p className="mb-2">
            Sommeil : <strong>{details?.sommeil?.moyenne_duree || '?'}h</strong> de qualité
            <strong> {details?.sommeil?.moyenne_qualite || '?'}/5</strong>
          </p>
          <p className="text-sm">
            🌟 <strong>Bravo !</strong> Tu respectes les fondamentaux de la performance.
            Continue sur cette lancée pour maximiser tes résultats.
          </p>
        </>
      ),
    },
  };

  const getCardClass = (color: string) => {
    const colors = {
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTextClass = (color: string) => {
    const colors = {
      red: 'text-red-700 dark:text-red-300',
      orange: 'text-orange-700 dark:text-orange-300',
      blue: 'text-blue-700 dark:text-blue-300',
      green: 'text-green-700 dark:text-green-300',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-10 h-10 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conseils Personnalisés</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Basés sur tes données et tes objectifs
            </p>
          </div>
        </div>
        <button
          onClick={loadAdvice}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {adviceData && adviceData.conseils && adviceData.conseils.length > 0 ? (
        <div className="space-y-6">
          {adviceData.conseils.map((conseil, index) => {
            const card = adviceCards[conseil as keyof typeof adviceCards];
            if (!card) return null;

            return (
              <div
                key={index}
                className={`${getCardClass(card.color)} border rounded-lg p-6 shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className={getTextClass(card.color)}>
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-3 ${getTextClass(card.color)}`}>
                      {card.title}
                    </h3>
                    <div className={`text-sm ${getTextClass(card.color)}`}>
                      {card.content(adviceData.details)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Aucun conseil pour le moment
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Continue de remplir tes données quotidiennes pour recevoir des conseils personnalisés.
          </p>
        </div>
      )}
    </div>
  );
}
