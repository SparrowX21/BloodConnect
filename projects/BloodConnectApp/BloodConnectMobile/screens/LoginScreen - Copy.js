import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import CONFIG from '../config/appConfig';

const log = (...args) => { if (CONFIG.LOG_ALL) console.log('[LOG]', ...args); };
const BASE_URL = `http://${CONFIG.BACKEND_IP}:${CONFIG.BACKEND_PORT}`;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');

  log('Rendering LoginScreen', { email, otpRequested, otp });

  const requestOtp = async () => {
    log('Request OTP handler CALLED, email:', email);
    if (!email) {
      log('No email entered, aborting');
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    try {
      log('Sending OTP request to', `${BASE_URL}/api/send-otp`);
      const res = await fetch(`${BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      log('OTP request response:', res);
      setOtpRequested(true);
      Alert.alert('OTP Sent', 'Check your email inbox for the OTP.');
    } catch (err) {
      log('Fetch/network error in requestOtp:', err);
      Alert.alert('Error', 'Network/server error.');
    }
  };

  const verifyOtp = async () => {
    log('Verifying OTP for email:', email, 'OTP:', otp);
    try {
      const res = await fetch(`${BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      log('OTP verification response:', data);
      if (!data.success) {
        Alert.alert('Login failed', 'Incorrect OTP');
        log('OTP verification failed');
        return;
      }
      // Check if user is registered
      const userCheck = await fetch(`${BASE_URL}/api/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const userData = await userCheck.json();
      log('Check user registration response:', userData);

      if (userData.registered) {
        log('User is registered, navigating to MainMenu');
        navigation.navigate('MainMenu');
      } else {
        log('User NOT registered, navigating to Details');
        navigation.navigate('Details', { email });
      }
    } catch (err) {
      log('Error during OTP verification or registration check:', err);
      Alert.alert('Error', 'Network or server issue.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Login with OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={email}
        onChangeText={val => { log('Email changed:', val); setEmail(val); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {otpRequested ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={val => { log('OTP changed:', val); setOtp(val); }}
            keyboardType="numeric"
          />
          <Button title="Login" onPress={verifyOtp} />
        </>
      ) : (
        <Button title="Request OTP" onPress={requestOtp} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:32, backgroundColor:'#fff' },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize:24, fontWeight:'bold', marginBottom:20 },
  input: { width:'100%', padding:12, margin:8, borderWidth:1, borderColor:'#bbb', borderRadius:8, backgroundColor:'#f6f8fa' },
});
