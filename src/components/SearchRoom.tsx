'use client';
import { useEffect, useState } from 'react';
import { Select } from './Select';
import { Button } from './Button';
import { useContextSelector } from 'use-context-selector';
import { RoomContext } from '@/context/RoomContext';
import { getCoordinates } from '@/utils/getCoordinates';
import { RoomProps } from '@/protocols/Room';
import { List } from './List';
import { useRouter } from 'next/navigation';

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

  const [distance, setDistance] = useState(availableDistances[0].value);

  const { getRoomsByLocation } = useContextSelector(RoomContext, (context) => ({
    getRoomsByLocation: context.getRoomsByLocation,
  }));

  const handleSearchRooms = async () => {
    const permissionStatus = await navigator.permissions.query({
      name: 'geolocation',
    });

    if (permissionStatus.state === 'granted') {
      const { latitude, longitude } = await getCoordinates();

      const rooms = await getRoomsByLocation({
        distance: +distance,
        lat: latitude,
        lng: longitude,
      });

      setAvailableRooms(rooms.data as RoomProps[]);
      setHasSearched(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(() => {});
  };

  return (
    <>
      <div className="flex flex-col gap-8 w-full">
        <h1 className="font-sinera text-4xl text-center">Scrum poker</h1>
        <h3 className="text-lg text-center">Buscar salas próximas a você</h3>
        <Select
          label="Distância"
          options={availableDistances}
          value={distance}
          onChange={setDistance}
        />

        <div className="flex gap-4 w-full justify-center flex-col">
          <Button onClick={handleSearchRooms}>Buscar</Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>Voltar</Button>
        </div>

        {hasSearched && (
          <div className="flex flex-col gap-3">
            {availableRooms.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {availableRooms.length} sala{availableRooms.length > 1 ? 's' : ''} encontrada{availableRooms.length > 1 ? 's' : ''}
                  </h4>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      className="group relative p-3 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg text-sm hover:from-purple-50 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-700 cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-gray-500 hover:shadow-md"
                      onClick={() => router.push(`/room/${room.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                            {room.name}
                          </span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Nenhuma sala encontrada
                  </h4>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Não encontramos salas ativas na distância selecionada.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
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
