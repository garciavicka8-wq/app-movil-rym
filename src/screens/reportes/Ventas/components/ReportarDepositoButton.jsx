import {Grid, Row} from 'react-native-easy-grid';
import ReporteButton from './ReporteButton';
import UploadImageModal from '../../../../components/UploadImageModal';
import {useState} from 'react';
import {Alert} from 'react-native';
import {saveDepositReceipt} from '../../../../services/reports';
import {useSelector} from 'react-redux';

export default function ReportarDepositoButton() {
  const [showModal, setShowModal] = useState(false);
  const {cargandoPeriodos} = useSelector(state => state.reportes);

  const handleCaptureUploaded = async imageUrl => {
    try {
      // console.log(imageUrl);
      await saveDepositReceipt(imageUrl);
      setShowModal(false);
      Alert.alert('Mensaje', 'Comprobante subido correctamente');
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
    <Grid>
      <Row>
        <ReporteButton
          label="Reportar deposito"
          icon="upload"
          onPress={() => setShowModal(true)}
          btnColor="purple"
          textColor={'white'}
          iconColor="white"
        />
      </Row>
      {/* UPLOAD MODAL */}
      {showModal && (
        <UploadImageModal
          type={'deposit-receipt'}
          onUploaded={handleCaptureUploaded}
          onClose={handleModalClose}
        />
      )}
    </Grid>
  );
}
