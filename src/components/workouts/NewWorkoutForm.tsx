import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar } from 'lucide-react';
import { Workout, WorkoutRun, WorkoutMuscu } from '../../types';
import useAuth from '../../hooks/useAuth';
import { useExercices } from '../../hooks/useExercices';
import { DistanceSelector } from '../DistanceSelector';

interface NewWorkoutFormProps {
  editingWorkout?: Workout | null;
  onSave: (workout: Omit<Workout, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function NewWorkoutForm({ editingWorkout, onSave, onCancel }: NewWorkoutFormProps) {
  const { user } = useAuth();
  const { exercices } = useExercices();

  const [date, setDate] = useState(editingWorkout?.date || new Date().toISOString().split('T')[0]);
  const [tagSeance, setTagSeance] = useState<'vitesse_max' | 'lactique_piste' | 'lactique_cote' | 'aerobie' | 'musculation' | ''>(
    editingWorkout?.tag_seance || ''
  );

  const [courses, setCourses] = useState<WorkoutRun[]>(editingWorkout?.courses_json || []);
  const [muscu, setMuscu] = useState<WorkoutMuscu[]>(editingWorkout?.muscu_json || []);

  const [autresActivites, setAutresActivites] = useState(editingWorkout?.autres_activites || '');
  const [echelleEffort, setEchelleEffort] = useState<number | ''>(editingWorkout?.echelle_effort || '');
  const [notes, setNotes] = useState(editingWorkout?.notes || '');

  const [meteo, setMeteo] = useState(editingWorkout?.meteo || '');
  const [temperature, setTemperature] = useState<number | ''>(editingWorkout?.temperature || '');

  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const distancesPredef = ['30m', '40m', '50m', '60m', '80m', '100m', '110m', '120m', '150m', '200m', '250m', '300m', '400m'];

  const addCourse = () => {
    setCourses([
      ...courses,
      { distance: '60m', temps: 0, type_chrono: 'manuel', repos: '', chaussures: 'pointes', terrain: 'piste' }
    ]);
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (index: number, field: keyof WorkoutRun, value: any) => {
    const newCourses = [...courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setCourses(newCourses);
  };

  const addMuscu = () => {
    setMuscu([
      ...muscu,
      { exercice_id: '', exercice_nom: '', series: 0, reps: 0, poids: 0 }
    ]);
  };

  const removeMuscu = (index: number) => {
    setMuscu(muscu.filter((_, i) => i !== index));
  };

  const updateMuscu = (index: number, field: keyof WorkoutMuscu, value: any) => {
    const newMuscu = [...muscu];
    newMuscu[index] = { ...newMuscu[index], [field]: value };
    setMuscu(newMuscu);
  };

  const selectExercice = (index: number, exerciceId: string) => {
    const exercice = exercices.find(e => e.id === exerciceId);
    if (exercice) {
      const newMuscu = [...muscu];
      newMuscu[index] = {
        ...newMuscu[index],
        exercice_id: exerciceId,
        exercice_nom: exercice.nom
      };
      setMuscu(newMuscu);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagSeance) {
      alert('Le type de séance est obligatoire');
      return;
    }

    setSaving(true);

    try {
      const workout: Omit<Workout, 'id'> = {
        user_id: user?.id,
        date,
        title: `Séance ${tagSeance} - ${date}`,
        tag_seance: tagSeance,
        courses_json: courses,
        muscu_json: muscu,
        sauts_json: [],
        lancers_json: [],
        autres_activites: autresActivites || undefined,
        echelle_effort: echelleEffort || undefined,
        notes: notes || undefined,
        meteo: meteo || undefined,
        temperature: temperature || undefined,
        duration_minutes: 60,
        runs: [],
        jumps: [],
        throws: [],
        stairs: [],
        exercises: []
      };

      console.log('💾 Sauvegarde séance...', workout);
      await onSave(workout);
      console.log('✅ Séance sauvegardée avec succès!');
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      alert(`❌ Erreur lors de la sauvegarde: ${error?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredExercices = searchTerm
    ? exercices.filter(e =>
        e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.categorie.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : exercices;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingWorkout ? 'Modifier la séance' : 'Nouvelle séance'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Informations générales</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de la séance *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de séance (Tag/Intention) *
            </label>
            <select
              value={tagSeance}
              onChange={(e) => setTagSeance(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            >
              <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Sélectionner un type</option>
              <option value="vitesse_max" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Vitesse Max / Explosivité</option>
              <option value="lactique_piste" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Lactique Piste</option>
              <option value="lactique_cote" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Lactique Côte</option>
              <option value="aerobie" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Aérobie</option>
              <option value="musculation" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Musculation / Haltérophilie</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Courses / Piste</h3>
            <button
              type="button"
              onClick={addCourse}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter une course
            </button>
          </div>

          {courses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Aucune course ajoutée</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Course {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCourse(index)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="col-span-2">
                      <DistanceSelector
                        value={course.distance}
                        onChange={(val) => updateCourse(index, 'distance', val)}
                        label="Distance *"
                        presetDistances={distancesPredef}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Terrain *</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateCourse(index, 'terrain', 'piste')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              course.terrain === 'piste'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            🏟️ Piste
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCourse(index, 'terrain', 'cote')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              course.terrain === 'cote'
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            ⛰️ Côte
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Temps (s) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={course.temps || ''}
                          onChange={(e) => updateCourse(index, 'temps', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Ex: 6.85"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Type chrono *</label>
                        <select
                          value={course.type_chrono}
                          onChange={(e) => updateCourse(index, 'type_chrono', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        >
                          <option value="manuel">⏱️ Manuel</option>
                          <option value="electronique">📱 Électronique</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Repos</label>
                        <input
                          type="text"
                          placeholder="ex: 8 min"
                          value={course.repos || ''}
                          onChange={(e) => updateCourse(index, 'repos', e.target.value)}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Chaussures</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateCourse(index, 'chaussures', 'pointes')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            course.chaussures === 'pointes'
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          👟 Pointes
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCourse(index, 'chaussures', 'baskets')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            course.chaussures === 'baskets'
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          👟 Baskets
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Musculation / Force</h3>
            <button
              type="button"
              onClick={addMuscu}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter un exercice
            </button>
          </div>

          {muscu.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Aucun exercice ajouté</p>
          ) : (
            <div className="space-y-3">
              {muscu.map((ex, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercice {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMuscu(index)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Exercice *</label>
                    <select
                      value={ex.exercice_id}
                      onChange={(e) => selectExercice(index, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {filteredExercices.map(exercice => (
                        <option key={exercice.id} value={exercice.id}>
                          {exercice.nom} ({exercice.categorie})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Séries *</label>
                      <input
                        type="number"
                        value={ex.series || ''}
                        onChange={(e) => updateMuscu(index, 'series', parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Reps *</label>
                      <input
                        type="number"
                        value={ex.reps || ''}
                        onChange={(e) => updateMuscu(index, 'reps', parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Poids (kg) *</label>
                      <input
                        type="number"
                        step="0.5"
                        value={ex.poids || ''}
                        onChange={(e) => updateMuscu(index, 'poids', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Ressenti / Feedback</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Échelle d'effort (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={echelleEffort || ''}
              onChange={(e) => setEchelleEffort(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
              placeholder="1 = Facile, 10 = Maximal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes libres
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
              placeholder="Sensations, commentaires techniques..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Autres activités
            </label>
            <textarea
              value={autresActivites}
              onChange={(e) => setAutresActivites(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
              placeholder="Sauts, lancers, autres..."
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Conditions (Optionnel)</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Météo
              </label>
              <select
                value={meteo}
                onChange={(e) => setMeteo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
              >
                <option value="">Non spécifiée</option>
                <option value="Soleil">☀️ Soleil</option>
                <option value="Nuageux">☁️ Nuageux</option>
                <option value="Pluie">🌧️ Pluie</option>
                <option value="Vent">💨 Vent</option>
                <option value="Froid">❄️ Froid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Température (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature || ''}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
                placeholder="ex: 20"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : editingWorkout ? 'Mettre à jour' : 'Sauvegarder la séance'}
          </button>
        </div>
      </form>
    </div>
  );
}
