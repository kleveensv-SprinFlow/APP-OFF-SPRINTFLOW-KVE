import React from 'react';
import { Menu, LogOut, RefreshCw, Crown, User as UserIcon } from 'lucide-react';
import useAuth from '../hooks/useAuth.ts';
import { useProfile } from '../hooks/useProfile.ts';

interface HeaderProps {
  onMenuClick: () => void;
  userRole?: 'athlete' | 'coach' | 'developer';
  onRefreshData?: () => void;
  onProfileClick?: () => void;
}

export default function Header({ onMenuClick, userRole, onRefreshData, onProfileClick }: HeaderProps) {
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

    // Forcer le rechargement après déconnexion
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 overflow-hidden header-3d">
      <div className="px-4 py-3 flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 lg:hidden button-3d"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 flex justify-center min-w-0">
          <div className="flex items-center space-x-3">
            {/* Photo de profil */}
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
                  onError={(e) => {
                    console.error('❌ Erreur chargement photo profil:', profile.photo_url)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <UserIcon className="w-5 h-5 text-primary-500" />
              )}
            </button>

            {/* Debug info profil */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 max-w-32 truncate">
                {profile?.first_name || 'Pas de prénom'} {profile?.last_name || 'Pas de nom'}
              </div>
            )}

            {/* Badge de statut */}
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
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Bouton de rafraîchissement */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 hidden xs:block button-3d"
            title="Actualiser les données"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Bouton de déconnexion simple */}
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