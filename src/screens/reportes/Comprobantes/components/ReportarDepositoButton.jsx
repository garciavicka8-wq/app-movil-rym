import {} from 'react-native-easy-grid';
import ReporteButton from '../../Ventas/components/ReporteButton';
import UploadImageModal from '../../../../components/UploadImageModal';
import {useState} from 'react';
import {Alert} from 'react-native';
import {saveDepositReceipt} from '../../../../services/reports';
import {useSelector} from 'react-redux';

export default function ReportarDepositoButton({onSaved}) {
  const [showModal, setShowModal] = useState(false);
  const {cargandoPeriodos} = useSelector(state => state.reportes);

  const handleCaptureUploaded = async imageUrl => {
    try {
      // console.log(imageUrl);
      const savedCapture = await saveDepositReceipt(imageUrl);
      setShowModal(false);
      Alert.alert('Mensaje', 'Comprobante subido correctamente');
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
        label="Reportar deposito"
        icon="upload"
        onPress={() => setShowModal(true)}
        btnColor="purple"
        textColor={'white'}
        iconColor="white"
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
