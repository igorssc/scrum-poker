import { useContextSelector } from "use-context-selector";
import { Button } from "./Button";
import { RoomContext } from "@/context/RoomContext";
import { AcceptUsers } from "./AcceptUsers";
import { useQueryClient } from "@tanstack/react-query";
import { MemberProps } from "@/protocols/Member";
import { RoomProps } from "@/protocols/Room";

export const Board = () => {

  const { room, user, logout } = useContextSelector(
      RoomContext,
      (context) => ({
        room: context.room,
        user: context.user,
        logout: context.logout,
        tabId: context.tabId,
      }),
    );

  const queryClient = useQueryClient();
  
  const data = queryClient.getQueryData<{ data: { members: MemberProps[] } & RoomProps }>(['room', room?.id]);

  return <header>
      <Button onClick={() => logout()}>sair</Button>
      {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />}
    </header>;
}