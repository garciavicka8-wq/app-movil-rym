import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  View,
  Text,
  ScrollView,
} from 'react-native';
import {Colors} from '../utils';

export const Table = ({children}) => {
  return <View style={styles.table}>{children}</View>;
};

export const TableHeader = ({children, borderColor = Colors.primary}) => {
  return (
    <View style={[styles.tableRow, {borderBottomColor: borderColor}]}>
      {children}
    </View>
  );
};

export const TableBody = ({
  children,
  scrollable = false,
  paddingBottom = 240,
}) => {
  if (scrollable) {
    return (
      <View style={{paddingBottom: paddingBottom}}>
        <ScrollView>{children}</ScrollView>
      </View>
    );
  }
  return <View>{children}</View>;
};

export const TableRow = ({children, onPress, onLongPress}) => {
  let [animationOpacity] = useState(new Animated.Value(1));

  const startAnimation = () => {
    Animated.sequence([
      Animated.timing(animationOpacity, {
        toValue: 0.1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(animationOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onPress();
    });
  };

  let estiloAnimacion = {
    opacity: animationOpacity,
  };

  const handleOnpress = () => {
    startAnimation();
  };

  if (onPress && onLongPress) {
    return (
      <TouchableWithoutFeedback
        onPress={handleOnpress}
        onLongPress={onLongPress}>
        <Animated.View style={[styles.tableRow, estiloAnimacion]}>
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
  return <View style={[styles.tableRow]}>{children}</View>;
};

export const TableCell = ({text, color = '#000'}) => {
  return (
    <View style={styles.tableCell}>
      <Text style={[styles.cellText, {color: color}]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    marginHorizontal: '2.5%',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 2,
    justifyContent: 'space-between',
    borderBottomColor: 'gray',
    paddingVertical: 15,
  },
  tableCell: {
    width: '25%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 18,
  },
});
