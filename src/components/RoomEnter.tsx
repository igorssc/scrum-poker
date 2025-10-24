'use client';

import { Box } from '@/components/Box';
import { EnterRoom } from '@/components/EnterRoom';
import { Flex } from '@/components/Flex';
import { Glass } from '@/components/Glass';
import { SampleCards } from '@/components/SampleCards';

type RoomEnterProps = {
  roomId: string;
  roomName?: string;
  access?: string;
};

export function RoomEnter({ roomId, roomName, access }: RoomEnterProps) {
  return (
    <SampleCards>
      <Glass>
        <Box>
          <Flex>
            <EnterRoom
              roomId={roomId}
              roomName={roomName}
              access={access}
            />
          </Flex>
        </Box>
      </Glass>
    </SampleCards>
  );
}
