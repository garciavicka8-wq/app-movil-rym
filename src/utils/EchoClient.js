import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Storage from './Storage';
import { RYM_API_URL } from '../constants';

// Evita que pusher intente usar dependencias de navegador
window.Pusher = Pusher;

export const initEcho = () => {
  const user = Storage.getUser();
  if (!user || !user.token) return null;
  // Pusher.logToConsole = true; // Comentar o poner en false para no ver todos los ping/pong en consola
  Pusher.logToConsole = false;

  // Variables de pusher: Las mismas del .env o provistas por Pusher
  const echoInstance = new Echo({
    broadcaster: 'pusher',
    key: '06944b34c3d89d7414ed',
    cluster: 'us2',
    forceTLS: true,
    // La ruta broadcasting/auth en Laravel 11 se registra en la raíz, NO dentro de /api/
    // RYM_API_URL es 'http://192.168.3.10:8000/api/v1', así que tomamos solo el host
    authEndpoint: RYM_API_URL.replace('/api/v1', '/broadcasting/auth'),
    auth: {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    },
  });

  // Listeners para depuración
  echoInstance.connector.pusher.connection.bind('state_change', function(states) {
      console.log("Pusher State Change:", states.current);
  });
  
  return echoInstance;
};

export const disconnectEcho = (echoInstance) => {
  if (echoInstance) {
    echoInstance.disconnect();
  }
};
