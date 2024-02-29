import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {uuid} from '../../../../../utils';

export default function CustomRow({
  cols = [],
  highLight = false,
  header = false,
  toplined = false,
  underlined = true,
  dividerTop = false,
  dividerBottom = false,
  dividerBoth = false,
  paddingVertical,
  marginVertical,
  marginTop,
  labelColor = 'rgba(0,0,0,0.6)',
}) {
  return (
    <>
      {dividerTop && <View style={styles.divider}></View>}
      {dividerBoth && <View style={styles.divider}></View>}
      <Row
        style={{
          backgroundColor: highLight ? 'yellow' : '',
          borderTopColor: 'gray',
          borderTopWidth: toplined ? 1 : 0,
          borderBottomColor: 'gray',
          borderBottomWidth: underlined ? 1 : 0,
          paddingVertical: paddingVertical,
          marginVertical: marginVertical,
          marginTop: marginTop,
        }}>
        {cols.map((item, index) => (
          <Col key={uuid()} size={index === 0 ? 60 : 40}>
            <Text
              style={[
                styles.label,
                {
                  color: labelColor,
                  fontWeight: index === 0 || header ? 'bold' : 'normal',
                  textAlign:
                    index === 0
                      ? 'left'
                      : index === 1 && cols.length > 2
                      ? 'center'
                      : 'right',
                },
              ]}>
              {item}
            </Text>
          </Col>
        ))}
      </Row>
      {dividerBottom && <View style={styles.divider}></View>}
      {dividerBoth && <View style={styles.divider}></View>}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'right',
    paddingVertical: 5,
    textTransform: 'uppercase',
    fontSize: 16,
  },
  divider: {
    marginVertical: 20,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
  },
});
