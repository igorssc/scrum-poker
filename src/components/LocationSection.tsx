'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';

type LocationSectionProps = {
  room: any;
  user: any;
  // Coordenadas controladas pelo componente pai
  lat?: number;
  lng?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  // Modo do componente
  mode?: 'view' | 'edit'; // 'view' = atualiza automaticamente via API, 'edit' = controlado pelo pai
};

export const LocationSection = ({ 
  room, 
  user, 
  lat: controlledLat, 
  lng: controlledLng, 
  onLocationChange,
  mode = 'view' 
}: LocationSectionProps) => {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const queryClient = useQueryClient();

  const isPrivate = !!room?.private;
  const canEditRoom = !isPrivate || room?.owner_id === user?.id;

  // Usa coordenadas controladas se fornecidas, senão usa do room
  const currentLat = controlledLat ?? room?.lat;
  const currentLng = controlledLng ?? room?.lng;

  // Converte coordenadas para endereço quando há localização
  useEffect(() => {
    if (currentLat && currentLng) {
      fetchAddress(currentLat, currentLng);
    } else {
      setAddress(null);
    }
  }, [currentLat, currentLng]);

  // Converte coordenadas para endereço usando múltiplas APIs gratuitas com fallback
  const fetchAddress = async (lat: number, lng: number) => {
    setAddressLoading(true);

    // Lista de APIs para geocoding reverso - apenas as que funcionam
    const geocodingAPIs = [
      // 1. Google Geocoding API via nossa API route (mais precisa e segura)
      {
        name: 'Google',
        url: `/api/geocoding?lat=${lat}&lng=${lng}`,
        headers: {} as Record<string, string>,
        extractAddress: (data: any) => {
          if (!data.results || data.results.length === 0) return null;
          
          const result = data.results[0];
          const components = result.address_components;
          
          const parts = [];
          let streetNumber = '';
          let route = '';
          let neighborhood = '';
          let city = '';
          let state = '';
          
          // Extrai componentes específicos
          components.forEach((component: any) => {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
              neighborhood = component.long_name;
            } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
          });
          
          // Monta endereço priorizando rua e número
          if (route && streetNumber) {
            parts.push(`${route}, ${streetNumber}`);
          } else if (route) {
            parts.push(route);
          }
          
          if (neighborhood) parts.push(neighborhood);
          if (city) parts.push(city);
          if (state) parts.push(state);
          
          return parts.length > 0 ? parts.join(', ') : result.formatted_address;
        },
      },
      // 2. BigDataCloud - Fallback confiável
      {
        name: 'BigDataCloud',
        url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`,
        headers: {} as Record<string, string>,
        extractAddress: (data: any) => {
          const parts = [];
          // Só usa dados úteis, evita regiões administrativas confusas
          if (data.locality) parts.push(data.locality);
          if (data.principalSubdivision) parts.push(data.principalSubdivision);
          return parts.length > 0 ? parts.join(', ') : 'Localização encontrada';
        },
      },
    ];

    for (const api of geocodingAPIs) {
      try {
        const response = await fetch(api.url, { headers: api.headers });
        const data = await response.json();

        const address = api.extractAddress(data);
        if (address) {
          setAddress(address);
          setAddressLoading(false);
          return;
        }
      } catch (error) {
        console.warn(`Erro na API ${api.name}:`, error);
        continue;
      }
    }

    // Se todas as APIs falharam
    setAddress('Endereço não encontrado');
    setAddressLoading(false);
  };

  // PATCH sala
  const patchRoomMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms/${room?.id}?user_id=${user?.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Erro ao salvar sala');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
    },
  });

  // Atualiza localização
  const handleUpdateLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { coords } = await new Promise<{ coords: { latitude: number; longitude: number } }>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );
      const { latitude, longitude } = coords;

      if (mode === 'edit' && onLocationChange) {
        // Modo edit: apenas notifica o componente pai das novas coordenadas
        onLocationChange(latitude, longitude);
      } else {
        // Modo view: atualiza diretamente via API (comportamento original)
        await patchRoomMutation.mutateAsync({
          lat: latitude,
          lng: longitude,
        });

        // Busca o endereço das novas coordenadas
        await fetchAddress(latitude, longitude);

        queryClient.invalidateQueries({ queryKey: ['room', room?.id] });
      }
    } catch (err: any) {
      setLocationError(err.message || 'Erro ao atualizar localização');
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3">
      <label className="text-[0.65rem] sm:text-xs text-gray-700 dark:text-gray-300 font-medium">
        Localização da sala:
      </label>

      {/* Caixa elegante para localização */}
      <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-2.5 md:space-y-3">
        {currentLat && currentLng ? (
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
            {/* Coordenadas */}
            <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
              <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[0.65rem] sm:text-xs font-mono text-gray-700 dark:text-gray-300">
                  {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Coordenadas GPS</div>
              </div>
            </div>

            {/* Endereço */}
            {addressLoading ? (
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 p-2 sm:p-2.5 md:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 animate-spin text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                <span className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                  Buscando endereço...
                </span>
              </div>
            ) : address ? (
              <div className="p-2 sm:p-2.5 md:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="text-[0.65rem] sm:text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {address}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                  Endereço aproximado
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 py-1.5 sm:py-2">
            <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 17.642 4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                Nenhuma localização definida
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Clique para definir a localização atual
              </div>
            </div>
          </div>
        )}

        {/* Botão de atualizar */}
        <div className="pt-1.5 sm:pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleUpdateLocation}
            disabled={locationLoading || !canEditRoom}
            className={twMerge(
              'w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs rounded-lg transition-all duration-200',
              locationLoading || !canEditRoom
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer'
            )}
          >
            {locationLoading ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 animate-spin"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Atualizando localização...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                {currentLat && currentLng ? 'Atualizar localização' : 'Definir localização atual'}
              </>
            )}
          </button>
        </div>

        {/* Erro */}
        {locationError && (
          <div className="p-2 sm:p-2.5 md:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span className="text-xs text-red-600 dark:text-red-400">{locationError}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
