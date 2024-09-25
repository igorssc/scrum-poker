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
  theme: string;
};
