import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import TextInputMask from 'react-native-text-input-mask';
import CurrencyInput from 'react-native-currency-input';

const MASK_TYPES = {
  number: '[000]',
  pin: '[0000]',
  ticket: '[0000]',
  price: '[0000]{.}[00]',
  phone: '([000]) [000] [00] [00]',
  digits: '[0…]',
};

const CustomNumericField = ({
  type = 'number',
  inputRef,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  prefix,
  error = false,
  errorMessage,
  hideErrorMessage = false,
  width,
  marginY,
  marginX,
  maxLength,
  disabled = false,
}) => {
  const handleMaskChange = (formatted, extracted) => {
    onChange(extracted);
  };

  const handleChangeCurrency = text => {
    onChange(text);
  };

  return (
    <View
      style={[
        styles.container,
        {width: width, marginVertical: marginY, marginHorizontal: marginX},
      ]}>
      <View style={[styles.input, {borderColor: error ? 'red' : 'gray'}]}>
        {type === 'password' && (
          <PasswordInput
            inputRef={inputRef}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            maxLength={maxLength}
            disabled={disabled}
            placeholder={placeholder}
          />
        )}
        {type === 'currency' && (
          <CurrencyInput
            ref={el => {
              if (!inputRef) return;
              inputRef.current = el;
            }}
            value={value}
            onChangeValue={handleChangeCurrency}
            onBlur={onBlur}
            minValue={0}
            separator="."
            delimiter=","
            prefix={prefix}
            placeholder={placeholder}
            editable={!disabled}
            style={{fontSize: 18}}
          />
        )}
        {!['currency', 'password'].includes(type) && (
          <TextInputMask
            ref={el => {
              if (!inputRef) return;
              inputRef.current = el;
            }}
            keyboardType="numeric"
            mask={MASK_TYPES[type]}
            onChangeText={handleMaskChange}
            onBlur={onBlur}
            value={value}
            placeholder={placeholder}
            // placeholderTextColor="#000"
            editable={!disabled}
            style={{fontSize: 18}}
          />
        )}
      </View>
      {error && !hideErrorMessage && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
    </View>
  );
};

const PasswordInput = ({
  inputRef,
  onChange,
  onBlur,
  value,
  maxLength,
  disabled,
  placeholder,
}) => {
  return (
    <View style={styles.passwordContainer}>
      <TextInputMask
        editable={!disabled}
        mask="[0…]"
        ref={el => {
          if (!inputRef) return;
          inputRef.current = el;
        }}
        style={[{color: 'rgba(0,0,0,0)'}]}
        onChangeText={onChange}
        onBlur={onBlur}
        value={value}
        keyboardType="numeric"
        maxLength={maxLength}
      />
      <TextInput
        style={styles.textInput}
        value={toAsterisks(value)}
        keyboardType="numeric"
        placeholder={placeholder}
      />
    </View>
  );
};

const toAsterisks = str => {
  return str.replace(/[^\s]/g, '*');
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  label: {
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'gray',
  },
  errorMessage: {
    fontStyle: 'italic',
    color: 'red',
    marginVertical: 5,
  },
  textInput: {
    fontSize: 18,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: -1,
  },
});

export default CustomNumericField;
