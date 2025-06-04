import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useError, useThermalPrinter} from '../../../../../../hooks';
import {setRegistrosAlMomento} from '../../../../../../features/tickets/cliente/clienteSlice';
import {Print} from '../../../../../../utils';
import {getTimestamp} from '../../../../../../database/facade';

export default function useCollapsedTotal(modal) {
  const [showList, setShowList] = useState(true);
  const dispatch = useDispatch();
  const {registrosAlMomento} = useSelector(state => state.cliente);
  const thermalPrinter = useThermalPrinter();
  const total = registrosAlMomento.reduce(
    (acc, b) => acc + parseInt(b.total),
    0,
  );
  const errorHook = useError();

  const toggleList = () => {
    setShowList(state => !state);
  };

  const handleClear = () => {
    dispatch(setRegistrosAlMomento([]));
  };

  const handlePrint = async () => {
    try {
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Imprimiendo',
      });
      const isPrintingPossible = await thermalPrinter.isPrintingPossible();
      if (isPrintingPossible) {
        printTotal();
      }
    } catch ({message}) {
      errorHook.handleErrorWithModal(message, modal);
    }
  };

  const printTotal = async () => {
    try {
      const timestamp = await getTimestamp();
      // IMPRIMIR
      await thermalPrinter.print(async function () {
        await Print.totalAccumulated(timestamp, total, registrosAlMomento);
      });
      modal.setConfig({open: false});
    } catch ({message}) {
      errorHook.handleErrorWithModal(message, modal);
    }
  };

  return {showList, toggleList, handleClear, handlePrint, total};
}
