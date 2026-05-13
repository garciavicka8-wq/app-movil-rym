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
    <View style={[styles.tableRow, styles.headerBackground, {borderBottomColor: borderColor}]}>
      {children}
    </View>
  );
};

export const TableBody = ({
  children,
  scrollable = false,
  paddingBottom = 10,
}) => {
  if (scrollable) {
    return (
      <ScrollView 
        style={{flex: 1}} 
        contentContainerStyle={{flexGrow: 1, paddingBottom: paddingBottom}}
      >
        {children}
      </ScrollView>
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

export const TableCell = ({text, color = '#1E293B'}) => {
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
    borderBottomColor: '#F1F5F9',
    paddingVertical: 15,
    minHeight: 50,
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerBackground: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
