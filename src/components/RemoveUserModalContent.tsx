import { useEffect, useRef } from 'react';
import { Button } from './Button';

interface RemoveUserModalContentProps {
  userName: string;
  isRemoving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RemoveUserModalContent = ({
  userName,
  isRemoving,
  onConfirm,
  onCancel,
}: RemoveUserModalContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Foca no container quando o modal abre
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isRemoving) {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm, isRemoving]);

  return (
    <div
      ref={containerRef}
      className="py-4 sm:py-6 lg:py-8"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
        <p className="text-xs text-center sm:text-sm text-gray-600 dark:text-gray-400">
          Tem certeza que deseja remover <strong>{userName}</strong> da sala?
        </p>

        <footer className="flex gap-2 sm:gap-3 w-full dark:border-gray-700">
          <Button onClick={onCancel} variant="secondary" className="flex-1" disabled={isRemoving}>
            Cancelar
          </Button>

          <Button onClick={onConfirm} className="flex-1" disabled={isRemoving}>
            {isRemoving ? 'Removendo...' : 'Remover'}
          </Button>
        </footer>
      </div>
    </div>
  );
};
