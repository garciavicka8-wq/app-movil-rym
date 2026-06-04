import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useThermalPrinter, useError} from '../../../../hooks';
import {Text} from 'react-native';
import {Money, Print, Timer, uuid} from '../../../../utils';
import {establecerCredito} from '../../../../features/credito/creditoSlice';
import {agregarRegistroAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import {
  agregarBoletoCancelado,
  setBoletosCancelados,
  setCargandoCancelados,
} from '../../../../features/tickets/cancelados/canceladosSlice';
import {cancelTicket, getCanceledTicketsApi} from '../services';

export default function useCancelarBoleto(modal) {
  const [cancelandoTicket, setCancelandoTicket] = useState(false);
  const printerHook = useThermalPrinter();
  const dispatch = useDispatch();
  const errorHook = useError();

  useEffect(() => {
    return () => {
      dispatch(setCargandoCancelados(false));
    };
  }, []);

  const handleCancelar = async (numeroBoleto, capturedImageUri) => {
    if (cancelandoTicket) return;
    setCancelandoTicket(true);
    modal.setConfig({
      open: true,
      type: 'progress',
      progressTitle: 'Cancelando boleto',
    });

    try {
      if (!(await printerHook.isPrintingPossible())) {
        setCancelandoTicket(false);
        return;
      }

      const {boleto_cancelado, saldo_nuevo} = await cancelTicket(
        numeroBoleto,
        capturedImageUri,
      );

      if (boleto_cancelado) {
        await printerHook.print(async function () {
          await Print.canceledTicket(boleto_cancelado);
        });

        modal.setConfig({
          type: 'alert',
          alertTitle: 'Boleto cancelado',
          contentType: 'mensaje',
          action: 'mensaje',
          content: <Text>{Money(boleto_cancelado.reembolso)}</Text>,
          showCancelBtn: false,
        });
        dispatch(establecerCredito(saldo_nuevo));
        dispatch(
          agregarRegistroAlMomento({
            id: uuid(),
            fecha: boleto_cancelado.fechaCancelacion,
            numeroBoleto: boleto_cancelado.numeroBoleto,
            hora: boleto_cancelado.horaCancelacion,
            total: -Math.abs(boleto_cancelado.reembolso),
            tipo: 'cancelado',
          }),
        );
        dispatch(agregarBoletoCancelado(boleto_cancelado));
      }
    } catch ({message}) {
      errorHook.handleErrorWithModal(message, modal);
    } finally {
      setCancelandoTicket(false);
    }
  };

  const obtenerBoletos = async () => {
    try {
      dispatch(setCargandoCancelados(true));
      const boletos = await getCanceledTicketsApi();
      dispatch(setBoletosCancelados(boletos));
      dispatch(setCargandoCancelados(false));
    } catch ({message}) {
      errorHook.handleError(message);
    }
  };

  return {handleCancelar, obtenerBoletos};
}
