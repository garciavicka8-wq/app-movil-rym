import {useEffect, useRef, useState} from 'react';
import {getServerTime} from '../services/http';

// RE-SINCRONIZA CADA 5 MINUTOS PARA CORREGIR DRIFT DEL RELOJ DEL DISPOSITIVO
const RESYNC_INTERVAL_MS = 5 * 60 * 1000;

export default function useServerClock() {
  const [now, setNow] = useState(Date.now());
  const offsetRef = useRef(0);

  useEffect(() => {
    let tickInterval;
    let resyncInterval;

    const sync = async () => {
      try {
        const serverTimestamp = await getServerTime();
        offsetRef.current = serverTimestamp - Date.now();
      } catch (error) {
        // SIN CONEXIÓN: SE MANTIENE EL OFFSET PREVIO (O 0 SI NUNCA SINCRONIZÓ)
      }
    };

    sync();
    tickInterval = setInterval(() => setNow(Date.now() + offsetRef.current), 1000);
    resyncInterval = setInterval(sync, RESYNC_INTERVAL_MS);

    return () => {
      clearInterval(tickInterval);
      clearInterval(resyncInterval);
    };
  }, []);

  return now;
}
