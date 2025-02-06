import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Helpers, Money, Storage} from '../../../../utils';
import {TXN} from '../../../../constants';

export default function Detalles({sharedBtnClicked}) {
  const {transaccionStore} = useSelector(state => state.taecel);
  const [usuario, setUsuario] = useState({nomComercial: ''});
  const [comision, setComision] = useState('');

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = () => {
    const _usuario = Storage.getItem('usuario', true);
    let _comision = Helpers.sumWithDecimals(
      transaccionStore.Cargo,
      transaccionStore.Comision,
    );
    // SI ES RECARGA
    if (['1', '2'].includes(transaccionStore.CategoriaID)) {
      _comision =
        transaccionStore._comisionRecargas !== undefined
          ? transaccionStore._comisionRecargas
          : Money(2);
    }
    setComision(_comision);
    setUsuario(_usuario);
  };

  return (
    <View style={styles.infoBox}>
      <Fila label="Usuario" value={usuario.nomComercial} />
      <Fila label="Fecha" value={transaccionStore.Fecha} />
      <Fila label="TransID" value={transaccionStore.TransID} />
      <Fila label="Folio" value={transaccionStore.Folio} />
      <Fila label="Proveedor" value={transaccionStore.Carrier} />
      <Fila label="Bolsa" value={transaccionStore.Bolsa} />
      <Fila label="Referencia" value={transaccionStore.Telefono} />
      <Fila label="Código" value={transaccionStore.pin} />
      <Fila label="Monto" value={transaccionStore.Monto} />
      <Fila label="Comisión" value={comision} />
      <Fila
        label="Total"
        value={Helpers.sumWithDecimals(transaccionStore.Monto, comision)}
      />
      {sharedBtnClicked && (
        <AvisoPagoServicios categoriaID={transaccionStore.CategoriaID} />
      )}
    </View>
  );
}

function AvisoPagoServicios({categoriaID}) {
  if (categoriaID !== TXN.CODES.SERVICIO) return null;

  return (
    <View>
      <Text style={{textAlign: 'justify', fontWeight: 'bold'}}>
        Por favor, pague solo recibos vigentes, ya que los vencidos no son
        reconocidos por el sistema y podrían generar cargos adicionales. Los
        pagos se reflejan de 24 a 48 horas hábiles, pero si se realizan en fines
        de semana o días festivos, podrían demorar más. Tiene 48 horas después
        de procesado el pago para reportar cualquier aclaración.
      </Text>
    </View>
  );
}

const Fila = ({label, value}) => {
  return (
    <View style={styles.fila}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    paddingHorizontal: 20,
  },
  fila: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 5,
  },
  label: {
    fontWeight: 'bold',
    color: 'black',
  },
  value: {
    fontWeight: '400',
    color: 'black',
  },
});
