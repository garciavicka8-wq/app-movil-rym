import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  IconButton,
  Portal,
} from 'react-native-paper';
import colors from '../utils/Colors';

export default function CustomModal({
  open,
  type,
  alertTitle,
  progressTitle,
  children,
  onAccept,
  onCancel,
  showCancelButton = false,
  cancelButtonText = 'Cancelar',
  confirmButtonText = 'Entendido',
  showConfirmBtn = true,
  scrollableContent = false,
  showCloseBtn = false,
  onClose,
}) {
  return (
    <Portal>
      <Dialog
        visible={open}
        dismissable={false}
        style={{backgroundColor: 'white'}}>
        {type === 'progress' && <ProgressContent title={progressTitle} />}
        {type === 'alert' && (
          <AlertContent
            title={alertTitle}
            content={children}
            onAccept={onAccept}
            onCancel={onCancel}
            showCancelButton={showCancelButton}
            cancelButtonText={cancelButtonText}
            confirmButtonText={confirmButtonText}
            showConfirmBtn={showConfirmBtn}
            scrollableContent={scrollableContent}
            showCloseBtn={showCloseBtn}
            onClose={onClose}
          />
        )}
      </Dialog>
    </Portal>
  );
}

const ProgressContent = ({title}) => {
  return (
    <>
      <Dialog.Content style={{fontSize: 18}}>
        <View style={styles.progressContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold'}}>
            {title}
          </Text>
        </View>
      </Dialog.Content>
    </>
  );
};

{
  /* <View style={styles.progressContent}>
<ActivityIndicator size="large" color={colors.primary} />
<Text style={styles.progressContentText}>{title}</Text>
</View> */
}

const AlertContent = ({
  title,
  content,
  onAccept,
  onCancel,
  showCancelButton,
  cancelButtonText,
  confirmButtonText,
  showConfirmBtn,
  scrollableContent,
  showCloseBtn,
  onClose,
}) => {
  return (
    <>
      {!showCloseBtn && (
        <Dialog.Title style={{fontSize: 18}}>{title}</Dialog.Title>
      )}
      {showCloseBtn && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Dialog.Title style={{fontSize: 18}}>{title}</Dialog.Title>
          <IconButton icon={'close'} onPress={onClose} />
        </View>
      )}
      {scrollableContent && (
        <Dialog.ScrollArea>
          <ScrollView style={{maxHeight: 400}}>{content}</ScrollView>
        </Dialog.ScrollArea>
      )}
      {!scrollableContent && <Dialog.Content>{content}</Dialog.Content>}
      <Dialog.Actions>
        {showCancelButton && !showCloseBtn && (
          <Button onPress={() => onCancel()}>{cancelButtonText}</Button>
        )}
        {showConfirmBtn && (
          <Button mode="contained" onPress={() => onAccept()}>
            {confirmButtonText}
          </Button>
        )}
      </Dialog.Actions>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDialog: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  modalDialogTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalDialogContent: {
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {paddingHorizontal: 8, marginRight: 10, borderRadius: 8},
  modalCancelBtnText: {color: 'black', textTransform: 'uppercase'},
  modalAcceptBtn: {paddingHorizontal: 8, borderRadius: 8},
  modalAcceptBtnText: {color: '#fff', textTransform: 'uppercase'},
  progressContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  progressContentText: {
    fontSize: 18,
    flex: 1,
    flexWrap: 'wrap',
  },
});
