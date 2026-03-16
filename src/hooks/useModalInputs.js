import {useEffect, useState} from 'react';

export default function useModalInputs() {
  const [inputs, setInputs] = useState({
    apuesta: '',
    primero: '',
    segundo: '',
    tercero: '',
    cantidadPar: '',
  });

  const [errors, setErrors] = useState({
    apuesta: false,
    primero: false,
    segundo: false,
    tercero: false,
    cantidadPar: false,
  });

  const [cantidadFija, setCantidadFija] = useState(false);
  const [conPar, setConPar] = useState(false);
  const [candado, setCandado] = useState(false);
  const [automaticoConfig, setAutomaticoConfig] = useState({
    active: false,
    cifras: 'tres',
    numeroJugadas: 1,
    lugares: null,
  });

  const [numPlaces, setNumPlaces] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    fillData();
  }, [inputs, numPlaces]);

  const handleOnchange = (inputName, text) => {
    const _text = text.trim();
    setErrors(prevState => ({
      ...prevState,
      primero: false,
      segundo: false,
      tercero: false,
      [inputName]: isValueInvalid(_text, inputName),
    }));
    setInputs(prevState => ({
      ...prevState,
      [inputName]: _text,
    }));
  };

  const setInputValue = (inputName, text) => {
    const _text = text.trim();
    setErrors(prevState => ({
      ...prevState,
      primero: false,
      segundo: false,
      tercero: false,
      [inputName]: isValueInvalid(_text, inputName),
    }));
    setInputs(prevState => ({
      ...prevState,
      [inputName]: _text,
    }));
  };

  const isValueInvalid = (value, inputName) => {
    // SI ES EL INPUT APUESTA
    if (inputName === 'apuesta') {
      return (
        value === '' ||
        value.indexOf('.') !== -1 ||
        value.indexOf(',') !== -1 ||
        value.indexOf('-') !== -1
      );
    }
    // SI ES DIFERENTE A APUESTA
    return (
      parseFloat(value) === 0 ||
      value.indexOf('.') !== -1 ||
      value.indexOf(',') !== -1 ||
      value.indexOf('-') !== -1
    );
  };

  const handleReset = () => {
    // SI CANTIDAD FIJA ES FALSE Y CON EL PAR ES FALSE
    setInputs({
      apuesta: '',
      primero: '',
      segundo: '',
      tercero: '',
      cantidadPar: '',
    });
    setErrors({
      apuesta: true,
      primero: false,
      segundo: false,
      tercero: false,
      cantidadPar: false,
    });
    setData(null);
    setConPar(false);
    setCantidadFija(false);
    setCandado(false);
    setAutomaticoConfig({
      active: false,
      cifras: 'tres',
      numeroJugadas: 1,
      lugares: null,
    });
  };

  const clearValue = inputName => {
    setInputs(prevState => ({
      ...prevState,
      [inputName]: '',
    }));
    setErrors(prevState => ({
      ...prevState,
      [inputName]: true,
    }));
    setData(null);
  };

  const validInputs = () => {
    // Validar si hay errores en cantidadPar
    if (errors.cantidadPar) {
      return false;
    }

    // Verificar las condiciones comunes
    const noErrors = !errors.apuesta && !errors.primero;
    const inputsFilled =
      inputs.primero.length > 0 ||
      inputs.segundo?.length > 0 ||
      inputs.tercero?.length > 0;

    if (noErrors && inputsFilled) {
      // Prepara los valores de 'primero', 'segundo', 'tercero' asegurando que no sean vacíos
      const updatedInputs = {
        primero: inputs.primero || '0',
        segundo: inputs.segundo || '0',
        tercero: inputs.tercero || '0',
      };

      // Actualiza el estado de inputs
      setInputs(prevState => ({
        ...prevState,
        ...updatedInputs,
      }));

      // Configura los datos basados en el número de lugares
      const lugares = [
        removeLeadingZero(updatedInputs.primero),
        numPlaces > 1 ? removeLeadingZero(updatedInputs.segundo) : undefined,
        numPlaces > 2 ? removeLeadingZero(updatedInputs.tercero) : undefined,
      ].filter(Boolean); // Filtrar valores `undefined`

      setData({
        numero: inputs.apuesta,
        lugares,
      });

      return true;
    }

    return false;
  };

  const fillData = () => {
    const sanitizedInputs = ['primero', 'segundo', 'tercero'].reduce(
      (acc, key) => {
        acc[key] = inputs[key] === '' ? '0' : removeLeadingZero(inputs[key]);
        return acc;
      },
      {},
    );

    const noErrors =
      !errors.apuesta && !errors.primero && !errors.segundo && !errors.tercero;

    if (noErrors) {
      const lugares = [
        sanitizedInputs.primero,
        numPlaces > 1 ? sanitizedInputs.segundo : undefined,
        numPlaces > 2 ? sanitizedInputs.tercero : undefined,
      ].filter(Boolean); // Eliminar valores `undefined`

      setData({
        numero: inputs.apuesta,
        lugares,
      });
    }
  };

  const handleFijarCantidad = fijarCantidad => {
    setCantidadFija(fijarCantidad);
  };

  const handleConPar = value => {
    setConPar(value);
    setCandado(false);
  };

  const removeLeadingZero = value => {
    return parseInt(value).toString();
  };

  const toggleCandado = () => {
    setCandado(prevState => !prevState);
    setConPar(false);
    setInputs(prevState => ({
      ...prevState,
      cantidadPar: '',
    }));
  };

  const toggleAutomatico = () => {
    setAutomaticoConfig(prevState => ({
      ...prevState,
      active: !prevState.active,
    }));
  };

  const handleAutomaticoConfig = (propName, value) => {
    setAutomaticoConfig(prevState => ({
      ...prevState,
      [propName]: value,
    }));
  };

  return {
    inputs,
    errors,
    handleOnchange,
    handleReset,
    setInputValue,
    setNumPlaces,
    validInputs,
    data,
    handleFijarCantidad,
    cantidadFija,
    conPar,
    handleConPar,
    clearValue,
    toggleCandado,
    candado,
    automaticoConfig,
    handleAutomaticoConfig,
    toggleAutomatico,
  };
}
