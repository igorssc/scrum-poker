'use client';

import { useState } from 'react';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { Box } from './Box';
import { Button } from './Button';
import { Input } from './Input';

interface VotingTopicProps {
  onFinalizeTopic?: (topic: string) => void;
}

export function VotingTopic({ onFinalizeTopic }: VotingTopicProps) {
  const [topic, setTopic] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempTopic, setTempTopic] = useState('');

  const handleStartEdit = () => {
    setTempTopic(topic);
    setIsEditing(true);
  };

  const handleSave = () => {
    setTopic(tempTopic);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTopic(topic);
    setIsEditing(false);
  };

  const handleFinalize = () => {
    if (topic.trim() && onFinalizeTopic) {
      onFinalizeTopic(topic);
      setTopic('');
    }
  };

  return (
    <Box className="w-full">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Tema da Votação
          </h3>
          
          {topic && !isEditing && (
            <Button
              onClick={handleFinalize}
              variant="primary"
              className="text-xs sm:text-sm px-3 py-1.5"
            >
              Finalizar Tema
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                value={tempTopic}
                onChange={(e) => setTempTopic(e.target.value)}
                placeholder="Digite o tema da votação..."
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
              <Button
                onClick={handleSave}
                variant="primary"
                className="p-2"
                title="Salvar"
              >
                <FaCheck className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleCancel}
                variant="secondary"
                className="p-2"
                title="Cancelar"
              >
                <FaTimes className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartEdit}
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {topic ? (
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {topic}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 italic">
                    Clique para definir o tema da votação
                  </p>
                )}
              </button>
              {topic && (
                <Button
                  onClick={handleStartEdit}
                  variant="tertiary"
                  className="p-2"
                  title="Editar tema"
                >
                  <FaEdit className="w-3 h-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Box>
  );
}