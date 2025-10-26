'use client';

import { Box } from '@/components/Box';
import { EnterRoom } from '@/components/EnterRoom';
import { Flex } from '@/components/Flex';

type RoomAccessProps = {
  roomId: string;
  roomName?: string;
  access?: string;
};

export function RoomAccess({ roomId, roomName, access }: RoomAccessProps) {
  return (
    <Box className='w-160'>
      <Flex>
        <EnterRoom
          roomId={roomId}
          roomName={roomName}
          access={access}
        />
      </Flex>
    </Box>
  );
}
