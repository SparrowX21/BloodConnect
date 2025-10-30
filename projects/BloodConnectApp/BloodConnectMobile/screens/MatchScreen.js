import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import CONFIG from '../config/appConfig';

const log = (...args) => { if (CONFIG.LOG_ALL) console.log('[LOG]', ...args); };

export default function MatchScreen({ navigation }) {
  log('Rendering MatchScreen');
  const buttons = [
    { title: 'Find Match', action: () => { log('Find Match pressed'); /* match logic */ } },
    { title: 'View Details', action: () => { log('View Details pressed'); /* details logic */ } },
    { title: 'Contact Donor', action: () => { log('Contact Donor pressed'); /* contact logic */ } },
    { title: 'Back', action: () => { log('Back to MainMenu'); navigation.navigate('MainMenu'); } },
  ];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Matching</Text>
      <View style={styles.grid}>
        {buttons.map(btn => (
          <TouchableOpacity key={btn.title} style={styles.button} onPress={btn.action}>
            <Text style={styles.buttonText}>{btn.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 32, backgroundColor: '#fff' },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: { width: '44%', backgroundColor: '#9b59b6', borderRadius: 12, padding: 20, margin: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
