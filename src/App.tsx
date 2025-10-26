import React, { useState, useEffect } from 'react';
import { View } from './types';
import useAuth from './hooks/useAuth';
import { useWorkouts } from './hooks/useWorkouts';
import { useRecords } from './hooks/useRecords';
import { useBodyComposition } from './hooks/useBodyComposition';
import { isSupabaseConfigured } from './lib/supabase';

// Components
import Auth from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import { WorkoutsList } from './components/workouts/WorkoutsList';
import { NewWorkoutForm } from './components/workouts/NewWorkoutForm';
import { RecordsList } from './components/records/RecordsList';
import { RecordsForm } from './components/records/RecordsForm';
import { BodyCompCharts } from './components/bodycomp/BodyCompCharts';
import { BodyCompForm } from './components/bodycomp/BodyCompForm';
import { DetailedAnalysis } from './components/advice/DetailedAnalysis';
import { AthleteGroupView } from './components/groups/AthleteGroupView';
import { GroupManagement } from './components/groups/GroupManagement';
import { CoachPlanning } from './components/planning/CoachPlanning';
import { AthletePlanning } from './components/planning/AthletePlanning';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ProfilePage } from './components/profile/ProfilePage';
import { CoachGroupChat } from './components/groups/CoachGroupChat';
import { PartnershipsList } from './components/PartnershipsList';
import { DeveloperPanel } from './components/developer/DeveloperPanel';
import { NotificationDisplay } from './components/NotificationDisplay';
import { NutritionModule } from './components/nutrition/NutritionModule';

function App() {
  const { user, profile, loading, error } = useAuth();
  const { workouts, saveWorkout, updateWorkout } = useWorkouts();
  const { records, saveRecord } = useRecords();
  const { bodyComps, saveBodyComposition } = useBodyComposition();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [refreshScores, setRefreshScores] = useState<(() => Promise<void>) | null>(null);

  // Gestionnaire d'erreur global
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Erreur globale capturée:', event.error);
      
      // Ignorer certaines erreurs non critiques
      if (event.error?.message?.includes('infinite recursion') || 
          event.error?.message?.includes('Auth session missing')) {
        return;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rejetée:', event.reason);
      
      // Ignorer certaines erreurs non critiques
      if (event.reason?.message?.includes('infinite recursion') || 
          event.reason?.message?.includes('Auth session missing')) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Écouter les événements de changement de vue
  useEffect(() => {
    const handleViewChange = (event: any) => {
      if (event.detail) {
        setCurrentView(event.detail);
      }
    };
    
    window.addEventListener('change-view', handleViewChange);
    
    return () => {
      window.removeEventListener('change-view', handleViewChange);
    };
  }, []);

  // Afficher l'écran de chargement pendant l'initialisation
  if (loading) {
    return <LoadingScreen message="Initialisation de l'application..." />;
  }

  // Afficher l'écran d'authentification si pas d'utilisateur
  if (!user) {
    console.log('🔐 Pas d\'utilisateur - Affichage Auth');
    return <Auth />;
  }

  // Déterminer le rôle avec fallback sécurisé
  const userRole = profile?.role || 'athlete';
  const isDeveloper = user?.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f';
  const effectiveRole = isDeveloper ? 'coach' : userRole;

  const handleWorkoutSave = async (workoutData: any) => {
    console.log('🟢 handleWorkoutSave appelé dans App.tsx', workoutData);
    try {
      if (editingWorkout) {
        console.log('📝 Mode édition, ID:', editingWorkout.id);
        await updateWorkout(editingWorkout.id, workoutData);
      } else {
        console.log('➕ Mode création nouvelle séance');
        await saveWorkout(workoutData);
      }
      console.log('✅ Sauvegarde terminée, changement de vue...');
      setEditingWorkout(null);
      setCurrentView('workouts');
      if (refreshScores) {
        await refreshScores();
      }
    } catch (error: any) {
      console.error('❌ Erreur dans handleWorkoutSave:', error);
      alert(`Erreur: ${error?.message || error}`);
    }
  };

  const handleRecordSave = async (recordData: any) => {
    try {
      await saveRecord(recordData);
      setCurrentView('records');
      if (refreshScores) {
        await refreshScores();
      }
    } catch (error) {
      console.error('Erreur sauvegarde record:', error);
    }
  };

  const handleBodyCompSave = async (bodyCompData: any) => {
    try {
      await saveBodyComposition(bodyCompData);
      setCurrentView('bodycomp');
      if (refreshScores) {
        await refreshScores();
      }
    } catch (error) {
      console.error('Erreur sauvegarde body comp:', error);
    }
  };

  // Fonction pour forcer le rechargement des données depuis Supabase
  const refreshData = () => {
    if (user) {
      // Vider les caches localStorage pour forcer le rechargement depuis Supabase
      localStorage.removeItem(`bodycomps_${user.id}`);
      localStorage.removeItem(`records_${user.id}`);
      localStorage.removeItem(`workouts_${user.id}`);
      
      // Recharger la page pour récupérer les données fraîches
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        userRole={effectiveRole}
        onRefreshData={refreshData}
        onProfileClick={() => setCurrentView('profile')}
      />
      
      <div className="flex">
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={effectiveRole}
        />
        
        <main className="flex-1 p-6 pt-4">
          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <Dashboard
              workouts={workouts || []}
              onViewChange={setCurrentView}
              userRole={effectiveRole}
              onScoresLoad={(fn) => setRefreshScores(() => fn)}
            />
          )}
          
          {/* Workouts */}
          {currentView === 'workouts' && (
            <WorkoutsList 
              onAddWorkout={() => setCurrentView('add-workout')}
              onEditWorkout={(workout) => {
                setEditingWorkout(workout);
                setCurrentView('add-workout');
              }}
            />
          )}
          {currentView === 'add-workout' && (
            <NewWorkoutForm
              editingWorkout={editingWorkout}
              onSave={handleWorkoutSave}
              onCancel={() => {
                setEditingWorkout(null);
                setCurrentView('workouts');
              }}
            />
          )}
          
          {/* Records */}
          {currentView === 'records' && (
            <RecordsList onAddRecord={() => setCurrentView('add-record')} />
          )}
          {currentView === 'add-record' && (
            <RecordsForm 
              records={records || []}
              onSave={handleRecordSave}
              onCancel={() => setCurrentView('records')}
            />
          )}
          
          {/* Body Composition */}
          {currentView === 'bodycomp' && (
            <BodyCompCharts onAddEntry={() => setCurrentView('add-bodycomp')} />
          )}
          {currentView === 'add-bodycomp' && (
            <BodyCompForm 
              onSave={handleBodyCompSave}
              onCancel={() => setCurrentView('bodycomp')}
            />
          )}
          
          {/* Detailed Analysis */}
          {currentView === 'ai' && (
            <DetailedAnalysis />
          )}
          
          {/* Groups */}
          {currentView === 'groups' && effectiveRole === 'athlete' && (
            <AthleteGroupView />
          )}
          {currentView === 'groups' && effectiveRole === 'coach' && (
            <GroupManagement />
          )}
          
          {/* Chat */}
          {currentView === 'chat' && effectiveRole === 'coach' && (
            <CoachGroupChat />
          )}
          
          {/* Planning */}
          {currentView === 'planning' && effectiveRole === 'athlete' && (
            <AthletePlanning />
          )}
          {currentView === 'planning' && effectiveRole === 'coach' && (
            <CoachPlanning />
          )}
          
          {/* Profile */}
          {currentView === 'profile' && (
            <ProfilePage />
          )}
          
          {/* Partnerships */}
          {currentView === 'partnerships' && (
            <PartnershipsList />
          )}

          {/* Nutrition */}
          {currentView === 'nutrition' && (
            <NutritionModule />
          )}

          {/* Developer Panel */}
          {currentView === 'developer' && user && user.id === '75a17559-b45b-4dd1-883b-ce8ccfe03f0f' && (
            <DeveloperPanel />
          )}
        </main>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Global Notifications */}
      <NotificationDisplay />
    </div>
  );
}

export default App;