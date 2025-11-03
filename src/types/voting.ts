export type Sector = 'backend' | 'front-web' | 'front-app';

export interface Vote {
  userId?: string;
  userName: string;
  card: string;
}

export interface VotingRound {
  id: string;
  votedAt: Date;
  duration: number; // em segundos
  consensus: string; // carta vencedora ou "Empate"
  winnerCards: string[];
  votes: Vote[];
}

export interface HistoryItem {
  id: string;
  topic: string;
  sector: Sector;
  createdAt: Date;
  finalizedAt?: Date;
  totalDuration?: number;
  votingRounds: VotingRound[];
  finalConsensus?: string;
}