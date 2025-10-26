import React from 'react';
import { ChevronLeft, LogOut, RefreshCw, Crown, User as UserIcon, Dumbbell } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

interface HeaderProps {
  userRole?: 'athlete' | 'coach' | 'developer';
  onRefreshData?: () => void;
  onProfileClick?: () => void;
  onWorkoutsClick?: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export default function Header({ userRole, onRefreshData, onProfileClick, onWorkoutsClick, canGoBack, onBack, title }: HeaderProps) {
  const { profile } = useProfile();
  const { signOut } = useAuth();

  const handleRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const handleSignOut = async () => {
    console.log('🚪 BOUTON DÉCONNEXION CLIQUÉ');
    await signOut();

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 overflow-hidden header-3d">
      <div className="px-4 py-3 flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4">
          {canGoBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 button-3d"
              aria-label="Retour"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        <div className="flex-1 flex justify-center min-w-0">
          {!canGoBack ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={onProfileClick}
                className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 flex items-center justify-center flex-shrink-0 border-2 border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                title="Mon Profil"
              >
                {profile?.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <UserIcon className="w-5 h-5 text-primary-500" />
                )}
              </button>

              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                (userRole === 'coach' || userRole === 'developer')
                  ? 'bg-secondary-100 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-800'
                  : 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
              }`}>
                {(userRole === 'coach' || userRole === 'developer') ? (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>{userRole === 'developer' ? 'Développeur' : 'Coach'}</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4" />
                    <span>Athlète</span>
                  </>
                )}
              </div>
                <button
                    onClick={onWorkoutsClick}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 button-3d"
                    title="Séances"
                >
                    <Dumbbell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
            </div>
          ) : (
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">{title || ''}</h1>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 w-1/4 justify-end">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 hidden xs:block button-3d"
            title="Actualiser les données"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 button-3d"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}