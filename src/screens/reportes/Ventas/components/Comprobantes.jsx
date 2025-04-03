import React, {useEffect, useState} from 'react';
import ReportarDepositoButton from './ReportarDepositoButton';
import {Storage} from '../../../../utils';
import Database from '../../../../database';
import {DATABASE_TABLES} from '../../../../constants';
import {List} from 'react-native-paper';

export default function Comprobantes() {
  const [usuario] = useState(Storage.getUser());
  const [comprobantes, setComprobantes] = useState([]);

  useEffect(() => {
    loadComprobantes();
  }, []);

  const loadComprobantes = async () => {
    try {
      const data = await Database.getItemsByProp(
        DATABASE_TABLES.VOUCHERS,
        'numeroUsuario',
        usuario.usuario,
      );
      const ordered = data
        .slice()
        .sort((a, b) => new Date(b['fecha']) - new Date(a['fecha']))
        .slice(0, 3);
      setComprobantes(ordered);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar los comprobantes');
    }
  };

  return (
    <>
      {/* REPORTAR DESPOSITO BUTTON */}
      <ReportarDepositoButton />
      {/* COMPROBANTES */}
      {comprobantes.length > 0 &&
        comprobantes.map((item, index) => (
          <List.Item
            key={index}
            title={item?.visto ? 'Revisada' : 'En revisión'}
            description={`Capturada el ${item.fecha}`}
            left={props => <List.Icon {...props} icon="image" />}
          />
        ))}
    </>
  );
}
