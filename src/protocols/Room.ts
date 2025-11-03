import { IconThemeData } from '@/utils/icons';

export type User = {
  id: string;
  name: string;
};

export type Vote = {
  id: string;
  voting_round_id: string;
  user_id: string;
  card: string;
  created_at: string;
  user: User;
};

export type VotingRound = {
  id: string;
  vote_id: string;
  voted_at: string;
  duration: number | null;
  consensus: string;
  winner_cards: string[];
  votes: Vote[];
};

export type VotingSession = {
  id: string;
  room_id: string;
  topic: string;
  sector: string;
  created_at: string;
  finalized_at: string | null;
  total_duration: number | null;
  final_consensus: string | null;
  voting_rounds: VotingRound[];
};

export type RoomProps = {
  access: string;
  created_at: string;
  id: string;
  lat: number;
  lng: number;
  name: string;
  owner_id: string;
  private: boolean;
  status: 'OPEN' | 'CLOSED';
  theme: IconThemeData;
  cards_open: boolean;
  who_can_edit: string[];
  who_can_open_cards: string[];
  who_can_aprove_entries: string[];
  start_timer?: string | null;
  stop_timer?: string | null;
  auto_grant_permissions: boolean;
  current_sector?: string | null;
  current_issue?: string | null;
  last_activity: string;
  votes: VotingSession[];
};
