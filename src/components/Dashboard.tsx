import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Dumbbell, Target, Activity, Zap, Loader2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Workout } from '../types';
import { formatTime, formatDistance } from '../utils/formatters';
import { CoachDashboard } from './dashboard/CoachDashboard';
import { SleepTracker } from './sleep/SleepTracker';
import { PoidsPuissanceDetail } from './performance/PoidsPuissanceDetail';
import { supabase } from '../lib/supabase';
import { MESSAGES, getCombinedMessage } from '../lib/messages';

interface DashboardProps {
  workouts: Workout[];
  onViewChange: (view: 'workouts' | 'records' | 'bodycomp') => void;
  userRole?: 'athlete' | 'coach' | 'developer';
  onScoresLoad?: (refreshScores: () => Promise<void>) => void;
}

export default function Dashboard({ workouts, onViewChange, userRole, onScoresLoad }: DashboardProps) {
  const [scoreForme, setScoreForme] = useState<any>(null);
  const [indicePoidsPuissance, setIndicePoidsPuissance] = useState<any>(null);
  const [loadingScores, setLoadingScores] = useState(true);
  const [contextMessage, setContextMessage] = useState<string>('');
  const [showPoidsPuissanceDetail, setShowPoidsPuissanceDetail] = useState(false);

  if (userRole === 'coach' || userRole === 'developer') {
    return <CoachDashboard />;
  }

  useEffect(() => {
    loadScores();
    if (onScoresLoad) {
      onScoresLoad(loadScores);
    }
  }, []);

  const loadScores = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const [formeRes, indiceRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/get_score_forme`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }),
        fetch(`${supabaseUrl}/functions/v1/get_indice_poids_puissance`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }),
      ]);

      const formeData = await formeRes.json();
      const indiceData = await indiceRes.json();

      setScoreForme(formeData);
      setIndicePoidsPuissance(indiceData);

      if (!formeData.calibration && formeData.score !== null && indiceData.indice !== null) {
        const message = `Score de Forme: ${formeData.score}/100 - Indice Poids/Puissance: ${indiceData.indice}/100`;
        setContextMessage(message);
      }
    } catch (error) {
      console.error('Erreur chargement scores:', error);
    } finally {
      setLoadingScores(false);
    }
  };

  const recentWorkouts = workouts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = {
    totalWorkouts: workouts.length,
    thisWeek: workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length,
    totalRuns: workouts.reduce((sum, w) => sum + w.runs.length, 0),
    totalJumps: workouts.reduce((sum, w) => sum + (w.jumps?.length || 0), 0),
    totalExercises: workouts.reduce((sum, w) => sum + w.exercises.length, 0),
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 65) return 'text-lime-600 dark:text-lime-400';
    if (score >= 55) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 45) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700';
    if (score >= 75) return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
    if (score >= 65) return 'bg-lime-50 dark:bg-lime-900/20 border-lime-300 dark:border-lime-700';
    if (score >= 55) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
    if (score >= 45) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700';
    return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6 mt-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenue sur <span className="gradient-text">Sprintflow</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Suivez vos performances et atteignez vos objectifs</p>
      </div>

      <SleepTracker />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Score de Forme</h3>
          </div>
          {loadingScores ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          ) : scoreForme?.calibration ? (
            <div className="text-center py-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <p className="text-blue-900 dark:text-blue-200 font-medium mb-2">🔄 Mode Calibration</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{scoreForme.message}</p>
                {scoreForme.jours_manquants > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Encore {scoreForme.jours_manquants} jour(s) de données requis</p>
                )}
              </div>
            </div>
          ) : scoreForme?.score !== null && scoreForme?.score !== undefined ? (
            <div className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-full border-8 ${getScoreBgColor(scoreForme.score)} flex items-center justify-center mb-4`}>
                <span className={`text-4xl font-bold ${getScoreColor(scoreForme.score)}`}>{scoreForme.score}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Disponibilité et fraîcheur</p>
              {scoreForme.mini_scores && (
                <div className="mt-4 w-full space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sommeil (50%)</span>
                    <span className="font-medium">{scoreForme.mini_scores.sommeil}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Charge/Récup (30%)</span>
                    <span className="font-medium">{scoreForme.mini_scores.charge_recup}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Perf Récente (20%)</span>
                    <span className="font-medium">{scoreForme.mini_scores.performance_recente}/100</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Données insuffisantes</div>
          )}
        </div>

        <button
          onClick={() => indicePoidsPuissance?.indice > 0 && setShowPoidsPuissanceDetail(true)}
          className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer text-left"
          disabled={!indicePoidsPuissance || indicePoidsPuissance.indice === 0}
        >
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Poids/Puissance</h3>
            {indicePoidsPuissance?.indice > 0 && (
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Cliquer pour conseils</span>
            )}
          </div>
          {loadingScores ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
          ) : indicePoidsPuissance?.indice !== null && indicePoidsPuissance?.indice !== undefined ? (
            indicePoidsPuissance.indice === 0 ? (
              <div className="text-center py-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <p className="text-blue-900 dark:text-blue-200 font-medium mb-3">📊 Score non calculable</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Aucun record de musculation enregistré. Pour calculer votre rapport poids/puissance, ajoutez des records dans les catégories suivantes :
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-2 mb-4">
                    <li>• <strong>Haltérophilie</strong> : Épaulé, Arraché, Jeté...</li>
                    <li>• <strong>Musculation Bas</strong> : Squat, Soulevé de Terre...</li>
                    <li>• <strong>Musculation Haut</strong> : Développé Couché, Traction...</li>
                    <li>• <strong>Unilatéral</strong> : Fente, Pistol Squat...</li>
                  </ul>
                  <button
                    onClick={() => onViewChange('records')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Ajouter mes records
                  </button>
                </div>
              </div>
            ) : (
            <div className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-full border-8 ${getScoreBgColor(indicePoidsPuissance.indice)} flex items-center justify-center mb-4`}>
                <span className={`text-4xl font-bold ${getScoreColor(indicePoidsPuissance.indice)}`}>{indicePoidsPuissance.indice}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Rapport Poids/Puissance
              </p>
              <div className="mt-4 w-full space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Composition (40%)</span>
                  <span className="font-medium">{indicePoidsPuissance.scoreCompo}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Force Relative (60%)</span>
                  <span className="font-medium">{indicePoidsPuissance.scoreForce}/100</span>
                </div>
              </div>
              {indicePoidsPuissance.categorieScores && Object.keys(indicePoidsPuissance.categorieScores).length > 0 && (
                <div className="mt-4 w-full border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Scores par catégorie</h4>
                  <div className="space-y-2">
                    {indicePoidsPuissance.categorieScores.halterophilie && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{width: `${indicePoidsPuissance.categorieScores.halterophilie}%`}}
                          />
                        </div>
                        <span className="text-xs font-medium w-16 text-right">{Math.round(indicePoidsPuissance.categorieScores.halterophilie)}/100</span>
                        <span className="text-xs text-gray-500 w-24">Haltéro</span>
                      </div>
                    )}
                    {indicePoidsPuissance.categorieScores.muscu_bas && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{width: `${indicePoidsPuissance.categorieScores.muscu_bas}%`}}
                          />
                        </div>
                        <span className="text-xs font-medium w-16 text-right">{Math.round(indicePoidsPuissance.categorieScores.muscu_bas)}/100</span>
                        <span className="text-xs text-gray-500 w-24">Muscu Bas</span>
                      </div>
                    )}
                    {indicePoidsPuissance.categorieScores.muscu_haut && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{width: `${indicePoidsPuissance.categorieScores.muscu_haut}%`}}
                          />
                        </div>
                        <span className="text-xs font-medium w-16 text-right">{Math.round(indicePoidsPuissance.categorieScores.muscu_haut)}/100</span>
                        <span className="text-xs text-gray-500 w-24">Muscu Haut</span>
                      </div>
                    )}
                    {indicePoidsPuissance.categorieScores.unilateral && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full transition-all"
                            style={{width: `${indicePoidsPuissance.categorieScores.unilateral}%`}}
                          />
                        </div>
                        <span className="text-xs font-medium w-16 text-right">{Math.round(indicePoidsPuissance.categorieScores.unilateral)}/100</span>
                        <span className="text-xs text-gray-500 w-24">Unilatéral</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Données insuffisantes</div>
          )}
        </button>
      </div>

      {showPoidsPuissanceDetail && indicePoidsPuissance && indicePoidsPuissance.indice > 0 && (
        <PoidsPuissanceDetail
          data={indicePoidsPuissance}
          onClose={() => setShowPoidsPuissanceDetail(false)}
        />
      )}

      {contextMessage && !scoreForme?.calibration && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Analyse Contextuelle</h3>
              <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{contextMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 card-3d">
          <div className="text-2xl font-bold text-primary-500">{stats.totalWorkouts}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Entraînements</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 card-3d">
          <div className="text-2xl font-bold text-green-400">{stats.thisWeek}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Cette semaine</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 card-3d">
          <div className="text-2xl font-bold text-secondary-500">{stats.totalRuns}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 card-3d">
          <div className="text-2xl font-bold text-green-500">{stats.totalJumps}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sauts</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 card-3d">
          <div className="text-2xl font-bold text-accent-500">{stats.totalExercises}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Exercices</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onViewChange('workouts')}
          className="bg-primary-500 hover:bg-primary-600 p-6 rounded-lg transition-all duration-200 text-white card-3d-deep"
        >
          <Dumbbell className="h-8 w-8 mb-2 text-white" />
          <h3 className="text-lg font-semibold text-white mb-1">Nouvel entraînement</h3>
          <p className="text-white/80 text-sm">Enregistrer une nouvelle séance</p>
        </button>
        
        <button
          onClick={() => onViewChange('records')}
          className="bg-secondary-500 hover:bg-secondary-600 p-6 rounded-lg transition-all duration-200 card-3d-deep"
        >
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="text-lg font-semibold text-white mb-1">Nouveau record</h3>
          <p className="text-white/80 text-sm">Enregistrer une performance</p>
        </button>
        
        <button
          onClick={() => onViewChange('bodycomp')}
          className="bg-accent-500 hover:bg-accent-600 p-6 rounded-lg transition-all duration-200 card-3d-deep"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-white mb-1">Composition corporelle</h3>
          <p className="text-white/80 text-sm">Suivre votre évolution</p>
        </button>
      </div>

      {/* Recent Workouts */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Derniers entraînements</h2>
        {recentWorkouts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center shadow-lg border border-gray-200 dark:border-gray-700">
            <Dumbbell className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun entraînement enregistré</p>
            <button
              onClick={() => onViewChange('workouts')}
              className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg text-white transition-all duration-200 shadow-lg"
            >
              Commencer maintenant
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 card-3d">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {format(new Date(workout.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workout.runs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-primary-500 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Courses ({workout.runs.length})
                      </h4>
                      <div className="space-y-1">
                        {workout.runs.slice(0, 2).map((run) => (
                          <div key={run.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <span>{formatDistance(run.distance)}</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(run.time)}</span>
                          </div>
                        ))}
                        {workout.runs.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            +{workout.runs.length - 2} autre(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {workout.jumps && workout.jumps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-500 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Sauts ({workout.jumps.length})
                      </h4>
                      <div className="space-y-1">
                        {workout.jumps.slice(0, 2).map((jump) => (
                          <div key={jump.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                            <span>{jump.discipline}</span>
                            <span>{jump.distance.toFixed(2)}m</span>
                          </div>
                        ))}
                        {workout.jumps.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            +{workout.jumps.length - 2} autre(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {workout.exercises.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-secondary-500 mb-2 flex items-center">
                        <Dumbbell className="h-4 w-4 mr-1" />
                        Exercices ({workout.exercises.length})
                      </h4>
                      <div className="space-y-1">
                        {workout.exercises.slice(0, 2).map((exercise) => (
                          <div key={exercise.id} className="text-sm text-gray-700 dark:text-gray-300">
                            {exercise.name} - {exercise.sets}×{exercise.reps}
                            {exercise.weight && ` à ${exercise.weight}kg`}
                          </div>
                        ))}
                        {workout.exercises.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            +{workout.exercises.length - 2} autre(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}