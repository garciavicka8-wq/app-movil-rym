import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function TicketSection({title, subtitle, children, icon}) {
  return (
    <View style={styles.container}>
      {title !== undefined && <Text style={styles.title}>{title}</Text>}
      {subtitle !== undefined && (
        <View style={styles.subTitleContainer}>
          <Text style={styles.subTitle}>{subtitle}</Text>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 18,
    color: '#0E1321',
  },
  subTitleContainer: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0E1321',
  },
  subTitle: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    width: '100%',
  }
});
