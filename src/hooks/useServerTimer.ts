import { useState, useEffect, useRef } from 'react';
import { handleApiError } from '@/utils/errorHandler';
import { useRoomCache } from './useRoomCache';
import { useRoomActions } from './useRoomActions';

export const useServerTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStartTime = useRef<Date | null>(null);
  
  const { cachedRoomData } = useRoomCache();
  const { updateRoom } = useRoomActions();

  // Calcular tempo atual baseado no start_timer do servidor
  useEffect(() => {
    const startTimer = cachedRoomData?.data?.start_timer;
    const stopTimer = cachedRoomData?.data?.stop_timer;

    if (!startTimer) {
      // Timer não foi iniciado ou foi resetado
      setSeconds(0);
      setIsRunning(false);
      setAccumulatedTime(0);
      lastStartTime.current = null;
    } else if (startTimer && !stopTimer) {
      // Timer está rodando
      const startDate = new Date(startTimer);
      lastStartTime.current = startDate;
      
      // Calcular tempo acumulado se havia uma parada anterior
      // Neste caso simples, assumimos que start_timer é sempre do início da sessão atual
      setAccumulatedTime(0);
      setIsRunning(true);
    } else if (startTimer && stopTimer) {
      // Timer foi pausado
      const startDate = new Date(startTimer);
      const stopDate = new Date(stopTimer);
      const sessionTime = Math.floor((stopDate.getTime() - startDate.getTime()) / 1000);
      
      setSeconds(Math.max(0, sessionTime));
      setAccumulatedTime(sessionTime);
      setIsRunning(false);
      lastStartTime.current = null;
    }
  }, [cachedRoomData?.data?.start_timer, cachedRoomData?.data?.stop_timer]);

  // Atualizar timer localmente quando está rodando
  useEffect(() => {
    if (isRunning && lastStartTime.current) {
      // Calcular tempo inicial baseado no servidor
      const startDate = lastStartTime.current;
      const currentDate = new Date();
      const initialElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / 1000);
      setSeconds(accumulatedTime + initialElapsed);
      
      // Iniciar intervalo para atualizar a cada segundo
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startDate.getTime()) / 1000);
        setSeconds(accumulatedTime + elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, accumulatedTime]);

  // Função para iniciar/pausar timer no servidor
  const toggle = async () => {
    try {
      const startTimer = cachedRoomData?.data?.start_timer;
      const stopTimer = cachedRoomData?.data?.stop_timer;

      if (!startTimer || stopTimer) {
        // Iniciar timer - usar timestamp atual
        await updateRoom({
          start_timer: new Date().toISOString(),
          stop_timer: null,
        });
      } else {
        // Pausar timer - definir stop_timer
        await updateRoom({
          stop_timer: new Date().toISOString(),
        });
      }
    } catch (error) {
      handleApiError(error, 'Erro ao atualizar timer');
    }
  };

  // Função para resetar timer no servidor
  const reset = async () => {
    try {
      await updateRoom({
        start_timer: null,
        stop_timer: null,
      });
    } catch (error) {
      handleApiError(error, 'Erro ao resetar timer');
    }
  };

  // Formatação do tempo em MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(seconds);

  return {
    seconds,
    isRunning,
    formattedTime,
    toggle,
    reset,
  };
};