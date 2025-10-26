import Image from 'next/image';
import { iconsData } from '../utils/icons';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useRoomCache } from '@/hooks/useRoomCache';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import path from 'path';
import { Children, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { twMerge } from 'tailwind-merge';

export const Cards = () => {
  const { vote, isVoting } = useRoomActions();
  const { cachedRoomData } = useRoomCache();
  const { user } = useContextSelector(RoomContext, (context) => ({
    user: context.user,
  }));
  
  const [previousCardsOpen, setPreviousCardsOpen] = useState<boolean | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Encontrar o voto do usuário atual
  const userVote = cachedRoomData?.data?.members?.find(member => member.member.id === user?.id);
  const selectedCard = userVote?.vote;
  const cardsOpen = cachedRoomData?.data?.cards_open;

  // Calcular carta com maior votação
  const getWinningCard = () => {
    if (!cachedRoomData?.data?.members || !cardsOpen) return null;
    
    const voteCounts: Record<string, number> = {};
    cachedRoomData.data.members
      .filter(member => member.status === 'LOGGED' && member.vote)
      .forEach(member => {
        voteCounts[member.vote] = (voteCounts[member.vote] || 0) + 1;
      });

    if (Object.keys(voteCounts).length === 0) return null;

    const maxVotes = Math.max(...Object.values(voteCounts));
    const winners = Object.keys(voteCounts).filter(vote => voteCounts[vote] === maxVotes);
    
    // Se há empate, não mostrar coroa
    return winners.length === 1 ? winners[0] : null;
  };

  const winningCard = getWinningCard();

    // Detectar mudança no cardsOpen para ativar confetes
  useEffect(() => {
    if (previousCardsOpen === false && cardsOpen === true && winningCard) {
      // Cartas foram reveladas - criar confetes
      createConfetti();
    }
    
    setPreviousCardsOpen(cardsOpen);
  }, [cardsOpen, previousCardsOpen, winningCard]);

  const createConfetti = () => {
    if (!containerRef.current) return;

    // Obter posição do centro da div pai (container das cartas)
    const rect = containerRef.current.getBoundingClientRect();
    const containerCenterX = (rect.left + rect.width / 2) / window.innerWidth;
    const containerCenterY = (rect.top + rect.height / 2) / window.innerHeight;

    // Configuração do confete
    const confettiConfig = {
      particleCount: 150,
      spread: 70,
      origin: { x: containerCenterX, y: containerCenterY },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98'],
      scalar: 1.2,
      gravity: 1,
      drift: 0,
      ticks: 300
    };

    // Explosão principal
    confetti(confettiConfig);
    
    // Explosões adicionais para efeito mais dramático
    setTimeout(() => confetti({
      ...confettiConfig,
      particleCount: 100,
      spread: 50,
      scalar: 0.8
    }), 200);
    
    setTimeout(() => confetti({
      ...confettiConfig,
      particleCount: 75,
      spread: 30,
      scalar: 0.6
    }), 400);
  };

  const handleCardClick = async (icon: string) => {
    if (isVoting) return;
    
    try {
      await vote(icon);
    } catch (error) {
      console.error('Erro ao votar na carta:', error);
    }
  };

  return (
    <div ref={containerRef} className="relative grid grid-cols-5 gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4 md:gap-x-4 md:gap-y-5 justify-items-center w-full h-fit">
      
      {Children.toArray(
        iconsData['nature'].icons.map((icon) => {
          const isSelected = selectedCard === icon;
          const isWinning = winningCard === icon;
          
          return (
              <button
              key={icon}
              onClick={() => handleCardClick(icon)}
              disabled={isVoting}
              className={twMerge(
                "relative transition-all duration-200 rounded-lg cursor-pointer h-fit p-1",
                isSelected && "ring-2 ring-purple-500 dark:ring-purple-700 bg-purple-100 dark:bg-purple-900/30 scale-105",
                !isSelected && "hover:scale-105 hover:shadow-xs",
                isVoting && "opacity-50 cursor-not-allowed"
              )}
              >
              <Image
                alt={`Card ${icon}`}
                src={path.join('assets', 'cards', icon)}
                width={167}
                height={249}
                className="w-12 h-18 sm:w-14 sm:h-20 md:w-16 md:h-24 lg:w-20 lg:h-30 xl:w-24 xl:h-36"
              />
              
              {/* Coroa para carta vencedora */}
              {isWinning && cardsOpen && (
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-4 md:-right-4 transform rotate-12 animate-bounce">
                  <div className="text-2xl sm:text-3xl md:text-4xl drop-shadow-lg">👑</div>
                </div>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
};
