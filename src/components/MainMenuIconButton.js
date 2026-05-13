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
  buttonColor = '#EFF6FF',
  icon = 'progress-question',
  iconColor = '#000',
  textColor = '#1E293B',
  size = 110,
  empty = false,
  progress = false,
  text = '',
  onPress,
  fullwidth = false,
}) {
  const [scaleValue] = useState(new Animated.Value(1));

  const animateButton = () => {
    const duration = 100;
    Animated.timing(scaleValue, {
      toValue: 0.95,
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
    return <View style={[styles.emptyContainer, {width: fullwidth ? '96%' : '46%', height: size}]}></View>;
  }

  // SI ESTA EN PROGRESS
  if (progress) {
    return (
      <View
        style={[
          styles.progressContainer,
          {width: fullwidth ? '96%' : '46%', height: size},
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
          styles.cardContainer,
          {
            width: fullwidth ? '96%' : '46%',
            height: size,
            transform: [{scale: scaleValue}],
          },
        ]}>
        <View style={[styles.iconWrapper, {backgroundColor: buttonColor}]}>
          <IconButton
            icon={icon}
            size={36}
            iconColor={iconColor}
            style={{margin: 0}}
          />
        </View>
        <Text style={[styles.buttonText, {color: textColor}]}>
          {text}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: '2%',
    elevation: 2,
    shadowColor: '#CBD5E1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    padding: 10,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: 'transparent',
    marginVertical: 8,
    marginHorizontal: '2%',
  },
  progressContainer: {
    backgroundColor: '#F1F5F9', // Slate 100
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: '2%',
  },
});
