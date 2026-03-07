import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Surface} from 'react-native-paper';

const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Surface style={styles.card}>
      <Animated.View style={[styles.imagePlaceholder, {opacity}]} />
      <Animated.View style={[styles.datePlaceholder, {opacity}]} />
      <Animated.View style={[styles.amountPlaceholder, {opacity}]} />
    </Surface>
  );
};

export default function UltimosMovimientosSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  card: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#E1E9EE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  imagePlaceholder: {
    width: 100,
    height: 50,
    backgroundColor: '#CFD8DC',
    borderRadius: 4,
    marginBottom: 10,
  },
  datePlaceholder: {
    width: 80,
    height: 12,
    backgroundColor: '#CFD8DC',
    borderRadius: 4,
    marginBottom: 15,
  },
  amountPlaceholder: {
    width: 100,
    height: 25,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});
