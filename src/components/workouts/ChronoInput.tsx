import React, { useState, ChangeEvent } from 'react';

interface ChronoInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

const formatChrono = (value: number | null): string => {
  if (value === null) return '';
  const seconds = Math.floor(value);
  const hundredths = Math.round((value - seconds) * 100);
  return `${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
};

const parseChrono = (str: string): number | null => {
  const digits = str.replace(/[^0-9]/g, '');
  if (digits.length === 0) return null;

  if (digits.length <= 2) {
    return parseFloat(`0.${digits}`);
  }

  const seconds = digits.slice(0, -2);
  const hundredths = digits.slice(-2);
  return parseFloat(`${seconds}.${hundredths}`);
};


export const ChronoInput: React.FC<ChronoInputProps> = ({
  value,
  onChange,
  placeholder = '__.__',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(formatChrono(value));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/[^0-9]/g, '');
    let formatted = '';

    if (digits.length > 0) {
      if (digits.length <= 2) {
        formatted = `.${digits}`;
      } else {
        const seconds = digits.slice(0, -2);
        const hundredths = digits.slice(-2);
        formatted = `${seconds}.${hundredths}`;
      }
    }

    setDisplayValue(formatted);
    onChange(parseChrono(input));
  };

  const handleBlur = () => {
    setDisplayValue(formatChrono(value));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 ${className}`}
    />
  );
};
