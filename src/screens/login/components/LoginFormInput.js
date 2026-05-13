import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {Colors} from '../../../utils';
import {IconButton} from 'react-native-paper';

export default function LoginFormInput({
  label = '',
  password = false,
  togglePasswordType = false,
  value,
  onChange,
}) {
  const [showPassword, setShowPassword] = useState(
    password || togglePasswordType,
  );
  const [iconName, setIconName] = useState('eye-off');
  const [focused, setFocused] = useState(false);

  const handlePress = () => {
    const _iconName = iconName === 'eye-off' ? 'eye' : 'eye-off';
    setIconName(_iconName);
    setShowPassword(current => !current);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          {borderColor: focused ? Colors.primary : 'rgba(255,255,255,0.1)'},
        ]}>
        <TextInput
          keyboardType="number-pad"
          secureTextEntry={showPassword}
          style={styles.input}
          value={value}
          placeholderTextColor="rgba(255,255,255,0.3)"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={onChange}
        />
        {togglePasswordType && (
          <IconButton
            iconColor="rgba(255,255,255,0.4)"
            icon={iconName}
            onPress={handlePress}
            size={20}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    color: '#828C9B',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputBox: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#232A3B',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  input: {
    color: '#FFF',
    padding: 10,
    margin: 0,
    fontSize: 18,
    flex: 1,
  },
});
