import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {Linking, Text, View, StyleSheet, ScrollView} from 'react-native';
import {Appbar, Button} from 'react-native-paper';
import {Container} from '../../../components/Layout';
import DetallesHeader from './components/DetallesHeader';
import Detalles from './components/Detalles';
import Acciones from './components/Acciones';
import LoadingIndicator from '../../../components/LoadingIndicator';
import {useDispatch, useSelector} from 'react-redux';
import {actualizarTransaccionApi} from '../../../services/taecel';
import {
  setTransaccionStore,
  setTransacciones,
  setUltimasTransacciones,
} from '../../../features/taecel/taecelSlice';
import {Colors} from '../../../utils';
import NoConnection from '../../../components/NoConnection';
import {useNetInfo} from '@react-native-community/netinfo';
import {captureRef} from 'react-native-view-shot';
import Share from 'react-native-share';
import {useCredito, useCustomNavigation} from '../../../hooks';
import CustomStatusBar from '../../../components/CustomStatusBar';

export default function DetalleTransaccion({navigation}) {
  const {transaccionStore} = useSelector(state => state.taecel);
  const [cargando, setCargando] = useState(true);
  const [compartirWABtnClicked, setCompartirWABtnClicked] = useState(false);
  const dispatch = useDispatch();
  const netInfo = useNetInfo();
  const imageRef = useRef();
  const [isTxnProcessed, setIsTxnProcessed] = useState(false);
  const {restarCredito} = useCredito();
  const {isFocused} = useCustomNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (netInfo?.isConnected) {
      if (transaccionStore.Status == 'PROCESSING') {
        actualizarTransaccion();
      } else {
        setIsTxnProcessed(true);
        setCargando(false);
      }
    }
  }, [netInfo?.isConnected]);

  const actualizarTransaccion = async () => {
    try {
      setCargando(true);
      const data = await actualizarTransaccionApi(transaccionStore.TransID);
      const newTransaction = data.transaccion;

      setIsTxnProcessed(data.status !== 'PROCESSING');

      dispatch(
        setTransacciones(prevState =>
          prevState.map(txn =>
            txn.TransID === newTransaction.TransID ? {...newTransaction} : txn,
          ),
        ),
      );
      dispatch(
        setUltimasTransacciones(prevState =>
          prevState.map(txn =>
            txn.TransID === newTransaction.TransID ? {...newTransaction} : txn,
          ),
        ),
      );
      dispatch(setTransaccionStore(newTransaction));

      if (data.status === 'SUCCESS') {
        await restarCredito();
      }
      setCargando(false);
    } catch ({message}) {
      alert(message);
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
      <View style={styles.errorContainer}>
        <CustomStatusBar color="darkBackground" />
        <Text style={styles.errorText}>
          La transacción no ha sido procesada, intente de nuevo más tarde
        </Text>
        <Button
          mode="contained"
          buttonColor={Colors.primary}
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
    <Container bgColor={Colors.lightBackground}>
      {isFocused && <CustomStatusBar color="darkBackground" />}
      
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content 
          color="white" 
          titleStyle={styles.appBarTitle} 
          title="Detalle de Transacción" 
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.receiptCard}>
          <DetallesHeader />
          <View style={styles.divider} />
          <Detalles sharedBtnClicked={false} />
        </View>

        <View style={styles.actionsContainer}>
          <Acciones
            shareWhatsappBtn={
              <Button
                mode="contained"
                buttonColor="#25D366"
                uppercase
                style={styles.actionButton}
                labelStyle={styles.actionButtonLabel}
                onPress={handleShare}>
                Whatsapp
              </Button>
            }
          />
        </View>

        {/* PRINTABLE VIEW ONLY (Hidden) */}
        <View
          ref={imageRef}
          collapsable={false}
          style={styles.printableView}>
          <View style={{padding: 20}}>
            <DetallesHeader />
            <View style={[styles.divider, {marginVertical: 15}]} />
            <Detalles sharedBtnClicked={compartirWABtnClicked} />
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#0E1321',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 30,
    elevation: 4,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 25,
    marginHorizontal: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  actionButtonLabel: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.lightBackground,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  printableView: {
    backgroundColor: '#fff',
    position: 'absolute',
    left: -2000, // Move far away instead of 500 to be safer
    width: 400,
  }
});
