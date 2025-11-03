import { useEffect, useRef } from 'react';
import { Button } from './Button';

interface ClearIssueModalContentProps {
  currentIssue: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClearIssueModalContent = ({
  currentIssue,
  onConfirm,
  onCancel,
}: ClearIssueModalContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Foca no container quando o modal abre
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm]);

  return (
    <div
      ref={containerRef}
      className="py-4 sm:py-6 lg:py-8"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
        <div className="text-center space-y-6">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Tem certeza que deseja remover a issue atual?
          </p>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <p className="text-xs font-medium text-gray-900 dark:text-white break-all">
              {currentIssue}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            O timer também será resetado automaticamente.
          </p>
        </div>

        <footer className="flex gap-2 sm:gap-3 w-full">
          <Button onClick={onCancel} variant="secondary" className="flex-1">
            Cancelar
          </Button>

          <Button onClick={onConfirm} className="flex-1">
            Remover
          </Button>
        </footer>
      </div>
    </div>
  );
};
