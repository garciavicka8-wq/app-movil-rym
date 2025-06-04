import {useEffect} from 'react';
import {useError, useModal, useThermalPrinter} from '../../../../../../hooks';
import {CustomModal} from '../../../../../../components';
import {Text} from 'react-native';
import {Print} from '../../../../../../utils';

export default function ModalReimpresion({onClose, registro}) {
  const modalHook = useModal();
  const {config, setConfig} = modalHook;
  const errorHook = useError();
  const printerHook = useThermalPrinter();

  useEffect(() => {
    setConfig({
      open: true,
      type: 'alert',
      alertTitle: 'Reimpresión',
      confirmBtnText: 'Sí, continuar',
      showCancelButton: true,
      contentType: 'mensaje',
      content: (
        <Text>
          Al reimprimir un ticket éste se invalida automaticamente pero es
          necesario que usted lo cancele de la manera habitual para que se vea
          reflejado en el sistema, ¿Desea continuar?
        </Text>
      ),
    });
  }, []);

  const handleModalCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (config.action === 'error') {
      handleModalCancel();
      return;
    }
    reimprimirTicket();
  };

  const reimprimirTicket = async () => {
    setConfig({
      type: 'progress',
      alertTitle: 'Reimprimiendo ticket',
    });
    try {
      const isPrintingPosible = await printerHook.isPrintingPossible();
      if (isPrintingPosible) {
        // await reprintTicket(registro.numeroBoleto);
        printerHook.print(function () {
          Print.reprintTicket(registro.numeroBoleto);
        });
      }
    } catch ({message}) {
      errorHook.handleErrorWithModal(message, modalHook);
    }
  };

  return (
    <CustomModal
      open={config.open}
      type={config.type}
      progressTitle={config.progressTitle}
      alertTitle={config.alertTitle}
      showCancelButton={config.showCancelBtn}
      cancelButtonText={config.cancelBtnText}
      confirmButtonText={config.confirmBtnText}
      showConfirmBtn={config.showConfirmBtn}
      onCancel={handleModalCancel}
      onAccept={handleModalAccept}>
      {config.contentType === 'mensaje' && config.content}
      {config.contentType === 'error' && config.error}
    </CustomModal>
  );
}
