import React, {useState} from 'react';
import {Alert} from 'react-native';
import {useSelector} from 'react-redux';
import ReporteButton from '../../Ventas/components/ReporteButton';
import UploadImageModal from '../../../../components/UploadImageModal';
import {saveDepositReceipt} from '../../../../services/reports';

export default function ReportarDepositoButton({onSaved}) {
  const [showModal, setShowModal] = useState(false);
  const {cargandoPeriodos} = useSelector(state => state.reportes);

  const handleCaptureUploaded = async imageUrl => {
    try {
      const savedCapture = await saveDepositReceipt(imageUrl);
      setShowModal(false);
      Alert.alert('¡Éxito!', 'Tu comprobante ha sido subido correctamente.');
      if (onSaved) {
        onSaved(savedCapture);
      }
    } catch ({message}) {
      Alert.alert('Error', message);
      setShowModal(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  if (cargandoPeriodos) return null;

  return (
    <>
      <ReporteButton
        label="Reportar Depósito"
        icon="camera-plus"
        onPress={() => setShowModal(true)}
        btnColor="#0E1321"
        textColor="#FFFFFF"
        iconColor="#FFFFFF"
      />
      {/* UPLOAD MODAL */}
      {showModal && (
        <UploadImageModal
          type={'deposit-receipt'}
          onUploaded={handleCaptureUploaded}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
