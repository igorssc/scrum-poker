export type MemberProps = {
  member: {
    name: string;
    id: string;
    created_at: string;
  };
  vote: any;
  status: 'PENDING' | 'LOGGED';
  created_at: string;
  id: string;
};
