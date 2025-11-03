import { Button } from './Button';

export const ClearIssueModalContent = ({
  currentIssue,
  onConfirm,
  onCancel,
}: {
  currentIssue: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="space-y-3">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Tem certeza que deseja remover a issue atual?
    </p>
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
      <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
        "{currentIssue}"
      </p>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      O timer também será resetado automaticamente.
    </p>
    <div className="flex justify-end gap-2 pt-2">
      <Button onClick={onCancel} variant="secondary">
        Cancelar
      </Button>
      <Button
        onClick={onConfirm}
        variant="primary"
        className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
      >
        Remover Issue
      </Button>
    </div>
  </div>
);
