import React from 'react';
import {Text} from 'react-native';
import {CustomModal} from '../../../../components';
import MenuOpcion from './MenuOpcion';
import {useLogout, useModal} from '../../../../hooks';
import {setRegistrosAlMomento} from '../../../../features/tickets/cliente/clienteSlice';
import {useDispatch} from 'react-redux';

export default function LogoutButton() {
  const modal = useModal();
  const dispatch = useDispatch();
  const {logout} = useLogout();

  const handleCerrarSesion = () => {
    modal.setConfig({
      open: true,
      type: 'alert',
      alertTitle: 'Cerrar sesión',
      contentType: 'mensaje',
      action: 'logout',
      content: <Text>Seguro que quieres salir de la aplicación?</Text>,
      confirmBtnText: 'Sí, salir',
    });
  };

  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'logout') {
      cerrarSesion();
    }
  };

  const cerrarSesion = () => {
    modal.setConfig({type: 'progress', progressTitle: 'Cerrando sesión'});
    dispatch(setRegistrosAlMomento([]));
    modal.setConfig({open: false});
    logout();
  };

  return (
    <>
      <MenuOpcion
        label="Cerrar Sesión"
        leftIcon="logout"
        rightIcon="chevron-right"
        onPress={() => handleCerrarSesion()}
      />
      <CustomModal
        open={modal.config.open}
        type={modal.config.type}
        progressTitle={modal.config.progressTitle}
        alertTitle={modal.config.alertTitle}
        showCancelButton={modal.config.showCancelBtn}
        cancelButtonText={modal.config.cancelBtnText}
        confirmButtonText={modal.config.confirmBtnText}
        showConfirmBtn={modal.config.showConfirmBtn}
        onCancel={handleModalCancel}
        onAccept={handleModalAccept}>
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </>
  );
}
