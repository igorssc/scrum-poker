import { useContextSelector } from "use-context-selector";
import { RoomContext } from "@/context/RoomContext";
import { AcceptUsers } from "./AcceptUsers";
import { useQueryClient } from "@tanstack/react-query";
import { MemberProps } from "@/protocols/Member";
import { RoomProps } from "@/protocols/Room";
import { UsersList } from "./UsersList";
import { NavBar } from "./NavBar";

export const Board = () => {
  const { room, user } = useContextSelector(
      RoomContext,
      (context) => ({
        room: context.room,
        user: context.user,
      }),
    );

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<{ data: { members: MemberProps[] } & RoomProps }>(['room', room?.id]);

  return (
    <div className="w-[1200px] max-w-[95%] p-4 sm:p-10 bg-gray-400/70">
      <NavBar />

      <main>
        {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />}
        <UsersList/>
      </main>
    </div>
  );
}