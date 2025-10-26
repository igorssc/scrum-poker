import Image from 'next/image';
import { iconsData } from '../utils/icons';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useRoomCache } from '@/hooks/useRoomCache';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import path from 'path';
import { Children } from 'react';

export const Cards = () => {
  const { vote, isVoting } = useRoomActions();
  const { cachedRoomData } = useRoomCache();
  const { user } = useContextSelector(RoomContext, (context) => ({
    user: context.user,
  }));

  // Encontrar o voto do usuário atual
  const userVote = cachedRoomData?.data?.members?.find(member => member.member.id === user?.id);
  const selectedCard = userVote?.vote;

  const handleCardClick = async (icon: string) => {
    if (isVoting) return;
    
    try {
      await vote(icon);
    } catch (error) {
      console.error('Erro ao votar na carta:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4 md:gap-x-4 md:gap-y-5 justify-items-center w-full">
        {Children.toArray(
          iconsData['nature'].icons.map((icon) => {
            const isSelected = selectedCard === icon;
            
            return (
              <button
                key={icon}
                onClick={() => handleCardClick(icon)}
                disabled={isVoting}
                className={`
                  transition-all duration-200 rounded-lg p-1
                  ${isSelected 
                    ? 'ring-4 ring-purple-500 bg-purple-100 dark:bg-purple-900/30 scale-105' 
                    : 'hover:scale-105 hover:shadow-lg'
                  }
                  ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Image
                  alt={`Card ${icon}`}
                  src={path.join('assets', 'cards', icon)}
                  width={167}
                  height={249}
                  className="w-12 h-18 sm:w-14 sm:h-20 md:w-16 md:h-24 lg:w-20 lg:h-30 xl:w-24 xl:h-36"
                />
              </button>
            );
          }),
        )}
      </div>
    </>
  );
};
