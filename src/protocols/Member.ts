export type MemberProps = {
  member: {
    name: string;
    id: string;
    created_at: string;
  };
  vote: string | null;
  status: 'PENDING' | 'LOGGED' | 'REFUSED';
  created_at: string;
  id: string;
};
