import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setProductoSeleccionado} from '../../../../features/taecel/taecelSlice';
import {CustomNumericField} from '../../../../components';

export default function CampoMonto({formik}) {
  const {
    carrierSeleccionado,
    productosFiltrados,
    productoSeleccionado,
  } = useSelector(state => state.taecel);
  const dispatch = useDispatch();

  const handleItemPress = item => {
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
      <View style={styles.chipsContainer}>
        {productosFiltrados.map(item => {
          const isSelected = productoSeleccionado?.Codigo === item.Codigo;
          return (
            <TouchableOpacity
              key={item.Codigo}
              activeOpacity={0.7}
              onPress={() => handleItemPress(item)}
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
    color: '#EF4444',
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
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
});
