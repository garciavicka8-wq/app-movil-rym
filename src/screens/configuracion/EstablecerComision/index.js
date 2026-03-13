import React, {useEffect, useState} from 'react';
import {Alert, Keyboard, StatusBar, Text, View} from 'react-native';
import {Button, Card} from 'react-native-paper';
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

export default function EstablecerComision() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [comisionRecargas, setComisionRecargas] = useState(0);
  const [comisionRecargasFecha, setComisionRecargasFecha] = useState('');
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
  const modal = useModal();
  const {logout} = useLogout();
  const netInfo = useNetInfo();
  const navigation = useCustomNavigation();

  useEffect(() => {
    // VERIFICAR CONEXION
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
      setComisionRecargas(userStorage.comisionRecargas);
      setComisionRecargasFecha(userStorage.comisionRecargasFecha);
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
      Alert.alert('Mensaje', message);
    }
  };
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    modal.setConfig({open: false});
  };

  const guardarComision = async ({comision, password}) => {
    try {
      // VERIFICAR CONEXION
      if (!netInfo?.isConnected) {
        Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
        return;
      }
      modal.setConfig({
        open: true,
        type: 'progress',
        progressTitle: 'Guardando comisión',
      });
      const data = await saveRechargeCommissionApi(comision, password);
       modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'mensaje',
        showCancelBtn: false,
        content: <Text>Comisión guardada correctamente</Text>,
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
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: <Text>{message}</Text>,
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
    <View style={{marginHorizontal: '2.5%', flex: 1}}>
      {navigation.isFocused && <StatusBar backgroundColor={Colors.dark} />}
      <MessageIconBox
        message={`Establece la comisión que le cobrarás al cliente por el servicio de recargas, actualmente es de ${
          cargando ? '...' : Money(comisionRecargas) + ' pesos.'
        }`}
      />
      <Card style={{backgroundColor: 'white'}}>
        <Card.Title title="¿Cuanto le cobrarás al cliente?" />
        <Card.Content>
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
            uppercase
            onPress={handlePress}>
            Guardar
          </Button>
          <View style={{marginTop: 10}}>
            <Text>
              {'La comisión fue actualizada por última vez el ' +
                comisionRecargasFecha}
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
      <NoConnectionSnackbar
        open={openSnackbar}
        onDismiss={() => setOpenSnackbar(false)}
      />
    </View>
  );
}
