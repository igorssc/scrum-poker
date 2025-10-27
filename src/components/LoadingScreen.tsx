import { Box } from './Box';
import { Button } from './Button';
import { Flex } from './Flex';
import { Glass } from './Glass';
import { Loading } from './Loading';
import { SampleCards } from './SampleCards';

export const LoadingScreen = () => {
  const handleCancel = () => {
    localStorage.removeItem('room');
    localStorage.removeItem('user');
    // Você pode adicionar redirecionamento ou refresh aqui se necessário
    window.location.reload();
  };

  return (
    <div className="relative min-h-[calc(100dvh-2rem)] flex content-center items-center max-w-[90%]">
      <Box className="w-160 min-h-60! md:h-80">
        <Flex className="pt-20 md:pt-[110px] flex-col gap-14 md:gap-20">
          <Loading />
          <div className="flex justify-center mt-2 sm:mt-3 md:mt-4 w-full">
            <Button onClick={handleCancel} className="w-full" variant="secondary">
              Cancelar
            </Button>
          </div>
        </Flex>
      </Box>
    </div>
  );
};
