'use client';

import { Box } from '@/components/Box';
import { EnterRoom } from '@/components/EnterRoom';
import { Flex } from '@/components/Flex';
import { Glass } from '@/components/Glass';
import { SampleCards } from '@/components/SampleCards';

type RoomAccessProps = {
  roomId: string;
  roomName?: string;
  access?: string;
};

export function RoomAccess({ roomId, roomName, access }: RoomAccessProps) {
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
