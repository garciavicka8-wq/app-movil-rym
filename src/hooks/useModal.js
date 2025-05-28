import {useState} from 'react';

export default function useModal() {
  const [modalConfig, setModalConfig] = useState({
    open: false,
    type: 'progress', // alert || progress
    alertTitle: '',
    progressTitle: '',
    showConfirmBtn: true,
    showCancelBtn: true,
    confirmBtnText: 'Entendido',
    cancelBtnText: 'Cancelar',
    disableConfirmBtn: false,
    confirmBtnClicked: false,
    contentType: '',
    action: '',
  });

  const [config, _setConfig] = useState({
    open: false,
    type: 'progress', // alert || progress
    alertTitle: '',
    progressTitle: '',
    showConfirmBtn: true,
    showCancelBtn: true,
    confirmBtnText: 'Entendido',
    cancelBtnText: 'Cancelar',
    disableConfirmBtn: false,
    confirmBtnClicked: false,
    contentType: '',
    action: '',
  });

  const setConfig = newConfig => {
    _setConfig(prevState => ({
      ...prevState,
      ...newConfig,
    }));
  };

  return {
    modalConfig,
    setModalConfig,
    config,
    setConfig,
  };
}
