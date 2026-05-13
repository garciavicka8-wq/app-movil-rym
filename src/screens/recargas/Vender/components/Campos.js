import React, {useRef, useState} from 'react';
import {Alert, Keyboard, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {CustomModal, CustomScanner} from '../../../../components';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Button} from 'react-native-paper';
import {setTransaccionStore} from '../../../../features/taecel/taecelSlice';
import {Helpers, Storage} from '../../../../utils';
import {useCustomNavigation, useLogout, useModal} from '../../../../hooks';
import {APP_NAVIGATION, TXN} from '../../../../constants';
import {makeTransactionAPI} from '../../../../services/taecel';
import {restarCredito} from '../../../../features/credito/creditoSlice';
import CustomNumericField from '../../../../components/CustomNumericField';
import Descripcion from './Descripcion';
import {ERROR_CODE_NAMES} from '../../../../errors';
import {useNetInfo} from '@react-native-community/netinfo';

export default function Campos({route}) {
  const {carrier, products} = route.params;
  const {filtrandoProductos} = useSelector(state => state.taecel);
  const [codigoPinStorage] = useState(Storage.getItem('codigoPin'));
  const [selectedProduct, setSelectedProduct] = useState(
    carrier.CategoriaID == TXN.CODES.SERVICIO ? products[0] : null,
  );
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
    // REALIZAR TRANSACCION
    hacerTransaccionAPI(data);
  };
  // HACER TRANSACCION API
  const hacerTransaccionAPI = async data => {
    const descripcionProducto =
      Helpers.descripcionProductoTransaccion(selectedProduct);
    try {
      const res = await makeTransactionAPI(
        selectedProduct.CategoriaID,
        selectedProduct.Codigo,
        data.referencia,
        data.monto,
        descripcionProducto,
        carrier.CategoriaID == TXN.CODES.SERVICIO
          ? 'payService'
          : 'makeRecharge',
      );
      // MOSTRAR PANTALLA DE DETALLE EN CASO DE SER EXITOSA
      // RESTAMOS EL MONTO DE LA TRANSACCION AL CREDITO DISPONIBLE
      const montoTransaccion = Helpers.calcularTotalTransaccion(
        res.transaccion,
        selectedProduct.CategoriaID,
      );
      dispatch(restarCredito(montoTransaccion));
      dispatch(setTransaccionStore({...res.transaccion, descripcionProducto}));
      // RESET LOGIN TIME
      // await Utils.setLoginTime();
      navigation.changeStack(1, [
        {name: APP_NAVIGATION.SCREENS.RECARGAS_MENU},
        {
          name: APP_NAVIGATION.SCREENS.DETALLE_TRANSACCION,
        },
      ]);
    } catch (error) {
      console.log(error.message);
      if (
        error.message == 'DEVICE_NOT_LINKED' ||
        error.message == ERROR_CODE_NAMES.OUTDATED_APP_VERSION ||
        error.message == ERROR_CODE_NAMES.DEACTIVATED_ACCOUNT
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
        error: <Text>{error.message}</Text>,
      });
    }
  };

  const handleTextInputChange = (text, inputName) => {
    if (
      [TXN.CODES.RECARGA, TXN.CODES.PAQUETE, TXN.CODES.GIFTCARD].includes(
        carrier.CategoriaID,
      ) &&
      inputName === 'referencia' &&
      text.length === 10
    ) {
      confirmarReferenciaRef.current?.focus();
    }
    if (
      [TXN.CODES.RECARGA, TXN.CODES.PAQUETE, TXN.CODES.GIFTCARD].includes(
        carrier.CategoriaID,
      ) &&
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

  const isRecharge = [TXN.CODES.RECARGA, TXN.CODES.PAQUETE].includes(
    carrier.CategoriaID,
  );

  return (
    <>
      {/* MONTO */}
      <>
        {carrier.CategoriaID == TXN.CODES.SERVICIO ? (
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
              <Text style={styles.errorMessage}>{formik.errors.monto}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.listaProductosLabel}>Elige un monto</Text>
            <View style={styles.chipsContainer}>
              {products.map(item => {
                const isSelected = selectedProduct?.Codigo === item.Codigo;
                return (
                  <TouchableOpacity
                    key={item.Codigo}
                    activeOpacity={0.7}
                    onPress={() => handleMenuItemPress(item)}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      ${item.Monto}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
      {carrier.CategoriaID == TXN.CODES.SERVICIO && !filtrandoProductos && (
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
        marginY={5}
      />
      <Descripcion />
      <Button
        style={styles.modernButton}
        labelStyle={styles.buttonLabel}
        mode="contained"
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
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    marginTop: 10,
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 5,
    marginTop: 15,
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
    color: '#EF4444',
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginTop: 10,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    width: '30%', // Ajuste para 3 columnas uniformes
    height: 45,
    borderRadius: 12,
    margin: '1.5%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#0E1321',
    borderColor: '#0E1321',
  },
  chipClear: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  modernButton: {
    marginTop: 20,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    backgroundColor: '#0E1321', // Dark blue black
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
});
