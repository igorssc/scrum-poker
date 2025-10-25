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
  ];

  const router = useRouter();

  const [availableRooms, setAvailableRooms] = useState([] as RoomProps[]);

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
      return;
    }

    navigator.geolocation.getCurrentPosition(() => {});
  };

  return (
    <>
      <div className="flex flex-col gap-8">
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

        {availableRooms?.map((room) => (
          <List key={room.id} label={room.name} />
        ))}
      </div>
    </>
  );
};
