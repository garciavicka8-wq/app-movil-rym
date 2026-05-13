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
      <Fila label="Establecimiento" value={usuario?.nomComercial || 'Cargando...'} />
      <Fila label="Fecha y Hora" value={transaccionStore.Fecha} />
      <Fila label="ID Transacción" value={transaccionStore.TransID} />
      <Fila label="Folio" value={transaccionStore.Folio} />
      <Fila label="Proveedor" value={transaccionStore.Carrier} />
      <Fila label="Referencia" value={transaccionStore.Telefono} />
      {transaccionStore.pin && <Fila label="Código PIN" value={transaccionStore.pin} />}
      
      <View style={styles.priceSection}>
        <Fila label="Monto" value={transaccionStore.Monto} isPrice />
        <Fila label="Comisión" value={comision} isPrice />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>
            {Helpers.sumWithDecimals(transaccionStore.Monto, comision)}
          </Text>
        </View>
      </View>

      {sharedBtnClicked && (
        <AvisoPagoServicios categoriaID={transaccionStore.CategoriaID} />
      )}
    </View>
  );
}

function AvisoPagoServicios({categoriaID}) {
  if (categoriaID !== TXN.CODES.SERVICIO) return null;

  return (
    <View style={styles.warningBox}>
      <Text style={styles.warningText}>
        IMPORTANTE: Pague solo recibos vigentes. Los pagos se reflejan de 24 a 48 horas hábiles.
      </Text>
    </View>
  );
}

const Fila = ({label, value, isPrice}) => {
  return (
    <View style={styles.fila}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isPrice && styles.priceValue]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    paddingHorizontal: 25,
  },
  fila: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1.5,
  },
  priceSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceValue: {
    color: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
  },
  totalLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '900',
    color: '#0E1321',
  },
  warningBox: {
    marginTop: 20,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
  },
});
