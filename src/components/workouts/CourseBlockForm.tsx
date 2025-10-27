import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { produce } from 'immer';

export interface CourseBlockData {
  id: string;
  series: number;
  reps: number;
  distance: number;
  restBetweenReps: string;
  restBetweenSeries: string;
  chronos: (number | null)[][]; // Array of series, each containing an array of rep times
}

interface CourseBlockFormProps {
  block: CourseBlockData;
  onChange: (id: string, newBlockData: CourseBlockData) => void;
  onRemove: (id:string) => void;
}

export const CourseBlockForm: React.FC<CourseBlockFormProps> = ({ block, onChange, onRemove }) => {
  const [series, setSeries] = useState(block.series);
  const [reps, setReps] = useState(block.reps);
  const [distance, setDistance] = useState(block.distance);
  const [restBetweenReps, setRestBetweenReps] = useState(block.restBetweenReps);
  const [restBetweenSeries, setRestBetweenSeries] = useState(block.restBetweenSeries);
  const [chronos, setChronos] = useState<(number | null)[][]>(block.chronos);

  // Update parent component when local state changes
  useEffect(() => {
    onChange(block.id, { id: block.id, series, reps, distance, restBetweenReps, restBetweenSeries, chronos });
  }, [series, reps, distance, restBetweenReps, restBetweenSeries, chronos]);

  // Adjust the chronos array size when series/reps change
  useEffect(() => {
    setChronos(currentChronos => {
      const newChronos = produce(currentChronos, draft => {
        // Adjust number of series (rows)
        while (draft.length < series) {
          draft.push(Array(reps).fill(null));
        }
        while (draft.length > series) {
          draft.pop();
        }

        // Adjust number of reps (columns) in each series
        draft.forEach((serie, index) => {
          while (draft[index].length < reps) {
            draft[index].push(null);
          }
          while (draft[index].length > reps) {
            draft[index].pop();
          }
        });
      });
      return newChronos;
    });
  }, [series, reps]);

  const handleChronoChange = (serieIndex: number, repIndex: number, value: string) => {
    const newChronos = produce(chronos, draft => {
      draft[serieIndex][repIndex] = value ? parseFloat(value) : null;
    });
    setChronos(newChronos);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative">
      <div className="absolute top-2 right-2">
        <button type="button" onClick={() => onRemove(block.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Block Structure Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Séries</label>
            <input
              type="number"
              value={series}
              onChange={(e) => setSeries(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Répétitions</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance (m)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Repos / Rép</label>
            <input
              type="text"
              placeholder="ex: 2m30s"
              value={restBetweenReps}
              onChange={(e) => setRestBetweenReps(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Repos / Série</label>
            <input
              type="text"
              placeholder="ex: 8m"
              value={restBetweenSeries}
              onChange={(e) => setRestBetweenSeries(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        {/* Chrono Inputs */}
        <div className="space-y-3 pt-2">
          <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">Saisie des chronomètres (en secondes)</h4>
          {chronos.map((serie, serieIndex) => (
            <div key={serieIndex} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="mb-2 font-semibold text-xs text-gray-700 dark:text-gray-300">Série {serieIndex + 1}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {serie.map((chrono, repIndex) => (
                  <div key={repIndex}>
                     <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Rép {repIndex + 1}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="--"
                      value={chrono ?? ''}
                      onChange={(e) => handleChronoChange(serieIndex, repIndex, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};