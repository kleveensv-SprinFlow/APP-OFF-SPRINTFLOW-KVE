import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EditAthleticDataModalProps {
  currentDateNaissance: string | null;
  currentTaille: number | null;
  tailleLastModif: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditAthleticDataModal({
  currentDateNaissance,
  currentTaille,
  tailleLastModif,
  onClose,
  onSaved,
}: EditAthleticDataModalProps) {
  const [dateNaissance, setDateNaissance] = useState(currentDateNaissance || '');
  const [taille, setTaille] = useState(currentTaille?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTailleBlocked, setIsTailleBlocked] = useState(false);
  const [nextModifDate, setNextModifDate] = useState<string | null>(null);

  useEffect(() => {
    checkTailleModification();
  }, [tailleLastModif]);

  const checkTailleModification = () => {
    if (!tailleLastModif) {
      setIsTailleBlocked(false);
      return;
    }

    const lastModif = new Date(tailleLastModif);
    const today = new Date();
    const daysSinceLastModif = Math.floor((today.getTime() - lastModif.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastModif < 30) {
      setIsTailleBlocked(true);
      const nextDate = new Date(lastModif);
      nextDate.setDate(nextDate.getDate() + 30);
      setNextModifDate(nextDate.toLocaleDateString('fr-FR'));
    } else {
      setIsTailleBlocked(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const updates: any = {};

      if (dateNaissance) {
        updates.date_de_naissance = dateNaissance;
      }

      if (taille && !isTailleBlocked) {
        const tailleNum = parseInt(taille);
        if (isNaN(tailleNum) || tailleNum < 100 || tailleNum > 250) {
          throw new Error('La taille doit être entre 100 et 250 cm');
        }
        updates.taille_cm = tailleNum;
        updates.taille_derniere_modif = new Date().toISOString();
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('Aucune modification à enregistrer');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      onSaved();
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mettre à jour mes données</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de naissance
            </label>
            <input
              type="date"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Taille (cm)
            </label>
            <input
              type="number"
              value={taille}
              onChange={(e) => setTaille(e.target.value)}
              disabled={isTailleBlocked}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900"
              placeholder="170"
              min="100"
              max="250"
            />
            {isTailleBlocked && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Pour garantir la fiabilité des calculs, vous ne pouvez modifier votre taille qu'une fois tous les 30 jours.
                  <br />
                  <strong>Prochaine modification possible le : {nextModifDate}</strong>
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
