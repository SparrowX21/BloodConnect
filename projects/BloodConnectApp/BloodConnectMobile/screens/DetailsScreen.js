import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import CONFIG from '../config/appConfig';

const log = (...args) => { if (CONFIG.LOG_ALL) console.log('[LOG]', ...args); };
const BASE_URL = `http://${CONFIG.BACKEND_IP}:${CONFIG.BACKEND_PORT}`;

export default function DetailsScreen({ route, navigation }) {
  const { email } = route.params;
  const [name, setName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [pincode, setPincode] = useState('');

  log('Rendering DetailsScreen', { email });

  const submitDetails = async () => {
    log('Submitting details:', { name, email, bloodType, pincode });
    if (!name || !bloodType || !pincode) {
      Alert.alert('Error', 'Please fill all fields!');
      log('Failed registration: incomplete fields');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, bloodType, pincode }),
      });
      const data = await res.json();
      log('Register response:', data);
      if (res.ok && data.success) {
        Alert.alert('Profile completed!', 'Welcome!');
        log('Navigating to MainMenu');
        navigation.navigate('MainMenu');
      } else {
        Alert.alert('Error', data.error || 'Registration failed.');
        log('Registration failed:', data.error);
      }
    } catch (err) {
      Alert.alert('Error', 'Network/server error.');
      log('Error during registration:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Enter Details</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={val => { log('Name changed:', val); setName(val); }} />
      <TextInput style={styles.input} placeholder="Blood Type" value={bloodType} onChangeText={val => { log('Blood type changed:', val); setBloodType(val); }} />
      <TextInput style={styles.input} placeholder="pincode" value={pincode} onChangeText={val => { log('pincode changed:', val); setPincode(val); }} />
      <Button title="Submit" onPress={submitDetails} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:32, backgroundColor:'#fff' },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize:24, fontWeight:'bold', marginBottom:20 },
  input: { width:'100%', padding:12, margin:8, borderWidth:1, borderColor:'#bbb', borderRadius:8, backgroundColor:'#f6f8fa' },
});
