import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SERVER_IP } from '../config/config';

const ProfileScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [name, setName] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://${SERVER_IP}:3001/api/get-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (result.success && result.user) {
        setName(result.user.name || '');
        setBloodType(result.user.bloodType || 'A+');
        setPincode(result.user.pincode || '');
        setPhone(result.user.phone || '');
      } else {
        Alert.alert('Error', 'Could not load profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const updateProfile = async () => {
    if (!name || !pincode || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://${SERVER_IP}:3001/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, bloodType, pincode, phone }),
      });
      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Profile updated!', [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeScreen', params: { email } }],
              }),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Update failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>{email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Blood Type:</Text>
        <Picker
          selectedValue={bloodType}
          style={styles.picker}
          onValueChange={setBloodType}
        >
          <Picker.Item label="A+" value="A+" />
          <Picker.Item label="A-" value="A-" />
          <Picker.Item label="B+" value="B+" />
          <Picker.Item label="B-" value="B-" />
          <Picker.Item label="AB+" value="AB+" />
          <Picker.Item label="AB-" value="AB-" />
          <Picker.Item label="O+" value="O+" />
          <Picker.Item label="O-" value="O-" />
        </Picker>
      </View>
      <TextInput
		  style={styles.input}
		  placeholder="Pin Code"
		  value={pincode}
		  onChangeText={setPincode}
		  keyboardType="number-pad"
		/>


      <TouchableOpacity style={styles.button} onPress={updateProfile} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  pickerContainer: { backgroundColor: 'white', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  label: { fontSize: 16, paddingHorizontal: 15, paddingTop: 10, color: '#333' },
  picker: { height: 50 },
  button: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
export default ProfileScreen;
