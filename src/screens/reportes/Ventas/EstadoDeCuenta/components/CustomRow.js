import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';

export default function CustomRow({
  cols = [],
  highLight = false,
  header = false,
  toplined = false,
  underlined = true,
  dividerTop = false,
  dividerBottom = false,
  dividerBoth = false,
  paddingVertical = 12,
  marginVertical,
  marginTop,
  labelColor = '#1E293B',
}) {
  return (
    <View style={styles.container}>
      {dividerTop && <View style={styles.divider}></View>}
      {dividerBoth && <View style={styles.divider}></View>}
      <Row
        style={[
          styles.row,
          {
            backgroundColor: highLight ? '#FEF9C3' : 'transparent',
            borderTopColor: '#F1F5F9',
            borderTopWidth: toplined ? 1 : 0,
            borderBottomColor: '#F1F5F9',
            borderBottomWidth: underlined ? 1 : 0,
            paddingVertical: paddingVertical,
            marginVertical: marginVertical,
            marginTop: marginTop,
          }
        ]}>
        {cols.map((item, index) => (
          <Col key={index} size={index === 0 ? 60 : 40}>
            <Text
              style={[
                styles.label,
                {
                  color: labelColor,
                  fontFamily: 'Inter',
                  fontWeight: index === 0 || header ? 'bold' : '500',
                  textAlign:
                    index === 0
                      ? 'left'
                      : index === 1 && cols.length > 2
                      ? 'center'
                      : 'right',
                  fontSize: header ? 15 : 13,
                },
              ]}>
              {item}
            </Text>
          </Col>
        ))}
      </Row>
      {dividerBottom && <View style={styles.divider}></View>}
      {dividerBoth && <View style={styles.divider}></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    alignItems: 'center',
  },
  label: {
    paddingVertical: 2,
    color: '#1E293B',
  },
  divider: {
    marginVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
});
