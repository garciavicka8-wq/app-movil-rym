import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {Colors} from '../../../../../utils';
import AgregarJugadaButton from './AgregarJugadaButton';
import CompartirButton from './CompartirButton';
import WhatsappBtn from './WhatsappBtn';
import {Col, Grid, Row} from 'react-native-easy-grid';

export default function FooterBar() {
  const [cargando, setCargando] = useState(true);
  const {cargandoProximosSorteos} = useSelector(state => state.jugarTickets);

  useEffect(() => {
    setCargando(cargandoProximosSorteos);
  }, [cargandoProximosSorteos]);

  const contentLoading = cargando || cargandoProximosSorteos;

  return (
    <>
      {contentLoading && <FooterBarLoading />}
      {!contentLoading && <CustomFooterTab />}
    </>
  );
}

const FooterBarLoading = () => {
  return (
    <>
      <View style={styles.totalLoading}></View>
      <View style={styles.buttonLoading}></View>
      <View style={styles.buttonLoading}></View>
    </>
  );
};

const CustomFooterTab = () => {
  const [cantidades, setCantidades] = useState([]);
  const {jugadas, sorteoSeleccionado} = useSelector(
    state => state.jugarTickets,
  );
  useEffect(() => {
    let _cantidades = [];
    jugadas.forEach(j => {
      j.lugares.forEach(l => {
        _cantidades.push(l);
      });
    });
    setCantidades(_cantidades);
  }, [jugadas]);

  const total = cantidades.reduce(
    (acc, cantidad) => acc + parseInt(cantidad),
    0,
  );

  if (!sorteoSeleccionado) {
    return null;
  }

  return (
    <Grid>
      <Row>
        <Col
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}>
          <View style={styles.total}>
            <Text style={styles.totalText}>Total: {total} Pts</Text>
            <Text style={styles.totalBadge}>{jugadas.length}</Text>
          </View>
        </Col>
        <Col
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <AgregarJugadaButton />
          <CompartirButton />
          <WhatsappBtn />
        </Col>
      </Row>
    </Grid>
  );
};

const styles = StyleSheet.create({
  totalLoading: {
    borderRadius: 20,
    backgroundColor: '#eee',
    width: 200,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  buttonLoading: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  total: {
    borderRadius: 20,
    backgroundColor: Colors.primary,
    width: 160,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    fontWeight: 'bold',
  },
  totalBadge: {
    color: Colors.primary,
    fontSize: 16,
    borderRadius: 50,
    width: 25,
    height: 25,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  totalText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});
