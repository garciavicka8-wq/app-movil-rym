import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {useSelector} from 'react-redux';

export default function Descripcion() {
  const {productoSeleccionado} = useSelector(state => state.taecel);

  if (productoSeleccionado === null) return null;

  if (
    productoSeleccionado.CategoriaID == '1' ||
    productoSeleccionado.CategoriaID == '2'
  ) {
    return <Text style={styles.desc}>{productoSeleccionado.Descripcion}</Text>;
  }

  if (productoSeleccionado.CategoriaID == '4')
    return <Text style={styles.desc}>{productoSeleccionado.Vigencia}</Text>;

  return (
    <Text style={styles.desc}>
      FAVOR DE HACER USO CORRECTO DE ESTE SERVICIO: No cobre RECIBOS PASADOS,
      solo deben ingresarse recibos vigentes. Si tiene dudas por favor contacte
      a un ejecutivo antes de procesar su pago. Tiene 5 días naturales para
      solicitar aclaraciones sobre el cobro de su recibo, después de esta fecha
      no nos responsabilizamos por sus pagos. **Una vez procesado el pago ya no
      habra reembolsos ni devoluciones. RECARGAS y MÁS no se responsabiliza por
      cargos de reconexion o multas.
    </Text>
  );
}

const styles = StyleSheet.create({
  desc: {
    padding: 8,
    marginTop: 10,
    borderRadius: 8,
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
});
