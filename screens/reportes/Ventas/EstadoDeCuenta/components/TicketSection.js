import React from 'react';
import {StyleSheet, Text} from 'react-native';

export default function TicketSection({title, subtitle, children}) {
  return (
    <>
      {title !== undefined && <Text style={styles.title}>{title}</Text>}
      {subtitle !== undefined && (
        <Text style={styles.subTitle}>{subtitle}</Text>
      )}
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 10,
    fontSize: 18,
  },
  subTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 5,
    fontSize: 18,
    backgroundColor: '#00695c',
    color: 'white',
    marginVertical: 20,
  },
});
