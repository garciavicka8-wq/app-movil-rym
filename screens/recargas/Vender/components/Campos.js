import React, {useRef, useState} from 'react';
import {Alert, Keyboard, StyleSheet, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {CustomModal, CustomScanner} from '../../../../components';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Button, Menu} from 'react-native-paper';
import {setTransaccionStore} from '../../../../features/taecel/taecelSlice';
import {Helpers, Storage} from '../../../../utils';
import {useCustomNavigation, useLogout, useModal} from '../../../../hooks';
import {APP_NAVIGATION} from '../../../../constants';
import {makeRecharge, payService} from '../../../../services/taecel';
import {restarCredito} from '../../../../features/credito/creditoSlice';
import CustomNumericField from '../../../../components/CustomNumericField';
import Descripcion from './Descripcion';
import {ERROR_CODE_NAMES} from '../../../../errors';
import {verifyUserAccountStatus} from '../../../../services/reports';
import {useNetInfo} from '@react-native-community/netinfo';

export default function Campos({route}) {
  const {carrier, products} = route.params;
  const {filtrandoProductos} = useSelector(state => state.taecel);
  const {creditoDisponible} = useSelector(state => state.credito);
  const [codigoPinStorage] = useState(Storage.getItem('codigoPin'));
  const [selectedProduct, setSelectedProduct] = useState(
    carrier.CategoriaID == 3 ? products[0] : null,
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonText, setMenuButtonText] = useState('$00.00 MXN');
  const campoReferencia = {
    nombre: carrier.Campos[0].Nombre,
    minLeng: carrier.Campos[0].Min,
    maxLeng: carrier.Campos[0].Max,
  };
  const referenciaRef = useRef(null);
  const confirmarReferenciaRef = useRef(null);
  const codigoPinRef = useRef(null);
  const {logout} = useLogout();
  const netInfo = useNetInfo();
  const modal = useModal();
  const navigation = useCustomNavigation();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      monto: '',
      referencia: '',
      confirmarReferencia: '',
      codigoPin: '',
    },
    validationSchema: Yup.object().shape({
      monto: Yup.string().required('Este campo es requerido'),
      referencia: Yup.string()
        .required('Este campo es requerido')
        .min(
          campoReferencia.minLeng,
          'La referencia debe ser de ' + campoReferencia.minLeng,
        )
        .matches('[0-9]', 'Debes ingresar unicamente números'),
      confirmarReferencia: Yup.string()
        .required('Este campo es requerido')
        .oneOf([Yup.ref('referencia')], 'Los campos no coinciden')
        .min(
          campoReferencia.minLeng,
          'La referencia debe ser de ' + campoReferencia.minLeng,
        )
        .matches('[0-9]', 'Debes ingresar unicamente números'),
      codigoPin: Yup.string()
        .required('Este campo es requerido')
        .oneOf([codigoPinStorage], 'El PIN es incorrecto')
        .min(4, 'El pin debe ser de 4 digitos')
        .max(4, 'El pin debe ser de 4 digitos'),
    }),
    onSubmit: data => {
      handleTransaction(data);
    },
  });
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
  // SCANNED DATA
  const handleScannedData = data => {
    formik.setValues({
      ...formik.values,
      referencia: data,
      confirmarReferencia: data,
    });
  };
  // MAKE TRANSACTION
  const handleTransaction = data => {
    const _codigoPinStorage = Storage.getItem('codigoPin');
    if (!_codigoPinStorage) {
      navigation.resetStack(APP_NAVIGATION.SCREENS.RECARGAS_MENU);
      return;
    }
    Keyboard.dismiss();
    // VERIFICAR CONEXION
    if (!netInfo?.isConnected) {
      Alert.alert('Mensaje', '¡Vaya parece que no hay internet!');
      return;
    }
    modal.setConfig({
      open: true,
      type: 'progress',
      progressTitle: `Transacción En Proceso${'\n'}No Interrumpas La Conexión`,
    });
    // VERIFICAR SI ES RECARGA TELEFONICA , PAQUETE O GIFTCARD
    if (['1', '2', '4'].includes(carrier.CategoriaID)) {
      hacerRecarga(data);
    }
    // VERIFICAR SI ES PAGO DE SERVICIO
    if (carrier.CategoriaID == '3') {
      pagarServicio(data);
    }
  };
  // MAKE RECHARGE
  const hacerRecarga = async data => {
    try {
      await verifyUserAccountStatus();
      const _esPosibleLaTransaccion = await esPosibleLaTransaccion(data.monto);
      const descripcionProducto =
        Helpers.descripcionProductoTransaccion(selectedProduct);
      // SI NO HAY CREDITO SUFICIENTE
      if (!_esPosibleLaTransaccion)
        throw new Error(
          'No hay credito suficiente para realizar la transacción',
        );
      const res = await makeRecharge(
        selectedProduct.CategoriaID,
        selectedProduct.Codigo,
        data.referencia,
        data.monto,
        descripcionProducto,
      );
      // MOSTRAR PANTALLA DE DETALLE EN CASO DE SER EXITOSA
      if (res.status == 'success') {
        // RESTAMOS EL MONTO DE LA TRANSACCION AL CREDITO DISPONIBLE
        const montoTransaccion = Helpers.calcularTotalTransaccion(
          res.transaccion,
          selectedProduct.CategoriaID,
        );
        dispatch(restarCredito(montoTransaccion));
        dispatch(
          setTransaccionStore({...res.transaccion, descripcionProducto}),
        );
        // RESET LOGIN TIME
        // await Utils.setLoginTime();
        navigation.changeStack(1, [
          {name: APP_NAVIGATION.SCREENS.RECARGAS_MENU},
          {
            name: APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION,
          },
        ]);
      }
      // MOSTRAR MENSAJE EN CASO DE ERROR
      if (res.status == 'error') {
        const {titulo, mensaje} = textoRespuesta(res.status);
        modal.setConfig({
          type: 'alert',
          alertTitle: titulo,
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          error: <Text>{mensaje}</Text>,
        });
      }
    } catch ({message}) {
      if (
        message == 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: <Text>{message}</Text>,
      });
    }
  };
  // PAY SERVICE
  const pagarServicio = async data => {
    try {
      await verifyUserAccountStatus();
      const _esPosibleLaTransaccion = await esPosibleLaTransaccion(data.monto);
      const descripcionProducto =
        Helpers.descripcionProductoTransaccion(selectedProduct);
      // SI NO HAY CREDITO SUFICIENTE
      if (!_esPosibleLaTransaccion)
        throw new Error(
          'No hay credito suficiente para realizar la transacción',
        );
      // SI LA TRANSACCION SE PUEDE REALIZAR
      const res = await payService(
        selectedProduct.CategoriaID,
        selectedProduct.Codigo,
        data.referencia,
        data.monto,
        descripcionProducto,
      );
      // MOSTRAR PANTALLA DE DETALLE EN CASO DE SER EXITOSA
      if (res.status == 'success') {
        // SUMAMOS EL MONTO DE LA TRANSACCION AL CREDITO DISPONIBLE
        const montoTransaccion = Helpers.calcularTotalTransaccion(
          res.transaccion,
          selectedProduct.CategoriaID,
        );
        dispatch(restarCredito(montoTransaccion));
        dispatch(
          setTransaccionStore({...res.transaccion, descripcionProducto}),
        );
        // RESET LOGIN TIME
        // await Utils.setLoginTime();
        navigation.changeStack(1, [
          {name: APP_NAVIGATION.SCREENS.RECARGAS_MENU},
          {
            name: APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION,
          },
        ]);
      }
      // MOSTRAR MENSAJE EN CASO DE ERROR
      if (res.status == 'error') {
        const {titulo, mensaje} = textoRespuesta(res.status);
        modal.setConfig({
          type: 'alert',
          alertTitle: titulo,
          contentType: 'error',
          action: 'error',
          showCancelBtn: false,
          error: <Text>{mensaje}</Text>,
        });
      }
    } catch ({message}) {
      if (
        message == 'DEVICE_NOT_LINKED' ||
        message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
      ) {
        logout();
        return;
      }
      modal.setConfig({
        type: 'alert',
        alertTitle: 'Mensaje',
        contentType: 'error',
        action: 'error',
        showCancelBtn: false,
        error: <Text>{message}</Text>,
      });
    }
  };
  // VERIFICAR DISPONIBILIDAD DE CREDITO
  const esPosibleLaTransaccion = async monto => {
    try {
      // SI EL CREDITO ES MAYOR AL LIMITE DE VENTA PERMITIR VENDER
      return creditoDisponible >= parseFloat(monto);
    } catch ({message}) {
      throw new Error(message);
    }
  };

  const textoRespuesta = res => {
    let titulo = '';
    let mensaje = '';
    // SI LA TRANSACCION FUE EXITOSA
    if (res === 'success') {
      titulo = 'Mensaje';
      mensaje = 'Transacción Exitosa';
    }
    // SI OCURRIO ALGUN ERROR
    if (res === 'error') {
      titulo = 'Error';
      mensaje = 'Ocurrio un error inesperado';
    }
    return {
      titulo,
      mensaje,
    };
  };

  const handleTextInputChange = (text, inputName) => {
    if (
      ['1', '2', '4'].includes(carrier.CategoriaID) &&
      inputName === 'referencia' &&
      text.length === 10
    ) {
      confirmarReferenciaRef.current?.focus();
    }
    if (
      ['1', '2', '4'].includes(carrier.CategoriaID) &&
      inputName === 'confirmarReferencia' &&
      text.length === 10
    ) {
      codigoPinRef.current?.focus();
    }
    if (inputName === 'codigoPin' && text.length === 4) {
      Keyboard.dismiss();
    }
    formik.setFieldValue(inputName, text);
  };

  const handleMenuItemPress = item => {
    setMenuVisible(false);
    setMenuButtonText(`$${item.Monto} MXN`);
    if (item.Monto == '00.00') {
      formik.setFieldError('monto', 'Este campo es requerido');
      formik.setFieldValue('monto', '');
      return;
    }
    formik.setFieldValue('monto', item.Monto);
    setSelectedProduct(item);
    formik.setFieldValue('monto', item.Monto);
  };

  const handleInputMontoChange = val => {
    if (!val) {
      formik.setFieldError('monto', 'Este campo es requerido');
    }
    formik.setFieldValue('monto', !val ? '' : val);
  };

  const isRecharge = ['1', '2'].includes(carrier.CategoriaID);

  return (
    <>
      {/* MONTO */}
      <>
        {carrier.CategoriaID == 3 ? (
          <>
            <CustomNumericField
              type="currency"
              onChange={handleInputMontoChange}
              value={formik.values.monto}
              error={formik.errors.monto && formik.touched.monto}
              errorMessage={formik.errors.monto}
              onBlur={formik.handleBlur('monto')}
              placeholder="Cantidad a pagar"
              prefix="$"
            />
            {formik.errors.monto && formik.touched.monto && (
              <ErrorMessage message={formik.errors.monto} />
            )}
          </>
        ) : (
          <>
            <Text style={styles.listaProductosLabel}>Elige un monto</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  icon="chevron-down"
                  contentStyle={{
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                  }}
                  style={{marginTop: 20}}
                  onPress={() => setMenuVisible(true)}>
                  {menuButtonText}
                </Button>
              }>
              <Menu.Item
                title="00.00"
                onPress={() => handleMenuItemPress({Monto: '00.00'})}
              />
              {products.map(item => (
                <Menu.Item
                  key={item.Codigo}
                  title={item.Monto}
                  onPress={() => handleMenuItemPress(item)}
                />
              ))}
            </Menu>
            {formik.errors.monto && formik.touched.monto && (
              <Text style={styles.errorMessage}>{formik.errors.monto}</Text>
            )}
          </>
        )}
      </>
      {/* REFERENCIA */}
      <CustomNumericField
        placeholder={campoReferencia.nombre}
        inputRef={referenciaRef}
        type={'password'}
        value={formik.values.referencia}
        onChange={text => handleTextInputChange(text, 'referencia')}
        onBlur={formik.handleBlur('referencia')}
        maxLength={isRecharge ? 10 : undefined}
        error={formik.errors.referencia && formik.touched.referencia}
        errorMessage={formik.errors.referencia}
        marginY={10}
      />
      <CustomNumericField
        type={isRecharge ? 'phone' : 'digits'}
        placeholder={campoReferencia.nombre}
        inputRef={confirmarReferenciaRef}
        value={formik.values.confirmarReferencia}
        onChange={text => handleTextInputChange(text, 'confirmarReferencia')}
        onBlur={formik.handleBlur('confirmarReferencia')}
        maxLength={isRecharge ? 10 : undefined}
        marginY={10}
        error={
          formik.errors.confirmarReferencia &&
          formik.touched.confirmarReferencia
        }
        errorMessage={formik.errors.confirmarReferencia}
      />
      {/* SCANNER */}
      {carrier.CategoriaID == '3' && !filtrandoProductos && (
        <CustomScanner onScanned={handleScannedData} />
      )}
      <CustomNumericField
        placeholder="Código PIN"
        type="password"
        inputRef={codigoPinRef}
        password
        value={formik.values.codigoPin}
        onChange={text => handleTextInputChange(text, 'codigoPin')}
        onBlur={formik.handleBlur('codigoPin')}
        maxLength={4}
        error={formik.errors.codigoPin && formik.touched.codigoPin}
        errorMessage={formik.errors.codigoPin}
      />
      <Descripcion />
      <Button
        style={{marginTop: 10}}
        mode="contained"
        buttonColor="black"
        uppercase
        onPress={() => {
          formik.handleSubmit();
        }}>
        Aceptar
      </Button>
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
  listaProductosLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  vigencia: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  inputBox: {
    width: '100%',
    minHeight: 60,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  errorMessage: {
    color: 'red',
    fontStyle: 'italic',
  },
});
