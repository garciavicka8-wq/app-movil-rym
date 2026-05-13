import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Money} from '../utils';
import {Card, IconButton} from 'react-native-paper';
import {useCredito} from '../hooks';
import {useSelector} from 'react-redux';

export default function CreditCard({
  title = 'CRÉDITO DISPONIBLE',
  backDropColor = 'transparent',
  cardColor = '#C72C33',
  iconBgColor = 'rgba(255,255,255,0.2)',
}) {
  const {cargandoCredito, creditoDisponible, fechaCredito, mostrarCredito} =
    useSelector(state => state.credito);
  const {obtenerCreditoApi} = useCredito();

  const handlePress = () => {
    if (!cargandoCredito) {
      obtenerCreditoApi();
    }
  };

  return (
    <View style={styles.container}>
      {backDropColor !== 'transparent' && (
        <View style={[styles.roundedBox, {backgroundColor: backDropColor}]}></View>
      )}
      <View style={[styles.cardBox, backDropColor === 'transparent' ? styles.cardBoxRelative : null]}>
        <Card style={[styles.card, {backgroundColor: cardColor}]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitleText}>{title}</Text>
            <IconButton
              disabled={cargandoCredito}
              icon={mostrarCredito ? 'eye-off' : 'eye'}
              iconColor="#fff"
              style={[styles.eyeIcon, {backgroundColor: iconBgColor}]}
              size={20}
              onPress={handlePress}
            />
          </View>
          <Card.Content style={styles.cardContent}>
            {mostrarCredito ? (
              <Text style={styles.amount}>
                {cargandoCredito ? (
                  <Text style={styles.loadingText}>cargando...</Text>
                ) : (
                  Money(creditoDisponible, false)
                )}
              </Text>
            ) : (
              <SecretAmount />
            )}
            <Text style={styles.date}>
              {fechaCredito ? `Actualizado: ${fechaCredito}` : 'Actualizado: --/--/----'}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

function SecretAmount() {
  return (
    <View style={styles.secretContainer}>
      <Text style={styles.amountSymbol}>$</Text>
      <View style={styles.circle}></View>
      <View style={styles.circle}></View>
      <View style={styles.circle}></View>
      <View style={styles.circle}></View>
      <View style={styles.circle}></View>
      <View style={styles.circle}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  roundedBox: {
    width: '100%',
    height: 100,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardBox: {
    width: '100%',
    padding: 15,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardBoxRelative: {
    position: 'relative',
    marginTop: 10,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#C72C33',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
  },
  cardTitleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  eyeIcon: {
    margin: 0,
  },
  cardContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  amount: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loadingText: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    fontSize: 20,
  },
  date: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  amountSymbol: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 34,
    fontWeight: 'bold',
    marginRight: 10,
  },
  circle: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginRight: 8,
  },
});
