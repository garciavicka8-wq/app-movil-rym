import React, {useEffect, useState, useLayoutEffect} from 'react';
import {Alert, Keyboard, Text, View, StyleSheet} from 'react-native';
import {Button, Card, Appbar} from 'react-native-paper';
import CustomNumericField from '../../../components/CustomNumericField';
import {useFormik} from 'formik';
import * as YUP from 'yup';
import {useCustomNavigation, useLogout, useModal} from '../../../hooks';
import {CustomModal} from '../../../components';
import {Colors, Money, Storage} from '../../../utils';
import {ERROR_CODE_NAMES} from '../../../errors';
import NoConnectionSnackbar from '../../../components/NoConnectionSnackbar';
import {useNetInfo} from '@react-native-community/netinfo';
import MessageIconBox from '../../../components/MessageIconBox';
import { saveRechargeCommissionApi } from './services';
import CustomStatusBar from '../../../components/CustomStatusBar';
import {Container, Content} from '../../../components/Layout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function EstablecerComision({navigation}) {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [comisionRecargas, setComisionRecargas] = useState(0);
  const [comisionRecargasFecha, setComisionRecargasFecha] = useState('');
  
  const modal = useModal();
  const {logout} = useLogout();
  const netInfo = useNetInfo();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const formik = useFormik({
    initialValues: {
      comision: '',
      password: '',
    },
    validationSchema: YUP.object().shape({
      comision: YUP.string().required('Este campo es requerido'),
      password: YUP.string().required('Este campo es requerido'),
    }),
    onSubmit: function (data) {
      guardarComision(data);
    },
  });

  useEffect(() => {
    if (netInfo.isConnected) {
      setOpenSnackbar(false);
      cargarComision();
    }
    if (netInfo?.isConnected === false) {
      setOpenSnackbar(true);
    }
  }, [netInfo.isConnected]);

  const cargarComision = async () => {
    try {
      setCargando(true);
      const userStorage = Storage.getUser();
      setComisionRecargas(userStorage.comisionRecargas || 0);
      setComisionRecargasFecha(userStorage.comisionRecargasFecha || 'N/A');
      setCargando(false);
    } catch ({message}) {
      if (
        message == 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      console.log('Error loading commission:', message);
    }
  };

  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };

  const handleModalAccept = () => {
    modal.setConfig({open: false});
  };

  const guardarComision = async ({comision, password}) => {
    try {
      if (!netInfo?.isConnected) {
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Guardando comisión...',
      });
      const data = await saveRechargeCommissionApi(comision, password);
       modal.setConfig({
        type: 'alert',
        alertTitle: 'Éxito',
        contentType: 'mensaje',
        showCancelBtn: false,
        content: <Text style={styles.modalText}>Comisión guardada correctamente.</Text>,
        confirmBtnText: 'Entendido',
      });
      formik.resetForm();
      setComisionRecargas(parseFloat(data.comision));
      setComisionRecargasFecha(data.updated_at);
      Storage.updateUser({
        comisionRecargas: data.comision,
        comisionRecargasFecha: data.updated_at
      });
      
    } catch ({message}) {
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Error',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: <Text style={styles.modalText}>{message}</Text>,
        confirmBtnText: 'Entendido',
      });
    }
  };

  const handlePress = () => {
    Keyboard.dismiss();
    formik.handleSubmit();
  };

  const handleTextInputChange = (text, inputName) => {
    formik.setFieldValue(inputName, text !== null ? text : '');
  };

  const disableButton =
    formik.values.comision == '' ||
    formik.values.password == '' ||
    formik.errors.hasOwnProperty('comision');

  return (
    <View style={styles.mainContainer}>
      <CustomStatusBar color="darkBackground" />
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Comisión Recargas" 
        />
      </Appbar.Header>

      <Container bgColor={Colors.lightBackground}>
        <Content>
          <View style={styles.infoCard}>
            <View style={styles.infoIconBox}>
              <Icon name="cash-multiple" size={30} color="#1E293B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>COMISIÓN ACTUAL</Text>
              <Text style={styles.infoValue}>
                {cargando ? '...' : Money(comisionRecargas)}
              </Text>
              <Text style={styles.infoSubtext}>
                Cobrada al cliente por cada recarga.
              </Text>
            </View>
          </View>

          <MessageIconBox
            message="Establece la comisión que le cobrarás al cliente por el servicio de recargas."
          />

          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.formTitle}>¿Cuánto cobrarás?</Text>
              
              <CustomNumericField
                type="currency"
                placeholder="$0.00"
                value={formik.values.comision}
                onChange={text => handleTextInputChange(text, 'comision')}
                onBlur={formik.handleBlur('comision')}
                error={
                  formik.errors.hasOwnProperty('comision') &&
                  formik.touched.hasOwnProperty('comision')
                }
                errorMessage={formik.errors.comision}
                marginY={10}
              />

              <CustomNumericField
                type="password"
                placeholder="Contraseña de Usuario"
                value={formik.values.password}
                onChange={text => handleTextInputChange(text, 'password')}
                onBlur={formik.handleBlur('password')}
                error={
                  formik.errors.hasOwnProperty('password') &&
                  formik.touched.hasOwnProperty('password')
                }
                errorMessage={formik.errors.password}
                marginY={10}
              />

              <Button
                disabled={disableButton}
                mode="contained"
                buttonColor="#0E1321"
                style={styles.saveButton}
                labelStyle={styles.saveButtonLabel}
                onPress={handlePress}>
                GUARDAR CAMBIOS
              </Button>

              <View style={styles.footerInfo}>
                <Icon name="clock-outline" size={14} color="#94A3B8" />
                <Text style={styles.footerText}>
                  {'Última actualización: ' + comisionRecargasFecha}
                </Text>
              </View>
            </Card.Content>
          </Card>

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
        </Content>
        <NoConnectionSnackbar
          open={openSnackbar}
          onDismiss={() => setOpenSnackbar(false)}
        />
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  infoValue: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '900',
    color: '#0E1321',
    marginVertical: 2,
  },
  infoSubtext: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 5,
  },
  formTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 6,
  },
  saveButtonLabel: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 6,
    fontWeight: '500',
  },
  modalText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});
