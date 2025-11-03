import { HistoryItem, Sector } from '@/types/voting';
import React, { useState } from 'react';
import CurrentIssue from './CurrentIssue';
import IssueHistory from './IssueHistory';

interface IssueManagerProps {
  currentIssue: string;
  currentSector: Sector;
  historyItems: HistoryItem[];
  time: number;
  isRunning: boolean;
  onFinalizeIssue?: (issue: string, sector: Sector) => void;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onResetTimer?: () => void;
}

export const IssueManager = ({
  currentIssue: initialIssue,
  currentSector: initialSector,
  historyItems,
  time,
  isRunning,
  onFinalizeIssue,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
}: IssueManagerProps) => {
  const [currentIssue, setCurrentIssue] = useState(initialIssue);
  const [currentSector, setCurrentSector] = useState(initialSector);
  const [tempIssue, setTempIssue] = useState(initialIssue);
  const [tempSector, setTempSector] = useState(initialSector);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [sectorFilter, setSectorFilter] = useState<Sector | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'sector' | 'score' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetailedHistory, setShowDetailedHistory] = useState(false);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleStartEdit = () => {
    setTempIssue(currentIssue);
    setTempSector(currentSector);
    setIsEditing(true);
  };

  const handleSave = () => {
    const wasEmpty = !currentIssue.trim();
    setCurrentIssue(tempIssue);
    setCurrentSector(tempSector);
    setIsEditing(false);
    
    // Se era uma issue nova (campo estava vazio) e agora tem conteúdo, iniciar o timer
    if (wasEmpty && tempIssue.trim() && onStartTimer) {
      onStartTimer();
    }
  };

  const handleCancel = () => {
    setTempIssue(currentIssue);
    setTempSector(currentSector);
    setIsEditing(false);
  };

  const handleFinalize = () => {
    if (currentIssue.trim() && onFinalizeIssue) {
      onFinalizeIssue(currentIssue, currentSector);
      setCurrentIssue('');
      setCurrentSector('backend');
      if (isRunning && onResetTimer) {
        onResetTimer();
      }
    }
  };

  const handleToggleHistory = () => {
    setIsHistoryExpanded(!isHistoryExpanded);
  };

  const handleToggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleToggleDetailedHistory = () => {
    setShowDetailedHistory(!showDetailedHistory);
  };

  return {
    CurrentIssue: (
      <CurrentIssue
        currentIssue={currentIssue}
        currentSector={currentSector}
        tempIssue={tempIssue}
        tempSector={tempSector}
        isEditing={isEditing}
        time={time}
        isRunning={isRunning}
        showResetModal={showResetModal}
        onStartEdit={handleStartEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onFinalize={handleFinalize}
        onStartTimer={onStartTimer}
        onPauseTimer={onPauseTimer}
        onResetTimer={onResetTimer}
        onTempIssueChange={setTempIssue}
        onTempSectorChange={setTempSector}
        onShowResetModal={setShowResetModal}
        formatTime={formatTime}
      />
    ),
    IssueHistory: (
      <IssueHistory
        historyItems={historyItems}
        isHistoryExpanded={isHistoryExpanded}
        sectorFilter={sectorFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        showDetailedHistory={showDetailedHistory}
        onToggleHistory={handleToggleHistory}
        onSectorFilterChange={setSectorFilter}
        onSortByChange={setSortBy}
        onToggleSortOrder={handleToggleSortOrder}
        onToggleDetailedHistory={handleToggleDetailedHistory}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    )
  };
};
