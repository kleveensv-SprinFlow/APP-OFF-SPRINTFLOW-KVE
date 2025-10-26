import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  className = ''
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center justify-center space-x-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Minus className="w-4 h-4 text-gray-700 dark:text-white" />
        </button>

        <div className="w-16 h-10 flex items-center justify-center bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {value}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 text-gray-700 dark:text-white" />
        </button>
      </div>
    </div>
  );
};
