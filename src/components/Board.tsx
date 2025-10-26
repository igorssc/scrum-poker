import { useContextSelector } from "use-context-selector";
import { RoomContext } from "@/context/RoomContext";
import { useRoomActions } from "@/hooks/useRoomActions";
import { AcceptUsers } from "./AcceptUsers";
import { useQueryClient } from "@tanstack/react-query";
import { MemberProps } from "@/protocols/Member";
import { RoomProps } from "@/protocols/Room";
import { UsersList } from "./UsersList";
import { NavBar } from "./NavBar";
import { Box } from "./Box";
import { Cards } from "./Cards";
import { Flex } from "./Flex";
import { Button } from "./Button";

export const Board = () => {
  const { room, user } = useContextSelector(
      RoomContext,
      (context) => ({
        room: context.room,
        user: context.user,
      }),
    );

  const { revealCards, clearVotes, isRevealingCards, isClearingVotes } = useRoomActions();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<{ data: { members: MemberProps[] } & RoomProps }>(['room', room?.id]);

  const isOwner = room?.owner_id === user?.id;

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
        {isOwner && (
          <Flex className="w-full flex-row gap-2 md:gap-4">
            <Button 
              className="flex-1" 
              onClick={clearVotes}
              isLoading={isClearingVotes}
            >
              Limpar votos
            </Button>
            <Button 
              className="flex-1" 
              onClick={revealCards}
              isLoading={isRevealingCards}
            >
              Revelar cartas
            </Button>
          </Flex>
        )}
        <UsersList />
      </main>
    </div>
  );
}