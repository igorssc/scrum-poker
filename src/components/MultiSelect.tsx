'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showAllOption?: boolean;
}

export const MultiSelect = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione...',
  className,
  showAllOption = false,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (disabled) return;

    if (optionValue === 'ALL') {
      // Se clicou em "Todos", seleciona/deseleciona todos os disponíveis
      const enabledOptions = options.filter(opt => !opt.disabled);
      const allEnabled = enabledOptions.every(opt => value.includes(opt.value));

      if (allEnabled) {
        // Deseleciona todos (mantém apenas os disabled)
        const disabledValues = options
          .filter(opt => opt.disabled && value.includes(opt.value))
          .map(opt => opt.value);
        onChange(disabledValues);
      } else {
        // Seleciona todos
        const allValues = options.map(opt => opt.value);
        onChange(allValues);
      }
      return;
    }

    const option = options.find(opt => opt.value === optionValue);
    if (option?.disabled) return;

    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];

    onChange(newValue);
  };

  const selectedOptions = options.filter(option => value.includes(option.value));
  const enabledOptions = options.filter(opt => !opt.disabled);
  const allEnabledSelected =
    enabledOptions.length > 0 && enabledOptions.every(opt => value.includes(opt.value));

  const displayText =
    selectedOptions.length === 0
      ? placeholder
      : allEnabledSelected && showAllOption && options.length >= 3
        ? 'Todos'
        : selectedOptions.map(opt => opt.label).join(', ');

  return (
    <div className={twMerge('flex flex-col gap-1.5 sm:gap-2', className)}>
      {label && (
        <label
          className={twMerge(
            'text-[0.65rem] sm:text-xs font-medium',
            disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={twMerge(
            'relative block w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs rounded-lg transition-colors',
            'border border-gray-300 focus:border-purple-500 focus:outline-none',
            'bg-white text-gray-900 placeholder-gray-500',
            'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
            'dark:focus:border-purple-400 dark:placeholder-gray-400',
            disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'cursor-pointer'
          )}
        >
          <span
            className={twMerge(
              'truncate block pr-8 text-left',
              selectedOptions.length === 0 && 'text-gray-500 dark:text-gray-400'
            )}
          >
            {displayText}
          </span>
          <span
            className={twMerge(
              'absolute right-2.5 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          >
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
          </span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                Nenhuma opção disponível
              </div>
            ) : (
              <>
                {showAllOption && options.length >= 3 && (
                  <button
                    key="ALL"
                    type="button"
                    onClick={() => toggleOption('ALL')}
                    className={twMerge(
                      'w-full px-3 py-2 text-[0.65rem] sm:text-xs text-left transition-colors duration-200',
                      'flex items-center justify-between border-b border-gray-200 dark:border-gray-600',
                      'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-medium',
                      'text-gray-900 dark:text-gray-100'
                    )}
                  >
                    <span className="truncate">Todos</span>
                    {options
                      .filter(opt => !opt.disabled)
                      .every(opt => value.includes(opt.value)) && (
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                )}
                {options.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    disabled={option.disabled}
                    className={twMerge(
                      'w-full px-3 py-2 text-[0.65rem] sm:text-xs text-left transition-colors duration-200',
                      'flex items-center justify-between',
                      !option.disabled && 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer',
                      option.disabled && 'cursor-not-allowed bg-gray-50 dark:bg-gray-700/50',
                      value.includes(option.value)
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'text-gray-900 dark:text-gray-100'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {value.includes(option.value) && (
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
