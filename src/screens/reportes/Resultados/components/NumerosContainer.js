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
        {backgroundColor: loadingContent ? '#F1F5F9' : '#0E1321'},
      ]}>
      <View
        style={[
          styles.imgBox,
          {backgroundColor: loadingContent ? '#E2E8F0' : '#FFFFFF'},
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
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  imgBox: {
    width: '85%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  img: {
    width: '100%',
    height: '100%',
    maxHeight: 120,
  },
});
