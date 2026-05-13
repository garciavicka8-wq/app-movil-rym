import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  IconButton,
  Portal,
} from 'react-native-paper';

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
  confirmButtonText = 'Aceptar',
  showConfirmBtn = true,
  scrollableContent = false,
  showCloseBtn = false,
  onClose,
  confirmButtonDisabled = false,
}) {
  return (
    <Portal>
      <Dialog
        visible={open}
        dismissable={false}
        style={styles.dialogContainer}>
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
            confirmButtonDisabled={confirmButtonDisabled}
          />
        )}
      </Dialog>
    </Portal>
  );
}

const ProgressContent = ({title}) => {
  return (
    <Dialog.Content>
      <View style={styles.progressContainer}>
        <ActivityIndicator size="large" color="#0E1321" />
        <Text style={styles.progressText}>{title}</Text>
      </View>
    </Dialog.Content>
  );
};

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
  confirmButtonDisabled,
}) => {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showCloseBtn && (
          <IconButton 
            icon="close" 
            size={20} 
            iconColor="#64748B" 
            onPress={onClose} 
            style={styles.closeBtn}
          />
        )}
      </View>
      
      {scrollableContent ? (
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.contentPadding}>{content}</View>
          </ScrollView>
        </Dialog.ScrollArea>
      ) : (
        <Dialog.Content style={styles.contentPadding}>
          {content}
        </Dialog.Content>
      )}

      <Dialog.Actions style={styles.actions}>
        {showCancelButton && (
          <Button 
            mode="text" 
            onPress={onCancel} 
            textColor="#64748B"
            labelStyle={styles.buttonLabel}
          >
            {cancelButtonText}
          </Button>
        )}
        {showConfirmBtn && (
          <Button 
            mode="contained" 
            onPress={onAccept} 
            buttonColor="#0E1321"
            disabled={confirmButtonDisabled}
            labelStyle={styles.buttonLabel}
            style={styles.confirmButton}
          >
            {confirmButtonText}
          </Button>
        )}
      </Dialog.Actions>
    </>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  contentPadding: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  scrollArea: {
    paddingHorizontal: 0,
    maxHeight: 400,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    justifyContent: 'flex-end',
  },
  confirmButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
    marginLeft: 12,
  },
  buttonLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  progressText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 20,
    textAlign: 'center',
  },
});
