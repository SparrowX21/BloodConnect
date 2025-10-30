import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Image } from 'react-native';
import CONFIG from '../config/appConfig';

const log = (...args) => { if (CONFIG.LOG_ALL) console.log('[LOG]', ...args); };
const BASE_URL = `http://${CONFIG.BACKEND_IP}:${CONFIG.BACKEND_PORT}`;

export default function DonorRequestScreen({ route, navigation }) {
  const patientEmail = route?.params?.patientEmail || '';
  const [eta, setEta] = useState('');
  const [reason, setReason] = useState('');

  log('Rendering DonorRequestScreen', { patientEmail });

  const acceptRequest = async () => {
    log('Donor accepts request', { patientEmail, eta });
    try {
      await fetch(`${BASE_URL}/api/donor-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientEmail, accepted: true, eta }),
      });
      Alert.alert('Accepted!', `ETA: ${eta} mins`);
      navigation.navigate('MainMenu');
    } catch (err) {
      log('Error accepting request:', err);
      Alert.alert('Error', 'Network/server error.');
    }
  };

  const rejectRequest = async () => {
    log('Donor rejects request', { patientEmail, reason });
    try {
      await fetch(`${BASE_URL}/api/donor-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientEmail, accepted: false, reason }),
      });
      Alert.alert('Rejected', `Reason: ${reason}`);
      navigation.navigate('MainMenu');
    } catch (err) {
      log('Error rejecting request:', err);
      Alert.alert('Error', 'Network/server error.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Incoming Blood Request</Text>
      <Text style={styles.label}>Accept: ETA in minutes</Text>
      <TextInput style={styles.input} placeholder="ETA in minutes" value={eta} onChangeText={val => { log('ETA changed:', val); setEta(val); }} keyboardType="numeric"/>
      <Button title="Accept" onPress={acceptRequest}/>
      <Text style={styles.label}>Or Reject: reason</Text>
      <TextInput style={styles.input} placeholder="Reason for rejection" value={reason} onChangeText={val => { log('Reason changed:', val); setReason(val); }}/>
      <Button title="Reject" onPress={rejectRequest}/>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center',padding:32,backgroundColor:'#fff'},
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 12 },
  title:{fontSize:24,fontWeight:'bold',marginBottom:20},
  label:{fontSize:16,marginTop:12},
  input:{width:'100%',padding:12,margin:8,borderWidth:1,borderColor:'#bbb',borderRadius:8,backgroundColor:'#f6f8fa'},
});
