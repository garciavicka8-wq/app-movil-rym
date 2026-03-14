import {useDispatch} from 'react-redux';
import {
  setCargandoPublicacion,
  setPublicacion,
} from '../features/tickets/ganadores/ganadoresSlice';
import {obtenerPublicacionNumerosGanadoresApi} from '../services/tickets';

export default function useGanadores() {
  const dispatch = useDispatch();

  const obtenerPublicacion = async fechaSorteo => {
    dispatch(setCargandoPublicacion(true));
    const _publicacion = await obtenerPublicacionNumerosGanadoresApi(fechaSorteo);
    dispatch(setPublicacion(_publicacion));
    dispatch(setCargandoPublicacion(false));
  };

  return {
    obtenerPublicacion,
  };
}
