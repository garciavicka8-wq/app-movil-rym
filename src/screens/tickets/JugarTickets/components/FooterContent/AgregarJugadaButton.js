import React, {useEffect, useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {IconButton, RadioButton, Switch} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {CustomModal, CustomNumericField} from '../../../../../components';
import {
  agregarJugadaStore,
  setJugadas,
} from '../../../../../features/tickets/jugarTickets/jugarTicketsSlice';
import {useModal, useModalInputs} from '../../../../../hooks';
import {Colors, Utils, uuid} from '../../../../../utils';

export default function AgregarJugadaButton() {
  const {sorteoSeleccionado, jugadas} = useSelector(
    state => state.jugarTickets,
  );
  const modal = useModal();
  const modalInputs = useModalInputs();
  const dispatch = useDispatch();
  const apuestaInputRef = useRef(null);
  const [agregandoJugadas, setAgregandoJugadas] = useState(false);
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
    if (agregandoJugadas) return;
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
    const {validInputs, data, conPar, inputs, candado, automaticoConfig} =
      modalInputs;
    // VALIDAMOS LOS CAMPOS
    if (
      validInputs() &&
      data &&
      hasIntegers(data.lugares) &&
      !automaticoConfig.active
    ) {
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
    // PARA AUTOMATICO
    if (automaticoConfig.active) {
      handleRegistrarAutomatico();
    }
  };
  // HANDLE REGISTRAR TICKET AUTOMATICO
  const handleRegistrarAutomatico = () => {
    const {automaticoConfig} = modalInputs;
    const lugares = automaticoConfig.lugares;
    const automaticoLugares = lugares
      ? Object.values(lugares).reduce((acc, curr) => acc + Number(curr), 0)
      : 0;

    if (automaticoLugares > 0) {
      if (agregandoJugadas) return;
      setAgregandoJugadas(true);
      const automaticoLugaresArr = obtenerAutomaticoLugares(lugares);
      const EXES = {
        tres: 'XXX',
        dos: 'XX',
        una: 'X',
      };
      let jugadasAutomaticas = [];
      for (let i = 0; i < automaticoConfig.numeroJugadas; i++) {
        jugadasAutomaticas.push({
          id: uuid(),
          numero: EXES[automaticoConfig.cifras],
          lugares: automaticoLugaresArr,
          totalApostado: automaticoLugaresArr.reduce(
            (acc, cantidad) => acc + parseInt(cantidad),
            0,
          ),
        });
      }

      dispatch(setJugadas(jugadasAutomaticas));

      modalInputs.handleReset();
      handleModalCancel();
      setAgregandoJugadas(false);
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
    const jugadaNueva = {
      id: uuid(),
      numero: numero,
      lugares: lugares,
      totalApostado: lugares.reduce(
        (acc, cantidad) => acc + parseInt(cantidad),
        0,
      ),
    };
    // SI HAY JUGADAS AUTOMATICAS ALMACENADAS
    if (jugadas.some(item => item.numero.includes('X'))) {
      dispatch(setJugadas([jugadaNueva]));
      return;
    }
    dispatch(agregarJugadaStore(jugadaNueva));
  };

  const obtenerAutomaticoLugares = lugares => {
    const propNames = {
      1: ['primero'],
      2: ['primero', 'segundo'],
      3: ['primero', 'segundo', 'tercero'],
    };
    return propNames[sorteoSeleccionado.numLugares].map(
      key => lugares[key]?.toString() || '0',
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
        confirmButtonText={modal.config.confirmBtnText}
        showConfirmBtn={modal.config.showConfirmBtn}
        showCloseBtn={true}
        onClose={handleModalCancel}
        onAccept={handleModalAccept}>
        {modal.config.contentType === 'agregar' && (
          <>
            {!modalInputs.automaticoConfig.active && (
              <ModalAgregarContent
                modalInputs={modalInputs}
                sorteo={sorteoSeleccionado}
                apuestaInputRef={apuestaInputRef}
              />
            )}
            {modalInputs.automaticoConfig.active && (
              <ModalAgregarContentAutomatico
                sorteo={sorteoSeleccionado}
                modalInputs={modalInputs}
              />
            )}
          </>
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
      <CustomSwitch
        label="Automático"
        value={modalInputs.automaticoConfig.active}
        onChange={() => modalInputs.toggleAutomatico()}
      />
    </View>
  );
};

function ModalAgregarContentAutomatico({sorteo, modalInputs}) {
  const handleJugadasChange = value => {
    modalInputs.handleAutomaticoConfig('numeroJugadas', value);
  };

  const handleLugaresChange = value => {
    modalInputs.handleAutomaticoConfig('lugares', value);
  };

  const handleCifrasChange = value => {
    modalInputs.handleAutomaticoConfig('cifras', value);
  };

  return (
    <>
      {/* CIFRAS */}
      <RadioButtonsCifras onChange={handleCifrasChange} />
      {/* JUGADAS */}
      <Text style={{fontWeight: 'bold'}}>Elige el número de jugadas</Text>
      <CustomCounter
        text="Jugadas"
        maxValue={10}
        onChange={handleJugadasChange}
      />
      {/* LUGARES */}
      <LugaresInputs
        numLugares={sorteo.numLugares}
        onChange={handleLugaresChange}
      />
      <View style={{marginTop: 20}}>
        <CustomSwitch
          label="Automático"
          value={modalInputs.automaticoConfig.active}
          onChange={() => modalInputs.toggleAutomatico()}
        />
      </View>
    </>
  );
}

function RadioButtonsCifras({onChange}) {
  const [checked, setChecked] = useState('tres');

  const handleChange = value => {
    setChecked(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <>
      <Text style={{fontWeight: 'bold'}}>Elige las cifras</Text>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
        }}>
        <View style={{display: 'flex', alignItems: 'center'}}>
          <RadioButton
            value="tres"
            status={checked === 'tres' ? 'checked' : 'unchecked'}
            onPress={() => handleChange('tres')}
          />
          <Text>Tres</Text>
        </View>
        <View style={{display: 'flex', alignItems: 'center'}}>
          <RadioButton
            value="dos"
            status={checked === 'dos' ? 'checked' : 'unchecked'}
            onPress={() => handleChange('dos')}
          />
          <Text>Dos</Text>
        </View>
        <View style={{display: 'flex', alignItems: 'center'}}>
          <RadioButton
            value="una"
            status={checked === 'una' ? 'checked' : 'unchecked'}
            onPress={() => handleChange('una')}
          />
          <Text>Una</Text>
        </View>
      </View>
    </>
  );
}

function CustomCounter({
  text,
  onChange,
  defaultValue = 1,
  minValue = 1,
  maxValue = 5,
}) {
  const [value, setValue] = useState(defaultValue);

  const changeValue = action => {
    if (action === 'increment' && value < maxValue) {
      setValue(prevState => prevState + 1);
      onChange(value + 1);
    }
    if (action === 'decrement' && value > minValue) {
      setValue(prevState => prevState - 1);
      onChange(value - 1);
    }
  };

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Text>{text}</Text>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <IconButton icon={'minus'} onPress={() => changeValue('decrement')} />
        <Text>{value}</Text>
        <IconButton icon={'plus'} onPress={() => changeValue('increment')} />
      </View>
    </View>
  );
}

function LugaresInputs({numLugares, onChange}) {
  const [lugares, setLugares] = useState({
    primero: '0',
    segundo: '0',
    tercero: '0',
  });

  const handleChange = (value, inputName) => {
    const newLugares = {
      ...lugares,
      [inputName]: value,
    };
    setLugares(newLugares);
    onChange(newLugares);
  };

  const maxValue = 200;

  return (
    <>
      <Text style={{fontWeight: 'bold'}}>Elige el monto</Text>
      {numLugares === 1 && (
        <CustomCounter
          text="Primero"
          defaultValue={0}
          minValue={0}
          maxValue={maxValue}
          onChange={val => handleChange(val, 'primero')}
        />
      )}
      {numLugares === 2 && (
        <>
          <CustomCounter
            text="Primero"
            defaultValue={0}
            minValue={0}
            maxValue={maxValue}
            onChange={val => handleChange(val, 'primero')}
          />
          <CustomCounter
            text="Segundo"
            defaultValue={0}
            minValue={0}
            maxValue={maxValue}
            onChange={val => handleChange(val, 'segundo')}
          />
        </>
      )}
      {numLugares === 3 && (
        <>
          <CustomCounter
            text="Primero"
            defaultValue={0}
            minValue={0}
            maxValue={maxValue}
            onChange={val => handleChange(val, 'primero')}
          />
          <CustomCounter
            text="Segundo"
            defaultValue={0}
            minValue={0}
            maxValue={maxValue}
            onChange={val => handleChange(val, 'segundo')}
          />
          <CustomCounter
            text="Tercero"
            defaultValue={0}
            minValue={0}
            maxValue={maxValue}
            onChange={val => handleChange(val, 'tercero')}
          />
        </>
      )}
    </>
  );
}

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
