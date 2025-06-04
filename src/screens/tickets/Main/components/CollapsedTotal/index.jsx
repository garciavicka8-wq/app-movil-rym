import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useModal} from '../../../../../hooks';
import {CustomModal} from '../../../../../components';
import useCollapsedTotal from './hooks/useCollapsedTotal';
import Toolbar from './components/Toolbar';
import ListaRegistros from './components/ListaRegistros';

export default function CollapsedTotal() {
  const modal = useModal();
  const collapsedTotalHook = useCollapsedTotal(modal);
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
  };

  return (
    <>
      <View style={styles.collapsedView}>
        <View style={styles.collapsedDialog}>
          {/* TOOL BAR */}
          <Toolbar collapsedTotalHook={collapsedTotalHook} />
          {collapsedTotalHook.showList && (
            <View style={{backgroundColor: '#fff'}}>
              <ListaRegistros />
            </View>
          )}
        </View>
      </View>
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

const styles = StyleSheet.create({
  collapsedView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
  },
  collapsedDialog: {
    width: '90%',
    backgroundColor: 'black',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderColor: 'rgba(0, 0, 0,0.2)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 10,
  },
  registroItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
});
