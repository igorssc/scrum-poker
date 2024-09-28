import { Box } from './Box';
import { Flex } from './Flex';
import { Glass } from './Glass';
import { Loading } from './Loading';
import { SampleCards } from './SampleCards';

export const LoadingScreen = () => {
  return (
    <>
      <SampleCards>
        <Glass>
          <Box>
            <Flex>
              <Loading />
            </Flex>
          </Box>
        </Glass>
      </SampleCards>
    </>
  );
};
