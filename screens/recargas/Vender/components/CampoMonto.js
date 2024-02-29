import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Menu} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {setProductoSeleccionado} from '../../../../features/taecel/taecelSlice';
import {CustomNumericField} from '../../../../components';

export default function CampoMonto({formik}) {
  const {
    carrierSeleccionado,
    filtrandoProductos,
    productosFiltrados,
    productoSeleccionado,
  } = useSelector(state => state.taecel);
  const [visible, setVisible] = useState(false);
  const [buttonText, setButtonText] = useState('$00.00 MXN');
  const dispatch = useDispatch();

  const handleItemPress = item => {
    setVisible(false);
    setButtonText(`$${item.Monto} MXN`);
    if (item.Monto == '00.00') {
      formik.setFieldError('monto', 'Este campo es requerido');
      formik.setFieldValue('monto', '');
      setTimeout(() => {
        dispatch(setProductoSeleccionado(null));
      }, 50);
      return;
    }
    formik.setFieldValue('monto', item.Monto);
    setTimeout(() => {
      dispatch(setProductoSeleccionado(item));
    }, 50);
  };

  const handleChange = val => {
    if (!val) {
      formik.setFieldError('monto', 'Este campo es requerido');
    }
    formik.setFieldValue('monto', !val ? '' : val);
  };

  // SI LA CATEGORIA ES SERVICIOS
  if (carrierSeleccionado.CategoriaID == '3') {
    return (
      <>
        <View style={styles.inputBox}>
          <CustomNumericField
            type="currency"
            onChange={handleChange}
            value={formik.values.monto}
            error={formik.errors.monto && formik.touched.monto}
            errorMessage={formik.errors.monto}
            onBlur={formik.handleBlur('monto')}
            placeholder="Cantidad a pagar"
            prefix="$"
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Text style={styles.listaProductosLabel}>Elige un monto</Text>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button
            disabled={filtrandoProductos}
            mode="outlined"
            icon="chevron-down"
            contentStyle={{flexDirection: 'row-reverse'}}
            onPress={() => setVisible(true)}>
            {buttonText}
          </Button>
        }>
        <Menu.Item
          title="$00.00 MXN"
          onPress={() => handleItemPress({Monto: '00.00'})}
        />
        {productosFiltrados.map(item => (
          <Menu.Item
            key={item.Codigo}
            title={`$${item.Monto} MXN`}
            onPress={() => handleItemPress(item)}
          />
        ))}
      </Menu>
      {productoSeleccionado &&
        productoSeleccionado.Vigencia != '0' &&
        productoSeleccionado.CategoriaID !== '4' && (
          <Text style={styles.vigencia}>
            Vigencia: {productoSeleccionado.Vigencia}
          </Text>
        )}
      {<Text style={styles.errorMessage}>{formik.errors.monto}</Text>}
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
