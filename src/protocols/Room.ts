import { IconThemeData } from '@/utils/icons';

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
};
