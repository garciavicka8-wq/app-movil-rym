import React, {useState, useEffect, useRef} from 'react';
import {Linking, Text, View} from 'react-native';
import {Container, Content} from '../../../components/Layout';
import DetallesHeader from './components/DetallesHeader';
import Detalles from './components/Detalles';
import Acciones from './components/Acciones';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {useDispatch, useSelector} from 'react-redux';
import {getStatusRequest} from '../../../services/taecel';
import Database from '../../../database';
import {DATABASE_TABLES, TRANSACTION_STATES, TXN} from '../../../constants';
import {
  setTransaccionStore,
  setTransacciones,
  setUltimasTransacciones,
} from '../../../features/taecel/taecelSlice';
import {Colors, Helpers, Moment} from '../../../utils';
import NoConnection from '../../../components/NoConnection';
import {useNetInfo} from '@react-native-community/netinfo';
import {Button} from 'react-native-paper';
import {captureRef} from 'react-native-view-shot';
import Share from 'react-native-share';
import {useCredito} from '../../../hooks';

export default function DetalleTransaccion() {
  const {transaccionStore, transacciones} = useSelector(state => state.taecel);
  const [cargando, setCargando] = useState(true);
  const [compartirWABtnClicked, setCompartirWABtnClicked] = useState(false);
  const dispatch = useDispatch();
  const netInfo = useNetInfo();
  const imageRef = useRef();
  const [isTxnProcessed, setIsTxnProcessed] = useState(false);
  const {restarCredito} = useCredito();

  useEffect(() => {
    // VERIFICAR CONEXION
    if (netInfo?.isConnected) {
      if (transaccionStore.Status == 'PROCESSING') {
        actualizarTransaccion();
      }
      if (transaccionStore.Status !== 'PROCESSING') {
        cargarTransaccionDB();
      }
    }
  }, [netInfo?.isConnected]);

  const actualizarTransaccion = async () => {
    try {
      setCargando(true);
      // console.log(transaccionStore);
      const tempTransaction = await Database.getItemByKey(
        DATABASE_TABLES.TRANSACCIONES,
        transaccionStore.key,
      );
      if (tempTransaction) {
        const statusRequest = await getStatusRequest(transaccionStore.TransID);
        const newTransaction = {
          ...statusRequest.transaccion,
          CategoriaID: tempTransaction.CategoriaID,
          _usuario: tempTransaction._usuario,
          _fecha: Moment(statusRequest.transaccion.Fecha).format('YYYY-MM-DD'),
          _hora: Moment(statusRequest.transaccion.Fecha).format('HH:mm:ss'),
          descripcionProducto: tempTransaction.descripcionProducto,
          // SE APLICA SOLO PARA RECARGAS
          _comisionRecargas: tempTransaction._comisionRecargas,
          _comisionRecargasFecha: tempTransaction._comisionRecargasFecha,
        };

        setIsTxnProcessed(newTransaction.Status !== TXN.STATES.PROCESSING);
        //  UPDATE TRANSACCION
        await Database.save(
          DATABASE_TABLES.TRANSACCIONES,
          newTransaction,
          tempTransaction.key,
        );
        // UPDATE TRANSACTIONS AND LAST TRANSACTIONS LIST
        dispatch(
          setTransacciones(prevState =>
            prevState.map(txn => {
              if (txn.key === tempTransaction.key) {
                return {...newTransaction};
              }
              return txn;
            }),
          ),
        );
        // UPDATE LAST TRANSACTIONS LIST
        dispatch(
          setUltimasTransacciones(prevState =>
            prevState.map(txn => {
              if (txn.key === tempTransaction.key) {
                return {...newTransaction};
              }
              return txn;
            }),
          ),
        );
        // UPDATE TRANSACTION STORE
        dispatch(setTransaccionStore(newTransaction));
        // SI LA TRANSACCION ES EXITOSA ACTUALIZAMOS EL CREDITO
        if (newTransaction.Status === TXN.STATES.SUCCESS) {
          const montoTransaccion = Helpers.calcularTotalTransaccion(
            newTransaction,
            newTransaction.CategoriaID,
          );
          await restarCredito(montoTransaccion);
        }
      }
      setCargando(false);
    } catch ({message}) {
      alert(message);
    }
  };

  const cargarTransaccionDB = async () => {
    try {
      // console.log(transaccionStore);
      setCargando(true);
      const txn = await Database.getItem(
        DATABASE_TABLES.TRANSACCIONES,
        'TransID',
        transaccionStore.TransID,
      );
      dispatch(setTransaccionStore(txn));
      setIsTxnProcessed(true);
      setCargando(false);
    } catch ({message}) {
      console.log(message);
    }
  };

  const handleShare = async () => {
    try {
      if (!compartirWABtnClicked) {
        setCompartirWABtnClicked(true);
        const canOpenUrl = await Linking.canOpenURL(
          `whatsapp://send?text=&phone=`,
        );
        if (canOpenUrl) {
          const uri = await captureRef(imageRef);
          await Share.open({url: uri});
        }
        setCompartirWABtnClicked(false);
      }
    } catch ({message}) {
      console.log(message);
      setCompartirWABtnClicked(false);
    }
  };

  if (!netInfo?.isConnected) return <NoConnection />;

  if (cargando) return <LoadingIndicator />;

  if (!cargando && !isTxnProcessed)
    return (
      <View
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginHorizontal: '2.5%',
        }}>
        <Text style={{fontSize: 18, marginBottom: 20, textAlign: 'center'}}>
          La transacción no ha sido procesada, intente de nuevo más tarde
        </Text>
        <Button
          mode="contained"
          buttonColor={Colors.blue}
          uppercase
          icon={'reload'}
          onPress={() => {
            if (cargando) return;
            actualizarTransaccion();
          }}>
          Volver a intentar
        </Button>
      </View>
    );

  return (
    <Container bgColor="#fff">
      <Content marginBottom={0}>
        <View collapsable={false} style={{backgroundColor: '#fff'}}>
          <DetallesHeader />
          <Detalles sharedBtnClicked={false} />
        </View>
        {/* PRINTABLE VIEW ONLY */}
        <View
          ref={imageRef}
          collapsable={false}
          style={{backgroundColor: '#fff', position: 'absolute', left: 500}}>
          <DetallesHeader />
          <Detalles sharedBtnClicked={compartirWABtnClicked} />
        </View>
        {/* PRINTABLE VIEW ONLY */}
        <Acciones
          shareWhatsappBtn={
            <Button
              mode="contained"
              buttonColor={Colors.green}
              uppercase
              onPress={handleShare}>
              Whatsapp
            </Button>
          }
        />
      </Content>
    </Container>
  );
}
