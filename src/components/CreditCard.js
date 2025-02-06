import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Money} from '../utils';
import {Card, IconButton} from 'react-native-paper';
import {useCredito} from '../hooks';
import {useSelector} from 'react-redux';

export default function CreditCard({
  title = 'CREDITO DISPONIBLE',
  backDropColor = 'gray',
  cardColor = '#000',
  iconBgColor,
}) {
  const {cargandoCredito, creditoDisponible, fechaCredito, mostrarCredito} =
    useSelector(state => state.credito);
  const {obtenerCredito} = useCredito();

  const handlePress = () => {
    if (!cargandoCredito) {
      obtenerCredito();
    }
  };

  return (
    <View
      style={{
        position: 'relative',
        minHeight: 200,
      }}>
      <View
        style={[styles.roundedBox, {backgroundColor: backDropColor}]}></View>
      <View style={styles.cardBox}>
        <Card style={[styles.card, {backgroundColor: cardColor}]}>
          <Card.Title
            style={styles.cardTitle}
            title={<Text style={styles.cardTitleText}>{title}</Text>}
          />
          <Card.Content>
            {mostrarCredito && (
              <>
                <Text style={styles.amount}>
                  {cargandoCredito ? (
                    <Text
                      style={{
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                        fontSize: 16,
                      }}>
                      cargando...
                    </Text>
                  ) : (
                    Money(creditoDisponible, false)
                  )}
                </Text>
              </>
            )}
            {!mostrarCredito && <SecretAmount />}
            <View style={styles.footer}>
              <Text style={styles.date}>{fechaCredito}</Text>
              <IconButton
                disabled={cargandoCredito}
                icon="eye"
                iconColor="#fff"
                style={{backgroundColor: iconBgColor}}
                size={20}
                onPress={handlePress}
              />
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

function SecretAmount() {
  return (
    <View
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}>
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
  roundedBox: {
    width: '100%',
    height: 100,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  cardBox: {
    width: '100%',
    padding: 15,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  card: {
    width: '100%',
    borderRadius: 20,
  },
  cardTitle: {
    marginTop: 10,
  },
  cardTitleText: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '700',
  },
  amount: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '700',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
  },
  circle: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 50,
    marginRight: 5,
    marginVertical: 8.5,
  },
});
