import React, { useState, useEffect } from 'react';
import { Moon, Star, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SleepEntry {
  id: string;
  date: string;
  duree_heures: number;
  qualite_ressentie: number;
}

export function SleepTracker() {
  const [todayEntry, setTodayEntry] = useState<SleepEntry | null>(null);
  const [heureCoucher, setHeureCoucher] = useState<string>('23:00');
  const [heureReveil, setHeureReveil] = useState<string>('07:30');
  const [qualiteRessentie, setQualiteRessentie] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sommeil_journalier')
        .select('*')
        .eq('athlete_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTodayEntry(data);
        setQualiteRessentie(data.qualite_ressentie);

        const duree = data.duree_heures;
        const reveillDefaut = new Date();
        reveillDefaut.setHours(7, 30, 0, 0);

        const coucherDate = new Date(reveillDefaut);
        coucherDate.setHours(coucherDate.getHours() - Math.floor(duree));
        coucherDate.setMinutes(coucherDate.getMinutes() - Math.round((duree % 1) * 60));

        setHeureCoucher(coucherDate.toTimeString().substring(0, 5));
        setHeureReveil(reveillDefaut.toTimeString().substring(0, 5));
      }
    } catch (error) {
      console.error('Erreur chargement sommeil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuree = (coucher: string, reveil: string): number => {
    const [cH, cM] = coucher.split(':').map(Number);
    const [rH, rM] = reveil.split(':').map(Number);

    let coucherMinutes = cH * 60 + cM;
    let reveilMinutes = rH * 60 + rM;

    if (reveilMinutes <= coucherMinutes) {
      reveilMinutes += 24 * 60;
    }

    const diffMinutes = reveilMinutes - coucherMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100;
  };

  const dureeHeures = calculateDuree(heureCoucher, heureReveil);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      if (todayEntry) {
        const { error } = await supabase
          .from('sommeil_journalier')
          .update({
            duree_heures: dureeHeures,
            qualite_ressentie: qualiteRessentie,
          })
          .eq('id', todayEntry.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sommeil_journalier')
          .insert({
            athlete_id: user.id,
            date: today,
            duree_heures: dureeHeures,
            qualite_ressentie: qualiteRessentie,
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Enregistré !' });
      await loadTodayEntry();
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur de sauvegarde' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuree = (heures: number) => {
    const h = Math.floor(heures);
    const m = Math.round((heures - h) * 60);
    return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sommeil</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatDuree(dureeHeures)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(today).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Coucher
            </label>
            <input
              type="time"
              value={heureCoucher}
              onChange={(e) => setHeureCoucher(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Réveil
            </label>
            <input
              type="time"
              value={heureReveil}
              onChange={(e) => setHeureReveil(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Qualité
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => setQualiteRessentie(note)}
                className={`transition-all duration-200 ${
                  qualiteRessentie >= note
                    ? 'text-yellow-400 scale-110'
                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                }`}
              >
                <Star
                  className="w-7 h-7"
                  fill={qualiteRessentie >= note ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`p-2 rounded text-xs font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full text-white py-2 px-3 rounded-lg transition-colors shadow text-sm font-medium flex items-center justify-center ${
            todayEntry
              ? 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
              : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1" />
              {todayEntry ? 'Modifier' : 'Enregistrer'}
            </>
          )}
        </button>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 Données pour votre Score de Forme
          </p>
        </div>
      </div>
    </div>
  );
}
