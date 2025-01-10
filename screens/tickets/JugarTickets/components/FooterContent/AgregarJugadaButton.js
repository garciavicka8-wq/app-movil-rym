import React, {useEffect, useRef} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {IconButton, Switch} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {CustomModal, CustomNumericField} from '../../../../../components';
import {agregarJugadaStore} from '../../../../../features/tickets/jugarTickets/jugarTicketsSlice';
import {useModal, useModalInputs} from '../../../../../hooks';
import {Colors, Utils, uuid} from '../../../../../utils';

export default function AgregarJugadaButton() {
  const {sorteoSeleccionado} = useSelector(state => state.jugarTickets);
  const modal = useModal();
  const modalInputs = useModalInputs();
  const dispatch = useDispatch();
  const apuestaInputRef = useRef(null);
  // OPEN MODAL
  const handleAgregarJugada = () => {
    modal.setConfig({
      open: true,
      type: 'alert',
      alertTitle: 'Agregar',
      confirmBtnText: 'ACEPTAR',
      cancelBtnText: 'CERRAR',
      contentType: 'agregar',
      action: 'agregar',
      showCancelBtn: true,
    });
    modalInputs.handleReset();
  };
  //   HANDLE MODAL CANCEL
  const handleModalCancel = () => {
    modal.setConfig({open: false});
    modalInputs.handleReset();
  };
  //   HANDLE MODAL ACCEPT
  const handleModalAccept = () => {
    if (modal.config.action === 'error' || modal.config.action === 'mensaje') {
      handleModalCancel();
    }
    if (modal.config.action === 'agregar') {
      handleAgregar();
    }
  };

  const handleAgregar = () => {
    const {validInputs, data, conPar, inputs, candado} = modalInputs;
    // VALIDAMOS LOS CAMPOS
    if (validInputs() && data && hasIntegers(data.lugares)) {
      // ALMACENAMOS LA JUGADA SI CANDADO ESTA DESACTIVADO
      if (candado) {
        const apuestaDigits = new Set(data.numero.split(''));
        if (apuestaDigits.size === 1 || data.numero.length < 3) {
          Alert.alert(
            'Mensaje',
            'Al jugar candado el numero debe ser de tres digitos y tener al menos uno diferente. Ejemplo: 123, 113, 456, etc.',
            [{text: 'Entendido'}],
          );
          return;
        }
        const permutaciones = Utils.permutations(data.numero);
        permutaciones.forEach(numero => {
          almacenarJugada(numero, data.lugares);
        });
      } else {
        almacenarJugada(data.numero, data.lugares);
      }
      // SI CON EL PAR ES TRUE
      if (conPar && data.numero.length === 3) {
        let newJugadaPar = {
          id: uuid(),
          numero: data.numero.slice(1),
          lugares: [],
          totalApostado: 0,
        };
        // AGREGAR CANTIDAD PAR
        for (let i = 0; i < data.lugares.length; i++) {
          newJugadaPar.lugares.push(
            inputs.cantidadPar === '' ? '0' : inputs.cantidadPar,
          );
        }
        // OBTENER TOTAL DE LUGARES
        newJugadaPar.totalApostado = newJugadaPar.lugares.reduce(
          (acc, cantidad) => acc + parseInt(cantidad),
          0,
        );
        dispatch(agregarJugadaStore(newJugadaPar));
      }
      // SI CANTIDAD FIJA ES TRUE SOLO LIMPIAMOS EL CAMPO APUESTA
      if (modalInputs.cantidadFija) return modalInputs.clearValue('apuesta');
      // PONER FOCUS EL INPUT APUESTA
      apuestaInputRef?.current?.focus();
      // LIMPIAR CAMPOS
      modalInputs.handleReset();
    }
  };

  const hasIntegers = (list = []) => {
    if (list.length === 0) return false;
    let integersFound = 0;
    list.forEach(item => {
      if (parseInt(item) > 0) {
        integersFound++;
      }
    });
    return integersFound > 0;
  };

  const almacenarJugada = (numero, lugares) => {
    dispatch(
      agregarJugadaStore({
        id: uuid(),
        numero: numero,
        lugares: lugares,
        totalApostado: lugares.reduce(
          (acc, cantidad) => acc + parseInt(cantidad),
          0,
        ),
      }),
    );
  };

  return (
    <>
      <IconButton
        icon="plus-circle"
        iconColor={Colors.blue}
        size={30}
        onPress={handleAgregarJugada}
      />
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
        {modal.config.contentType === 'agregar' && (
          <ModalAgregarContent
            modalInputs={modalInputs}
            sorteo={sorteoSeleccionado}
            apuestaInputRef={apuestaInputRef}
          />
        )}
        {modal.config.contentType === 'mensaje' && modal.config.content}
        {modal.config.contentType === 'error' && modal.config.error}
      </CustomModal>
    </>
  );
}

const ModalAgregarContent = ({sorteo, modalInputs, apuestaInputRef}) => {
  const {inputs, errors} = modalInputs;

  useEffect(() => {
    if (sorteo) {
      modalInputs.setNumPlaces(sorteo.numLugares);
    }
    apuestaInputRef?.current?.focus();
  }, [sorteo]);

  return (
    <View style={{marginVertical: undefined}}>
      <View style={styles.inputGroup}>
        <CustomNumericField
          inputRef={apuestaInputRef}
          placeholder="Número"
          value={inputs.apuesta}
          error={errors.apuesta}
          onChange={text => modalInputs.handleOnchange('apuesta', text)}
          hideErrorMessage
          width={70}
        />
        {sorteo.numLugares === 1 && (
          <CustomNumericField
            placeholder="1er"
            value={inputs.primero}
            error={errors.primero}
            onChange={text => modalInputs.handleOnchange('primero', text)}
            hideErrorMessage
            width={70}
            marginX={10}
          />
        )}
        {sorteo.numLugares === 2 && (
          <>
            <CustomNumericField
              placeholder="1er"
              value={inputs.primero}
              error={errors.primero}
              onChange={text => modalInputs.handleOnchange('primero', text)}
              hideErrorMessage
              width={70}
              marginX={10}
            />
            <CustomNumericField
              placeholder="2do"
              value={inputs.segundo}
              error={errors.segundo}
              onChange={text => modalInputs.handleOnchange('segundo', text)}
              hideErrorMessage
              width={70}
            />
          </>
        )}
        {sorteo.numLugares === 3 && (
          <>
            <CustomNumericField
              placeholder="1er"
              value={inputs.primero}
              error={errors.primero}
              onChange={text => modalInputs.handleOnchange('primero', text)}
              hideErrorMessage
              width={50}
              marginX={10}
            />
            <CustomNumericField
              placeholder="2do"
              value={inputs.segundo}
              error={errors.segundo}
              onChange={text => modalInputs.handleOnchange('segundo', text)}
              hideErrorMessage
              width={50}
            />
            <CustomNumericField
              placeholder="3er"
              value={inputs.tercero}
              error={errors.tercero}
              onChange={text => modalInputs.handleOnchange('tercero', text)}
              hideErrorMessage
              width={50}
              marginX={10}
            />
          </>
        )}
      </View>
      <CustomSwitch
        label="Con el par"
        value={modalInputs.conPar}
        onChange={() => modalInputs.handleConPar(!modalInputs.conPar)}
      />
      {modalInputs.conPar && (
        <View style={styles.modalRow}>
          <Text style={styles.label}>Monto par</Text>
          <CustomNumericField
            placeholder="0"
            value={inputs.cantidadPar}
            error={errors.cantidadPar}
            onChange={text => modalInputs.handleOnchange('cantidadPar', text)}
            maxLength={3}
            hideErrorMessage
            width={50}
            marginX={10}
          />
        </View>
      )}
      <CustomSwitch
        label="Fijar cantidades"
        value={modalInputs.cantidadFija}
        onChange={() =>
          modalInputs.handleFijarCantidad(!modalInputs.cantidadFija)
        }
      />
      <CustomSwitch
        label="Candado"
        value={modalInputs.candado}
        onChange={() => modalInputs.toggleCandado()}
      />
    </View>
  );
};

const CustomSwitch = ({label, value, onChange}) => {
  return (
    <View style={styles.modalRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
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
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  label: {color: '#000', fontWeight: 'bold'},
});
