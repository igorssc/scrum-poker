type Coordinates = {
  latitude: number;
  longitude: number;
};

export const getCoordinates = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'));
    } else {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 segundos
        maximumAge: 60000, // Cache por 1 minuto
      };

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        error => {
          // Códigos de erro da Geolocation API
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Permissão de localização negada pelo usuário'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Localização indisponível'));
              break;
            case error.TIMEOUT:
              reject(new Error('Tempo limite para obter localização excedido'));
              break;
            default:
              reject(new Error('Erro desconhecido ao obter localização'));
              break;
          }
        },
        options
      );
    }
  });
};
