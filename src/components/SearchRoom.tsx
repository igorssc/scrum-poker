'use client';
import { RoomContext } from '@/context/RoomContext';
import { RoomProps } from '@/protocols/Room';
import { handleApiError } from '@/utils/errorHandler';
import { getCoordinates } from '@/utils/getCoordinates';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useContextSelector } from 'use-context-selector';
import { Button } from './Button';
import { Select } from './Select';

export const SearchRoom = () => {
  const availableDistances = [
    { value: '100', label: '100 metros' },
    { value: '500', label: '500 metros' },
    { value: '1000', label: '1 quilômetro' },
    { value: '2000', label: '2 quilômetros' },
    { value: '5000', label: '5 quilômetros' },
    { value: '10000', label: '10 quilômetros' },
    { value: '50000', label: '50 quilômetros' },
  ];

  const router = useRouter();

  const [availableRooms, setAvailableRooms] = useState([] as RoomProps[]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [distance, setDistance] = useState(availableDistances[0].value);

  // Função para calcular distância entre duas coordenadas (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Função para formatar distância
  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  // Função para calcular tempo ativo da sala
  const getActiveTime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min`;
    } else {
      return 'agora';
    }
  };

  const { getRoomsByLocation } = useContextSelector(RoomContext, context => ({
    getRoomsByLocation: context.getRoomsByLocation,
  }));

  const handleSearchRooms = async () => {
    setIsSearching(true);

    try {
      // Tentativa direta de obter localização (funciona melhor no Firefox)
      const { latitude, longitude } = await getCoordinates();

      // Armazenar coordenadas do usuário para cálculo de distância
      setUserCoordinates({ lat: latitude, lng: longitude });

      const rooms = await getRoomsByLocation({
        distance: +distance,
        lat: latitude,
        lng: longitude,
      });

      setAvailableRooms(rooms.data as RoomProps[]);
      setHasSearched(true);
    } catch (error: any) {
      // Se o erro é relacionado à permissão de geolocalização
      if (
        error?.code === 1 ||
        error?.message?.includes('permission') ||
        error?.message?.includes('denied')
      ) {
        toast.error('Permissão de localização negada. Não foi possível buscar salas próximas.');
      } else {
        handleApiError(error, 'Erro ao buscar salas próximas');
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 sm:gap-6 md:gap-8 w-full py-4">
        <h1 className="font-sinera text-2xl sm:text-3xl md:text-4xl text-center">Scrum poker</h1>
        <h3 className="text-[0.65rem] sm:text-xs md:text-md text-center">
          Buscar salas próximas a você
        </h3>
        <Select
          label="Distância"
          options={availableDistances}
          value={distance}
          onChange={setDistance}
        />

        <div className="flex gap-3 sm:gap-4 w-full justify-center flex-col">
          <Button onClick={handleSearchRooms} isLoading={isSearching}>
            Buscar
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            disabled={isSearching}
          >
            Voltar
          </Button>
        </div>

        {hasSearched && (
          <div className="flex flex-col gap-2 sm:gap-3">
            {availableRooms.length > 0 ? (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h4 className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {availableRooms.length} sala{availableRooms.length > 1 ? 's' : ''} encontrada
                    {availableRooms.length > 1 ? 's' : ''}
                  </h4>
                </div>
                <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                  {availableRooms.map(room => {
                    const distanceKm = userCoordinates
                      ? calculateDistance(
                          userCoordinates.lat,
                          userCoordinates.lng,
                          room.lat,
                          room.lng
                        )
                      : 0;
                    const formattedDistance = formatDistance(distanceKm);
                    const activeTime = getActiveTime(room.created_at);

                    return (
                      <div
                        key={room.id}
                        className="group relative p-2 sm:p-2.5 md:p-3 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg text-[0.65rem] sm:text-xs hover:from-purple-50 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-700 cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-gray-500 hover:shadow-md"
                        onClick={() => router.push(`/room/${room.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                            <div className="w-0.5 sm:w-1 h-4 sm:h-5 md:h-6 bg-purple-500 rounded-full shrink-0"></div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 truncate">
                                {room.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[0.6rem] sm:text-[0.65rem] text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  <span>{formattedDistance}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span>ativa há {activeTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-2">
                            <svg
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-5 sm:gap-6 md:gap-8">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></div>
                  <h4 className="text-[0.65rem] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nenhuma sala encontrada
                  </h4>
                </div>
                <div className="text-center p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 w-full">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-500 mx-auto mb-1.5 sm:mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-[0.65rem] sm:text-xs text-amber-700 dark:text-amber-300">
                    Não encontramos salas ativas na distância selecionada.
                  </p>
                  <p className="text-[0.65rem] sm:text-xs text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">
                    Tente aumentar a distância ou criar uma nova sala.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
