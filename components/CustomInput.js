import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import TextInputMask from 'react-native-text-input-mask';

export default function CustomInput({
  label,
  iconLeft = null,
  iconRight = null,
  password = false,
  disabled = false,
  onLeftIconPress = undefined,
  onRightIconPress = undefined,
  mode = 'flat', // flat || outlined
  onChange = undefined,
  onBlur = undefined,
  value,
  error = false,
  errorMessage = '',
  keyboardType = 'default',
  masked = null,
  placeholder = undefined,
  maxLength = undefined,
  showErrorMessage = true,
  width = undefined,
  ref = undefined,
}) {
  // SI SE DEFINE EL ICONO IZQUIERDO
  if (iconLeft !== null) {
    const LeftIcon =
      onLeftIconPress === undefined ? (
        <TextInput.Icon icon={iconLeft} />
      ) : (
        <TextInput.Icon icon={iconLeft} onPress={onLeftIconPress} />
      );
    return (
      <View style={{marginVertical: 10}}>
        <TextInput
          keyboardType={keyboardType}
          label={label}
          secureTextEntry={password}
          left={LeftIcon}
          disabled={disabled}
          mode={mode}
          onChangeText={onChange}
          onBlur={onBlur}
          value={value}
          error={error}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{width: width}}
        />
        {error && showErrorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
      </View>
    );
  }
  // SI SE DEFINE EL ICONO DERECHO
  if (iconRight !== null) {
    const RightIcon =
      onRightIconPress === undefined ? (
        <TextInput.Icon icon={iconRight} />
      ) : (
        <TextInput.Icon icon={iconRight} onPress={onRightIconPress} />
      );
    return (
      <View style={{marginVertical: 10}}>
        <TextInput
          keyboardType={keyboardType}
          label={label}
          secureTextEntry={password}
          right={RightIcon}
          disabled={disabled}
          mode={mode}
          onChangeText={onChange}
          onBlur={onBlur}
          value={value}
          error={error}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{width: width}}
        />
        {error && showErrorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
      </View>
    );
  }
  // SI MASK ESTA DEFINIDO
  if (masked) {
    return (
      <View style={{marginVertical: 10}}>
        <TextInput
          keyboardType={keyboardType}
          label={label}
          secureTextEntry={password}
          disabled={disabled}
          mode={mode}
          error={error}
          maxLength={maxLength}
          style={{width: width}}
          render={props => (
            <TextInputMask
              {...props}
              mask={masked.pattern}
              rightToLeft={masked.rightToLeft}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
            />
          )}
        />
        {error && showErrorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
      </View>
    );
  }
  // DEFAULT TEXT INPUT
  return (
    <View style={{marginVertical: 10}}>
      <TextInput
        keyboardType={keyboardType}
        label={label}
        secureTextEntry={password}
        disabled={disabled}
        mode={mode}
        onChangeText={onChange}
        value={value}
        error={error}
        placeholder={placeholder}
        onBlur={onBlur}
        maxLength={maxLength}
        style={{width: width}}
      />
      {error && showErrorMessage && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorMessage: {
    color: 'red',
    fontStyle: 'italic',
  },
});
