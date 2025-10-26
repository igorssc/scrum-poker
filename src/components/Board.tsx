import { useContextSelector } from "use-context-selector";
import { RoomContext } from "@/context/RoomContext";
import { AcceptUsers } from "./AcceptUsers";
import { useQueryClient } from "@tanstack/react-query";
import { MemberProps } from "@/protocols/Member";
import { RoomProps } from "@/protocols/Room";
import { UsersList } from "./UsersList";
import { NavBar } from "./NavBar";
import { Box } from "./Box";
import { Cards } from "./Cards";
import { Flex } from "./Flex";

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
    <div className="w-[1200px] p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-400/70 flex flex-col gap-3 sm:gap-4 md:gap-6">
      <NavBar />

      <main className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        {(!data?.data.private || room?.owner_id === user?.id) && <AcceptUsers />}
        <Box className="max-w-full min-h-0">
          <Flex>
            <Cards />
          </Flex>
        </Box>
        <UsersList />
      </main>
    </div>
  );
}