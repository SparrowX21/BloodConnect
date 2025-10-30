import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import CONFIG from '../config/appConfig';

const log = (...args) => { if (CONFIG.LOG_ALL) console.log('[LOG]', ...args); };

export default function MainMenuScreen({ navigation }) {
  log('Rendering MainMenuScreen');
  const buttons = [
    { title: 'Register', action: () => { log('Navigating to Register'); navigation.navigate('Register'); } },
    { title: 'Profile', action: () => { log('Navigating to Profile'); navigation.navigate('Profile'); } },
    { title: 'Request Blood', action: () => { log('Navigating to RequestBlood'); navigation.navigate('RequestBlood'); } },
    { title: 'Find Match', action: () => { log('Navigating to Match'); navigation.navigate('Match'); } },
    { title: 'Chatbot', action: () => { log('Navigating to Chatbot'); navigation.navigate('Chatbot'); } },
    { title: 'Logout', action: () => { log('Logout pressed'); Alert.alert('Logout', 'Implement logic here.'); } },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>BloodConnect</Text>
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
  button: { width: '44%', backgroundColor: '#C0392B', borderRadius: 12, padding: 20, margin: 10, alignItems: 'center', elevation: 2 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
