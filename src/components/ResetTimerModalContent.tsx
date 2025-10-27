import { Button } from './Button';

interface ResetTimerModalContentProps {
  formattedTime: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetTimerModalContent = ({ 
  formattedTime, 
  onConfirm, 
  onCancel 
}: ResetTimerModalContentProps) => {
  return (
    <div className="py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tem certeza que deseja resetar o timer? O tempo atual ({formattedTime}) será perdido.
        </p>
        
        <footer className="flex gap-2 sm:gap-3 w-full border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 lg:pt-8">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>

          <Button
            onClick={onConfirm}
            className="flex-1"
          >
            Resetar
          </Button>
        </footer>
      </div>
    </div>
  );
};