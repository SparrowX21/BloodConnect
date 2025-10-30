// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AppHeader from '../components/AppHeader';

const ProfileScreen = ({ route, navigation, appConfig }) => {
  const initialEmail = route?.params?.email;
  const [profile, setProfile] = useState({ name: '', email: '', bloodType: '', pincode: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const SERVER = appConfig?.serverURL || '192.168.1.121:3001';

  useEffect(() => {
    if (!initialEmail) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const resp = await fetch(`http://${SERVER}/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: initialEmail })
        });
        const result = await resp.json();
        if (result.success) {
          setProfile(result.user);
        } else {
          Alert.alert('Error', result.error || 'Could not fetch profile.');
        }
      } catch {
        Alert.alert('Error', 'Could not fetch profile. Try again.');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [initialEmail, SERVER]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`http://${SERVER}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const result = await resp.json();
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeScreen', params: { email: profile.email || initialEmail, profileUpdated: true } }],
        });
      } else {
        Alert.alert('Error', result.message || 'Update failed.');
      }
    } catch {
      Alert.alert('Error', 'Could not update profile. Try again.');
    }
    setLoading(false);
  };

  // Always use state (latest) or route param (fallback) for user email:
  const userEmailForHeader = profile.email || initialEmail;

  return (
    <>
      <AppHeader
        navigation={navigation}
        appConfig={appConfig}
        email={userEmailForHeader}
        route={route}
        userName={profile?.name || null}
      />
      <View style={styles.outerContainer}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.title}>My Profile</Text>
          <TextInput style={styles.input} placeholder="Name"
            value={profile.name}
            onChangeText={val => setProfile(p => ({ ...p, name: val }))}
          />
          <TextInput style={styles.input} placeholder="Email" value={profile.email} editable={false} />
          <TextInput style={styles.input} placeholder="Blood Type"
            value={profile.bloodType}
            onChangeText={val => setProfile(p => ({ ...p, bloodType: val }))}
          />
          <TextInput style={styles.input} placeholder="Pin Code"
            value={profile.pincode}
            onChangeText={val => setProfile(p => ({ ...p, pincode: val }))}
          />
          <TextInput style={styles.input} placeholder="Phone"
            value={profile.phone}
            onChangeText={val => setProfile(p => ({ ...p, phone: val }))}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: appConfig?.brandColor || '#e74c3c' }]} onPress={handleUpdate} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Profile'}</Text>
          </TouchableOpacity>
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
  profileCard: {
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
    marginTop: -24
  },
  avatarIcon: {
    fontSize: 46,
    opacity: 0.11
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    color: '#e74c3c'
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
    elevation: 1
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
  }
});

export default ProfileScreen;
