import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Target, User, CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { usePlanning } from '../../hooks/usePlanning'
import { useGroups } from '../../hooks/useGroups'
import { LoadingScreen } from '../LoadingScreen'

export const AthletePlanning: React.FC = () => {
  const { groups } = useGroups()
  const { sessionTemplates, loadAthleteGroupPlanning } = usePlanning()
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [planningLoading, setPlanningLoading] = useState(false)
  const [hasLoadedPlanning, setHasLoadedPlanning] = useState(false)
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');

  // Charger le planning une seule fois quand on a des groupes
  useEffect(() => {
    if (groups.length > 0 && !hasLoadedPlanning && !planningLoading && loadAthleteGroupPlanning) {
      const firstGroup = groups[0]
      console.log('📚 Chargement planning pour groupe:', firstGroup.name)
      
      setPlanningLoading(true)
      
      const loadData = async () => {
        try {
          await loadAthleteGroupPlanning(firstGroup.id)
          setHasLoadedPlanning(true)
        } catch (error) {
          console.error('❌ Erreur chargement planning:', error)
        } finally {
          setPlanningLoading(false)
        }
      }
      
      loadData()
    }
  }, [groups, hasLoadedPlanning, planningLoading, loadAthleteGroupPlanning])

  const markSessionCompleted = (sessionId: string) => {
    try {
      // Marquer localement
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession(prev => ({ ...prev, completed: true }))
      }
      
      alert('✅ Séance marquée comme terminée!')
    } catch (error) {
      console.error('Erreur marquage session:', error)
    }
  }

  const daysOfWeek = [
    { number: 1, name: 'Lundi', short: 'Lun' },
    { number: 2, name: 'Mardi', short: 'Mar' },
    { number: 3, name: 'Mercredi', short: 'Mer' },
    { number: 4, name: 'Jeudi', short: 'Jeu' },
    { number: 5, name: 'Vendredi', short: 'Ven' },
    { number: 6, name: 'Samedi', short: 'Sam' },
    { number: 7, name: 'Dimanche', short: 'Dim' }
  ]

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getSessionForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return sessionTemplates.find(template => {
      const templateDate = new Date(template.created_at)
      return format(templateDate, 'yyyy-MM-dd') === dateString
    })
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      case 'recovery': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
      case 'rest': return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200'
    }
  }

  const getIntensityColor = (intensity?: string) => {
    switch (intensity) {
      case 'low': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'high': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  // Afficher le chargement seulement si on charge vraiment les données
  if (planningLoading) {
    return <LoadingScreen message="Chargement de votre planning..." />
  }

  // Si pas de groupes, afficher le message approprié
  if (groups.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Planning</h1>
          <p className="text-gray-600 dark:text-gray-400">Programme d'entraînement assigné par votre coach</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Aucun groupe rejoint
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Rejoignez un groupe pour voir votre planning d'entraînement.
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('change-view', { detail: 'groups' }))
            }}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-medium transition-colors"
          >
            Rejoindre un groupe
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendrier</h1>
        <p className="text-gray-600 dark:text-gray-400">Planification et historique des entraînements</p>
      </div>

      <div className="flex justify-center">
        <div className="flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
          <button
            onClick={() => setCurrentView('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${currentView === 'calendar' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Calendrier
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${currentView === 'list' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Entraînements Réalisés
          </button>
        </div>
      </div>

      {currentView === 'calendar' && (
        <>
          {/* Navigation semaine */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {format(weekStart, 'MMMM yyyy', { locale: fr })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Semaine du {format(weekStart, 'd')} au {format(addDays(weekStart, 6), 'd MMMM', { locale: fr })}
            </p>
          </div>
          
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Planning de la semaine */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
          {weekDays.map((day, index) => {
            const session = getSessionForDate(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] sm:min-h-[120px] border rounded-lg p-2 sm:p-3 transition-all duration-200 ${
                  isToday
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="text-center mb-2 sm:mb-3">
                  <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                    {daysOfWeek[index].short}
                  </div>
                  <div className={`text-base sm:text-lg font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {format(day, 'd')}
                  </div>
                </div>

                {session ? (
                  <div 
                    className={`p-2 sm:p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getSessionTypeColor(session.session_type || 'training')}`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                      <div className="text-xs font-medium truncate flex-1 leading-tight" title={session.name}>
                        {session.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markSessionCompleted(session.id)
                        }}
                        className={`p-0.5 sm:p-1 rounded transition-colors flex-shrink-0 ${
                          session.completed 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={session.completed ? 'Séance terminée' : 'Marquer comme terminée'}
                      >
                        {session.completed ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : <Circle className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </button>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="flex items-center space-x-1 text-xs">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                        <span>{session.duration_minutes || 60}min</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                        <span className={getIntensityColor(session.intensity)}>
                          {session.intensity === 'low' ? 'Faible' : session.intensity === 'medium' ? 'Moyenne' : 'Élevée'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-12 sm:h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-center flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Repos</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Détails de la séance sélectionnée */}
      {selectedSession && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedSession.name}
            </h3>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(selectedSession.created_at), 'EEEE d MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{selectedSession.duration_minutes || 60} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>Intensité {selectedSession.intensity === 'low' ? 'faible' : selectedSession.intensity === 'medium' ? 'moyenne' : 'élevée'}</span>
              </div>
            </div>
            
            {selectedSession.description && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Programme :</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                  {selectedSession.description}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {selectedSession.completed ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Séance terminée</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Séance à faire</span>
                  </>
                )}
              </div>
              
              {!selectedSession.completed && (
                <button
                  onClick={() => markSessionCompleted(selectedSession.id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors"
                >
                  Marquer comme terminée
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucune séance */}
      {sessionTemplates.length === 0 && hasLoadedPlanning && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Aucun programme assigné
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Votre coach n'a pas encore créé de programme d'entraînement pour vous.
          </p>
        </div>
      )}
      </>
      )}

      {currentView === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Entraînements Réalisés</h2>
          <p>Cette fonctionnalité est en cours de développement.</p>
        </div>
      )}
    </div>
  )
}