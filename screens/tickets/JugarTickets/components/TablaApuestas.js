import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import globalStyles from '../../../../utils/Styles';
import Tabla from './Tabla';
import TablaLoading from './TablaLoading';

export default function TablaApuestas() {
  const [cargando, setCargando] = useState(true);
  const {cargandoProximosSorteos} = useSelector(state => state.jugarTickets);

  useEffect(() => {
    setCargando(cargandoProximosSorteos);
  }, [cargandoProximosSorteos]);

  const cargandoContenido = cargando || cargandoProximosSorteos;

  return (
    <View style={{flex: 1, marginTop: 15}}>
      <Text style={[globalStyles.sectionTitle, {marginHorizontal: '2.5%'}]}>
        Tabla
      </Text>
      {cargandoContenido && <TablaLoading />}
      {!cargandoContenido && <Tabla />}
    </View>
  );
}
