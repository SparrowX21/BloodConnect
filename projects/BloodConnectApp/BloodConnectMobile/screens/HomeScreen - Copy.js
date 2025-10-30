import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation, route }) => {
  const [userProfile, setUserProfile] = useState({});
  const email = route?.params?.email; // Defensive in case route.params missing

  useEffect(() => {
    if (!email) return;
    fetch(`http://192.168.1.121:3001/api/get-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) setUserProfile(result.user);
      });
  }, [email]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BloodConnect</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RequestBloodScreen', { email })}
      >
        <Text style={styles.buttonText}>Request Blood</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RespondToRequestsScreen', { email })}
      >
        <Text style={styles.buttonText}>Respond to Requests</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MyRequestsScreen', { email })}
      >
        <Text style={styles.buttonText}>My Requests</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProfileScreen', { email })}
      >
        <Text style={styles.buttonText}>My Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('BloodBankResultsScreen', {
            pincode: userProfile?.pincode || ''
          })
        }
      >
        <Text style={styles.buttonText}>Donate to Blood Bank</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  button: { backgroundColor: '#e74c3c', padding: 20, borderRadius: 10, marginVertical: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default HomeScreen;
