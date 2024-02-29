import {useEffect, useState} from 'react';

export function useModalInputs() {
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
    // VALIDAR CANTIDAD PAR SI ESTA ACTIVO
    if (errors.cantidadPar) {
      return false;
    }
    if (
      numPlaces === 1 &&
      !errors.apuesta &&
      !errors.primero &&
      inputs.primero.length > 0
    ) {
      setInputs(prevState => ({
        ...prevState,
        primero: inputs.primero,
      }));
      setData({
        numero: inputs.apuesta,
        lugares: [removeLeadingZero(inputs.primero)],
      });
      return true;
    }
    if (
      numPlaces === 2 &&
      !errors.apuesta &&
      !errors.primero &&
      !errors.segundo &&
      (inputs.primero.length > 0 || inputs.segundo.length > 0)
    ) {
      setInputs(prevState => ({
        ...prevState,
        primero: inputs.primero === '' ? '0' : inputs.primero,
        segundo: inputs.segundo === '' ? '0' : inputs.segundo,
      }));
      setData({
        numero: inputs.apuesta,
        lugares: [
          removeLeadingZero(inputs.primero),
          removeLeadingZero(inputs.segundo),
        ],
      });
      return true;
    }
    if (
      numPlaces === 3 &&
      !errors.apuesta &&
      !errors.primero &&
      !errors.segundo &&
      !errors.tercero &&
      (inputs.primero.length > 0 ||
        inputs.segundo.length > 0 ||
        inputs.tercero.length > 0)
    ) {
      setInputs(prevState => ({
        ...prevState,
        primero: inputs.primero === '' ? '0' : inputs.primero,
        segundo: inputs.segundo === '' ? '0' : inputs.segundo,
        tercero: inputs.tercero === '' ? '0' : inputs.tercero,
      }));
      setData({
        numero: inputs.apuesta,
        lugares: [
          removeLeadingZero(inputs.primero),
          removeLeadingZero(inputs.segundo),
          removeLeadingZero(inputs.tercero),
        ],
      });
      return true;
    }
    return false;
  };

  const fillData = () => {
    const _inputs = {
      primero: inputs.primero === '' ? '0' : removeLeadingZero(inputs.primero),
      segundo: inputs.segundo === '' ? '0' : removeLeadingZero(inputs.segundo),
      tercero: inputs.tercero === '' ? '0' : removeLeadingZero(inputs.tercero),
    };
    if (numPlaces === 1 && !errors.apuesta && !errors.primero) {
      setData({
        numero: inputs.apuesta,
        lugares: [_inputs.primero],
      });
      return;
    }
    if (
      numPlaces === 2 &&
      !errors.apuesta &&
      !errors.primero &&
      !errors.segundo
    ) {
      setData({
        numero: inputs.apuesta,
        lugares: [_inputs.primero, _inputs.segundo],
      });
      return;
    }
    if (
      numPlaces === 3 &&
      !errors.apuesta &&
      !errors.primero &&
      !errors.segundo &&
      !errors.tercero
    ) {
      setData({
        numero: inputs.apuesta,
        lugares: [_inputs.primero, _inputs.segundo, _inputs.tercero],
      });
      return;
    }
  };

  const handleFijarCantidad = fijarCantidad => {
    setCantidadFija(fijarCantidad);
  };

  const handleConPar = value => {
    setConPar(value);
  };

  const removeLeadingZero = value => {
    return parseInt(value).toString();
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
  };
}
