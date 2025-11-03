import { ChevronDown } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  label?: string;
  options: Option[];
  disabled?: boolean;
  value: string;
  placeholder?: string;
  onChange: Dispatch<SetStateAction<string>>;
  size?: 'sm' | 'md';
  variant?: 'default' | 'discrete';
};

export const Select = ({
  label,
  options,
  disabled,
  value,
  onChange,
  placeholder = 'Selecione',
  size = 'md',
  variant = 'default',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(
    options.findIndex(option => option.value === value)
  );
  const selectRef = useRef<HTMLDivElement>(null);

  const toggleOptions = () => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      closeDropdown();
      return;
    }

    if (event.key === 'Enter') {
      let prevHighlightedIndex = 0;

      const setHighlightedIndexFunction = setHighlightedIndex(prev => {
        prevHighlightedIndex = prev;

        return prev;
      });

      await Promise.all([setHighlightedIndexFunction]);

      const value = options[prevHighlightedIndex].value;

      onChange(value);

      toggleOptions();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      let wasOpen = false;

      setIsOpen(prev => {
        wasOpen = prev;
        return true;
      });

      let prevValue = '';

      const onChangeFunction = onChange(prev => {
        prevValue = prev;

        return prev;
      });

      await Promise.all([onChangeFunction]);

      setHighlightedIndex(prev => {
        const currentValueSelected = options.findIndex(option => option.value === prevValue);

        const nextPosition = (advance = 1) => (prev + advance) % options.length;

        if (wasOpen) {
          const prevPosition = nextPosition();

          if (prevPosition === currentValueSelected) return nextPosition(2);

          return prevPosition;
        }

        return prev;
      });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      let wasOpen = false;

      setIsOpen(prev => {
        wasOpen = prev;
        return true;
      });

      let prevValue = '';

      const onChangeFunction = onChange(prev => {
        prevValue = prev;

        return prev;
      });

      await Promise.all([onChangeFunction]);

      setHighlightedIndex(prev => {
        const currentValueSelected = options.findIndex(option => option.value === prevValue);

        const nextPosition = (advance = 1) => (prev - advance + options.length) % options.length;

        if (wasOpen) {
          const prevPosition = nextPosition();

          if (prevPosition === currentValueSelected) return nextPosition(2);

          return prevPosition;
        }

        return prev;
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (hasFocus) {
      document.addEventListener('keydown', handleKeyDown);
    }
    if (!hasFocus) {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasFocus]);

  useEffect(() => {
    if (!isOpen) return;

    setHighlightedIndex(options.findIndex(option => option.value === value));
  }, [isOpen]);

  const getOptionClass = (option: Option, index: number) => {
    if (option.disabled) {
      return 'px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs text-gray-400 cursor-not-allowed';
    }

    const baseClass =
      'px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs cursor-pointer transition-colors duration-150';
    const isSelected = option.value === value;
    const isHighlighted = highlightedIndex === index;

    return twMerge(
      baseClass,
      isSelected
        ? 'bg-purple-500 text-white font-medium'
        : isHighlighted
          ? 'bg-purple-100 dark:bg-purple-800 text-purple-900 dark:text-purple-100'
          : 'text-gray-900 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30'
    );
  };

  return (
    <div className="flex flex-col" ref={selectRef}>
      {label && (
        <label
          className={twMerge(
            'mb-1.5 sm:mb-2 text-[0.65rem] sm:text-xs font-medium',
            disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
        </label>
      )}
      <div
        tabIndex={0}
        onFocus={() => setHasFocus(true)}
        onBlur={() => {
          setHasFocus(false);
          closeDropdown();
        }}
        className={twMerge('relative', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
      >
        <div
          onClick={toggleOptions}
          className={twMerge(
            'flex items-center w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs rounded-lg transition-all duration-200 cursor-pointer',
            size === 'sm' ? 'h-8' : 'h-9',
            variant === 'discrete'
              ? 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'bg-white dark:bg-gray-800 border',
            variant === 'discrete'
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-900 dark:text-gray-200',
            disabled
              ? variant === 'discrete'
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed'
              : variant === 'discrete'
                ? ''
                : isOpen
                  ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800 shadow-sm'
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500',
            variant === 'default' &&
              'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800'
          )}
        >
          <span
            className={twMerge(
              'flex-1 truncate',
              value ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {value ? options.find(option => option.value === value)?.label : placeholder}
          </span>
          <ChevronDown
            className={twMerge(
              'w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200 shrink-0',
              isOpen ? 'text-purple-500 rotate-180' : 'text-gray-400 dark:text-gray-500'
            )}
          />
        </div>
        {isOpen && !disabled && (
          <ul className="absolute z-9999 min-w-full w-max mt-1 bg-white border border-purple-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-purple-700 max-h-60 overflow-y-auto left-1/2 transform -translate-x-1/2">
            {options.map((option, index) => (
              <li
                key={option.value}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={getOptionClass(option, index)}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    closeDropdown();
                  }
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

Select.displayName = 'Select';
