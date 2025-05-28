import {useState} from 'react';
import {Alert} from 'react-native';
import {useDispatch} from 'react-redux';
import {
  setCargandoProximosSorteos,
  setProximosSorteos,
  setSorteoSeleccionado,
} from '../features/tickets/jugarTickets/jugarTicketsSlice';
import {obtenerProximosSorteos} from '../services/tickets';

export default function useSorteos() {
  const [cargando, setCargando] = useState(true);
  const dispatch = useDispatch();

  const cargarProximosSorteos = async () => {
    try {
      setCargando(true);
      dispatch(setCargandoProximosSorteos(true));
      const sorteos = await obtenerProximosSorteos();
      dispatch(setProximosSorteos(sorteos));
      if (sorteos.length > 0) {
        dispatch(setSorteoSeleccionado(sorteos[0]));
      }
      dispatch(setCargandoProximosSorteos(false));
      setCargando(false);
    } catch ({message}) {
      Alert.alert('Mensaje', message);
    }
  };
  return {
    cargando,
    cargarProximosSorteos,
  };
}
