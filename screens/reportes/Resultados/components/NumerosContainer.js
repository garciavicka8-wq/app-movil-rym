import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Colors, Helpers} from '../../../../utils';

export default function NumerosContainer() {
  const {cargandoSorteosJugados, cargandoPublicacion, publicacion} =
    useSelector(state => state.ganadores);

  const loadingContent = cargandoSorteosJugados || cargandoPublicacion;

  return (
    <View
      style={[
        styles.ribbon,
        {backgroundColor: loadingContent ? '#eee' : Colors.purple},
      ]}>
      <View
        style={[
          styles.imgBox,
          {backgroundColor: loadingContent ? '#c2c2c2' : '#fff'},
        ]}>
        {!loadingContent && publicacion && (
          <Image
            resizeMode="contain"
            style={styles.img}
            source={{uri: Helpers.urlImage(publicacion.codigoSorteo)}}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imgBox: {
    width: 300,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopEndRadius: 20,
  },
  img: {
    width: 200,
    height: 200,
  },
});
