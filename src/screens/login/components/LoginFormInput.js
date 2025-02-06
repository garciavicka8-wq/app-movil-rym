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
    <View
      style={[
        styles.inputBox,
        {borderColor: focused ? Colors.lightBlue : 'transparent'},
      ]}>
      <Text style={styles.label}>{label}</Text>
      <View style={{display: 'flex', flexDirection: 'row'}}>
        <TextInput
          keyboardType="number-pad"
          secureTextEntry={showPassword}
          style={styles.input}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={onChange}
        />
        {togglePasswordType && (
          <IconButton
            iconColor="rgba(0,0,0,0.3)"
            icon={iconName}
            onPress={handlePress}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  label: {
    color: 'rgba(0,0,0,0.3)',
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    backgroundColor: 'transparent',
    padding: 5,
    margin: 0,
    borderRadius: 8,
    fontSize: 18,
    flex: 1,
  },
});
