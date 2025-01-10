import React, {useEffect, useState, useRef} from 'react';
import {Alert, Keyboard, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {CustomModal, CustomNumericField} from '../../../../components';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../../components/CustomTable';
import {setJugadas} from '../../../../features/tickets/jugarTickets/jugarTicketsSlice';
import {useModal, useModalInputs} from '../../../../hooks';
import {uuid} from '../../../../utils';

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
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'editar') {
      handleActualizarJugada();
    }
  };
  // HANDLE ACTUALIZAR JUGADA
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
    return <Text style={{marginLeft: 15}}>No hay sorteos</Text>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableCell text="Número" />
          {obtenerNumColumnas(sorteoSeleccionado.codigoSorteo).map(text => {
            return <TableCell key={text} text={text} />;
          })}
        </TableHeader>
        <TableBody scrollable>
          {jugadas.map(item => (
            <TableRow
              key={uuid()}
              onPress={() => onRowPress(item)}
              onLongPress={() => onRowLongPress(item)}>
              <TableCell text={item.numero} />
              {item.lugares.map(lugar => {
                const text = lugar === '' || lugar === '0' ? 'X' : lugar;
                return <TableCell key={uuid()} text={text} />;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* MODAL */}
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
        {modal.config.contentType === 'editar' && jugadaSeleccionada && (
          <ModalInputGroup
            jugada={jugadaSeleccionada}
            modalInputs={modalInputs}
          />
        )}
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </>
  );
}

const ModalInputGroup = ({jugada, modalInputs}) => {
  const {inputs, errors} = modalInputs;
  const posiciones = {
    0: 'primero',
    1: 'segundo',
    2: 'tercero',
  };
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
    <View style={styles.inputGroup}>
      <CustomNumericField
        inputRef={apuestaInputRef}
        placeholder="Número"
        value={inputs.apuesta}
        error={errors.apuesta}
        onChange={text => modalInputs.handleOnchange('apuesta', text)}
        maxLength={3}
        hideErrorMessage
        width={70}
      />
      {jugada.lugares.length === 1 && (
        <CustomNumericField
          placeholder="1er"
          value={inputs.primero}
          error={errors.primero}
          onChange={text => modalInputs.handleOnchange('primero', text)}
          maxLength={3}
          hideErrorMessage
          width={70}
          marginX={10}
        />
      )}
      {jugada.lugares.length === 2 && (
        <>
          <CustomNumericField
            placeholder="1er"
            value={inputs.primero}
            error={errors.primero}
            onChange={text => modalInputs.handleOnchange('primero', text)}
            maxLength={3}
            hideErrorMessage
            width={70}
            marginX={10}
          />
          <CustomNumericField
            placeholder="2do"
            value={inputs.segundo}
            error={errors.segundo}
            onChange={text => modalInputs.handleOnchange('segundo', text)}
            maxLength={3}
            hideErrorMessage
            width={70}
          />
        </>
      )}
      {jugada.lugares.length === 3 && (
        <>
          <CustomNumericField
            placeholder="1er"
            value={inputs.primero}
            error={errors.primero}
            onChange={text => modalInputs.handleOnchange('primero', text)}
            maxLength={3}
            hideErrorMessage
            width={50}
            marginX={10}
          />
          <CustomNumericField
            placeholder="2do"
            value={inputs.segundo}
            error={errors.segundo}
            onChange={text => modalInputs.handleOnchange('segundo', text)}
            maxLength={3}
            hideErrorMessage
            width={50}
          />
          <CustomNumericField
            placeholder="3er"
            value={inputs.tercero}
            error={errors.tercero}
            onChange={text => modalInputs.handleOnchange('tercero', text)}
            maxLength={3}
            hideErrorMessage
            width={50}
            marginX={10}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginVertical: 10,
  },
});
