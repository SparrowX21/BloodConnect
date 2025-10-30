// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import AppHeader from '../components/AppHeader';

const RequestBloodScreen = ({ navigation, route, appConfig }) => {
  const initialEmail = route?.params?.email;
  const [name, setName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const SERVER = appConfig?.serverURL || '192.168.1.121:3001';

  useEffect(() => {
    if (!initialEmail) return;
    fetch(`http://${SERVER}/api/get-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: initialEmail }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const { name, bloodType, pincode, phone } = result.user;
          setName(name || '');
          setBloodType(bloodType || '');
          setPincode(pincode || '');
          setPhone(phone || '');
        }
      });
  }, [initialEmail, SERVER]);

  const handleRequest = async () => {
    if (!phone) {
      Alert.alert('Error', 'Phone number required');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`http://${SERVER}/api/request-blood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: initialEmail,
          patientName: name,
          bloodType,
          pincode,
          phone
        }),
      });
      const result = await resp.json();
      setLoading(false);
      if (result.success) {
        navigation.reset({ index: 0, routes: [{ name: 'HomeScreen', params: { email: initialEmail } }] });
      } else {
        Alert.alert('Error', result.error || 'Blood request failed');
      }
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Could not request blood. Try again.');
    }
  };

  // Always pass user email to AppHeader for session-safe navigation!
  return (
    <>
      <AppHeader
        navigation={navigation}
        appConfig={appConfig}
        email={initialEmail}
        route={route}
        userName={name || null}
      />
      <View style={styles.outerContainer}>
        <View style={styles.formCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>🩸</Text>
          </View>
          <Text style={styles.title}>Request Blood</Text>
          <TextInput style={styles.input} placeholder="Full Name" value={name} editable={false} />
          <TextInput style={styles.input} placeholder="Email" value={initialEmail} editable={false} />
          <TextInput style={styles.input} placeholder="Blood Type" value={bloodType} editable={false} />
          <TextInput style={styles.input} placeholder="Pin Code" value={pincode} editable={false} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: appConfig?.brandColor || '#e74c3c' }]}
            onPress={handleRequest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Requesting...' : 'Request Blood'}
            </Text>
          </TouchableOpacity>
          {loading && <Text style={styles.loadingText}>Processing your request...</Text>}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fafaf9',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'web' ? 28 : 12
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#fff',
    borderRadius: 19,
    elevation: 4,
    shadowColor: '#e74c3c',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 30
  },
  avatarContainer: {
    marginBottom: 7,
    marginTop: -24,
  },
  avatarIcon: {
    fontSize: 40,
    opacity: 0.18,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    color: '#e74c3c',
    letterSpacing: 0.2
  },
  input: {
    backgroundColor: '#fffdfa',
    padding: 13,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    fontSize: 16.5,
    borderWidth: 1.1,
    borderColor: '#f6d7cb',
    elevation: 1,
  },
  button: {
    marginTop: 16,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#e74c3c'
  }
});

export default RequestBloodScreen;
