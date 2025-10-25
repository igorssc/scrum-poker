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
    <div className="relative min-h-screen flex content-center items-center max-w-[90%]">
      <Box className='w-160 min-h-60! md:h-80'>
        <Flex className='pt-[30px] flex-col gap-4 sm:gap-5 md:gap-6'>
          <Loading />
          <div className="flex justify-center mt-2 sm:mt-3 md:mt-4">
            <Button 
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Cancelar
            </Button>
          </div>
        </Flex>
      </Box>
    </div>
  );
};
