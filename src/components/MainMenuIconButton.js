import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Animated,
} from 'react-native';
import {IconButton} from 'react-native-paper';

export default function MainMenuIconButton({
  buttonColor = 'gray',
  icon = 'progress-question',
  iconColor = '#000',
  textColor = '#000',
  size = 130,
  empty = false,
  progress = false,
  text = '',
  onPress,
  fullwidth = false,
}) {
  const [scaleValue, setScaleValue] = useState(new Animated.Value(1));

  const animateButton = () => {
    const duration = 100;
    Animated.timing(scaleValue, {
      toValue: 0.8,
      duration: duration,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start(() => {
        if (onPress) {
          onPress();
        }
      });
    });
  };
  // SI ESTA EMPTY
  if (empty) {
    return <View style={[styles.button, {width: size, height: size}]}></View>;
  }

  // SI ESTA EN PROGRESS
  if (progress) {
    return (
      <View
        style={[
          styles.button,
          {width: size, height: size, backgroundColor: '#E7E7E7'},
        ]}></View>
    );
  }

  const handlePress = () => {
    animateButton();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: buttonColor,
            width: fullwidth ? size * 2 : size,
            height: size,
            transform: [{scale: scaleValue}],
          },
        ]}>
        <IconButton
          icon={icon}
          size={52}
          iconColor={iconColor}
          style={{
            borderRadius: 0,
            margin: 0,
          }}
        />
        <Text style={{color: textColor, fontWeight: 'bold', fontSize: 14}}>
          {text}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
});
