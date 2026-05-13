import React, {useEffect, useState, useRef} from 'react';
import {Alert, Keyboard, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Divider} from 'react-native-paper';
import {CustomModal, CustomNumericField} from '../../../../components';
import {setJugadas} from '../../../../features/tickets/jugarTickets/jugarTicketsSlice';
import {useModal, useModalInputs} from '../../../../hooks';

export default function Tabla() {
  const [jugadaSeleccionada, setJugadaSeleccionada] = useState(null);
  const {sorteoSeleccionado, jugadas} = useSelector(
    state => state.jugarTickets,
  );
  const dispatch = useDispatch();
  const modal = useModal();
  const modalInputs = useModalInputs();

  const obtenerNumColumnas = codigoSorteo => {
    const sorteosMap = {
      SMAY: ['1°', '2°', '3°'],
      SSUP: ['1°', '2°'],
      SESP: ['1°', '2°'],
      GN: ['1°', '2°'],
      SMAG: ['1°', '2°'],
      SZOD: ['1°'],
      SGSE: ['1°'],
    };

    return sorteosMap[codigoSorteo] || [];
  };

  const onRowPress = item => {
    if (item.numero.includes('X')) return;
    setJugadaSeleccionada(item);
    modal.setConfig({
      open: true,
      type: 'alert',
      alertTitle: 'Actualizar',
      contentType: 'editar',
      action: 'editar',
      confirmBtnText: 'ACEPTAR',
      cancelBtnText: 'CANCELAR',
      showCancelBtn: true,
    });
  };

  const onRowLongPress = item => {
    Alert.alert('¿Eliminar jugada?', 'se eliminara esta jugada de la tabla', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sí, eliminar',
        onPress: () => {
          const newJugadas = jugadas.filter(j => j.id !== item.id);
          dispatch(setJugadas(newJugadas));
        },
      },
    ]);
  };

  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };

  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'editar') {
      handleActualizarJugada();
    }
  };

  const handleActualizarJugada = () => {
    const {validInputs, data, handleReset} = modalInputs;
    if (jugadaSeleccionada && validInputs() && data) {
      Keyboard.dismiss();
      const jugadaIndex = jugadas.findIndex(
        el => el.id === jugadaSeleccionada.id,
      );
      const _jugadas = [...jugadas];
      _jugadas[jugadaIndex] = {
        ...jugadaSeleccionada,
        numero: data.numero,
        lugares: data.lugares,
        totalApostado: data.lugares.reduce(
          (acc, cantidad) => acc + parseInt(cantidad),
          0,
        ),
      };
      dispatch(setJugadas(_jugadas));
      handleModalCancel();
      setTimeout(() => {
        handleReset();
      }, 300);
    }
  };

  if (!sorteoSeleccionado) {
    return <Text style={styles.noSorteosText}>No hay sorteos seleccionados</Text>;
  }

  const columns = obtenerNumColumnas(sorteoSeleccionado.codigoSorteo);

  return (
    <View style={styles.container}>
      {/* HEADER SIMULADO */}
      <View style={styles.tableHeader}>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Número</Text>
        </View>
        {columns.map(col => (
          <View key={col} style={styles.headerCell}>
            <Text style={styles.headerText}>{col}</Text>
          </View>
        ))}
      </View>
      <Divider />

      {/* FILAS SIMULADAS */}
      {jugadas.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => onRowPress(item)}
            onLongPress={() => onRowLongPress(item)}
            style={styles.tableRow}
          >
            <View style={styles.cell}>
              <Text style={styles.cellText}>{item.numero}</Text>
            </View>
            {item.lugares.map((lugar, idx) => {
              const valor = lugar === '' || lugar === '0' ? 'X' : lugar;
              return (
                <View key={`${item.id}-${idx}`} style={styles.cell}>
                  <Text style={[styles.cellText, valor === 'X' && styles.textMuted]}>
                    {valor}
                  </Text>
                </View>
              );
            })}
          </TouchableOpacity>
          {index < jugadas.length - 1 && <Divider style={styles.rowDivider} />}
        </React.Fragment>
      ))}

      {/* MODAL */}
      <CustomModal
        open={modal.config.open}
        type={modal.config.type}
        progressTitle={modal.config.progressTitle}
        alertTitle={modal.config.alertTitle}
        cancelButtonText={modal.config.cancelBtnText}
        confirmButtonText={modal.config.confirmBtnText}
        showConfirmBtn={modal.config.showConfirmBtn}
        showCloseBtn={true}
        onClose={handleModalCancel}
        onAccept={handleModalAccept}>
        {modal.config.contentType === 'editar' && jugadaSeleccionada && (
          <ModalInputGroup
            jugada={jugadaSeleccionada}
            modalInputs={modalInputs}
          />
        )}
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </View>
  );
}

const ModalInputGroup = ({jugada, modalInputs}) => {
  const {inputs, errors} = modalInputs;
  const posiciones = {0: 'primero', 1: 'segundo', 2: 'tercero'};
  const apuestaInputRef = useRef(null);

  useEffect(() => {
    if (jugada) {
      modalInputs.setInputValue('apuesta', jugada.numero);
      jugada.lugares.forEach((lugar, index) => {
        const _lugar = lugar === '' ? '0' : lugar;
        modalInputs.setInputValue([posiciones[index]], _lugar);
      });
      modalInputs.setNumPlaces(jugada.lugares.length);
    }
    apuestaInputRef?.current?.focus();
  }, [jugada]);

  return (
    <View style={styles.modalContent}>
      <View style={styles.inputRow}>
        <View style={styles.inputFieldContainer}>
          <Text style={styles.inputFieldLabel}>Número</Text>
          <CustomNumericField
            inputRef={apuestaInputRef}
            placeholder="00"
            value={inputs.apuesta}
            error={errors.apuesta}
            onChange={text => modalInputs.handleOnchange('apuesta', text)}
            maxLength={3}
            hideErrorMessage
            width={70}
          />
        </View>
        {jugada.lugares.length >= 1 && (
          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputFieldLabel}>1er</Text>
            <CustomNumericField
              placeholder="0"
              value={inputs.primero}
              error={errors.primero}
              onChange={text => modalInputs.handleOnchange('primero', text)}
              maxLength={3}
              hideErrorMessage
              width={65}
            />
          </View>
        )}
        {jugada.lugares.length >= 2 && (
          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputFieldLabel}>2do</Text>
            <CustomNumericField
              placeholder="0"
              value={inputs.segundo}
              error={errors.segundo}
              onChange={text => modalInputs.handleOnchange('segundo', text)}
              maxLength={3}
              hideErrorMessage
              width={65}
            />
          </View>
        )}
        {jugada.lugares.length >= 3 && (
          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputFieldLabel}>3er</Text>
            <CustomNumericField
              placeholder="0"
              value={inputs.tercero}
              error={errors.tercero}
              onChange={text => modalInputs.handleOnchange('tercero', text)}
              maxLength={3}
              hideErrorMessage
              width={65}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  textMuted: {
    color: '#CBD5E1',
  },
  rowDivider: {
    backgroundColor: '#F1F5F9',
  },
  noSorteosText: {
    fontFamily: 'Inter',
    textAlign: 'center',
    padding: 20,
    color: '#64748B',
  },
  modalContent: {
    paddingVertical: 10,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
  },
  inputFieldContainer: {
    alignItems: 'center',
  },
  inputFieldLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
});
