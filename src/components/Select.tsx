import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

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
};

export const Select = ({
  label,
  options,
  disabled,
  value,
  onChange,
  placeholder = 'Selecione',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(
    options.findIndex((option) => option.value === value),
  );
  const selectRef = useRef<HTMLDivElement>(null);

  const toggleOptions = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
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

      const setHighlightedIndexFunction = setHighlightedIndex((prev) => {
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

      setIsOpen((prev) => {
        wasOpen = prev;
        return true;
      });

      let prevValue = '';

      const onChangeFunction = onChange((prev) => {
        prevValue = prev;

        return prev;
      });

      await Promise.all([onChangeFunction]);

      setHighlightedIndex((prev) => {
        const currentValueSelected = options.findIndex(
          (option) => option.value === prevValue,
        );

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

      setIsOpen((prev) => {
        wasOpen = prev;
        return true;
      });

      let prevValue = '';

      const onChangeFunction = onChange((prev) => {
        prevValue = prev;

        return prev;
      });

      await Promise.all([onChangeFunction]);

      setHighlightedIndex((prev) => {
        const currentValueSelected = options.findIndex(
          (option) => option.value === prevValue,
        );

        const nextPosition = (advance = 1) =>
          (prev - advance + options.length) % options.length;

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
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
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

    setHighlightedIndex(options.findIndex((option) => option.value === value));
  }, [isOpen]);

  const getOptionClass = (option: Option, index: number) => {
    if (option.disabled) {
      return 'text-gray-400 cursor-not-allowed';
    }

    const baseClass =
      'px-4 py-2 text-sm cursor-pointer text-gray-900 dark:text-gray-200';
    const isSelected = option.value === value;
    const isHighlighted = highlightedIndex === index;

    return twMerge(
      baseClass,
      isSelected
        ? 'bg-purple-300 dark:bg-purple-700'
        : isHighlighted
          ? 'bg-purple-200 dark:bg-purple-600'
          : 'hover:bg-purple-200 dark:hover:bg-purple-600',
    );
  };

  return (
    <div className="flex flex-col" ref={selectRef}>
      {label && (
        <label
          className={twMerge(
            'mb-2 text-sm font-medium',
            disabled
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-700 dark:text-gray-300',
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
        className={twMerge("relative", disabled ? "cursor-not-allowed" : "cursor-pointer")}
      >
        <div
          onClick={toggleOptions}
          className={twMerge(
            'block w-full px-4 py-2 text-sm rounded-lg transition-colors border border-gray-300',
            'bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
            disabled
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-500'
              : 'focus:border-purple-500 focus:outline-none',
          )}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <span
            className={twMerge(
              'absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          >
            <ChevronDown className="text-gray-400 dark:text-gray-500" />
          </span>
        </div>
        {isOpen && !disabled && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
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
