// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Platform } from 'react-native';
import AppHeader from '../components/AppHeader';

const RespondToRequestsScreen = ({ route, navigation, appConfig }) => {
  const initialEmail = route?.params?.email;
  const [requests, setRequests] = useState([]);
  const [userProfile, setUserProfile] = useState({});
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
          setUserProfile(result.user);
          const pincode = result.user.pincode;
          return fetch(`http://${SERVER}/api/pending-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pincode, email: initialEmail }),
          });
        }
      })
      .then(res => res ? res.json() : undefined)
      .then(result => {
        if (result && result.success) {
          setRequests(result.requests);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Could not fetch requests. Try again.');
      });
  }, [initialEmail, SERVER]);

  const handleRespond = async (requestId, accepted) => {
    try {
      const resp = await fetch(`http://${SERVER}/api/respond-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          donorEmail: userProfile.email || initialEmail,
          donorName: userProfile.name,
          donorPhone: userProfile.phone,
          accepted
        }),
      });
      const result = await resp.json();
      if (result.success) {
        setRequests(prev => prev.filter(r => r._id !== requestId));
        Alert.alert(accepted ? 'Accepted!' : 'Rejected!', result.message);
      } else {
        Alert.alert('Error', result.error || 'Failed to respond.');
      }
    } catch {
      Alert.alert('Error', 'Network error, please try again.');
    }
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.patientName}>{item.patientName}</Text>
      <Text style={styles.details}>Blood Type: <Text style={styles.bold}>{item.bloodType}</Text></Text>
      <Text style={styles.details}>Pin Code: <Text style={styles.bold}>{item.pincode}</Text></Text>
      <Text style={styles.details}>Phone: <Text style={styles.bold}>{item.phone}</Text></Text>
      <Text style={styles.details}>Requested: <Text style={styles.bold}>{new Date(item.createdAt).toLocaleDateString()}</Text></Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleRespond(item._id, true)}
          style={[styles.responseButton, styles.acceptButton]}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRespond(item._id, false)}
          style={[styles.responseButton, styles.rejectButton]}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Home/session fix: always pass latest user email to AppHeader!
  const userEmailForHeader = userProfile.email || initialEmail;

  return (
    <>
      <AppHeader
        navigation={navigation}
        appConfig={appConfig}
        email={userEmailForHeader}
        route={route}
        userName={userProfile?.name || null}
      />
      <View style={styles.outerContainer}>
        <Text style={styles.title}>Blood Requests In Your City</Text>
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderRequest}
          contentContainerStyle={{ paddingBottom: 42, paddingTop: 10 }}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No blood requests in your city right now.</Text>
          )}
          onEndReachedThreshold={0.1}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fafaf9',
    paddingHorizontal: 0,
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: Platform.OS === 'web' ? 34 : 16,
    marginBottom: 10,
    letterSpacing: 0.5,
    alignSelf: 'center'
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginVertical: 9,
    marginHorizontal: 12,
    elevation: 3,
    shadowColor: '#e74c3c',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 2 }
  },
  patientName: { fontSize: 19, fontWeight: 'bold', marginBottom: 7, color: '#e74c3c' },
  details: { fontSize: 15.5, color: '#555', marginBottom: 2, lineHeight: 20 },
  bold: { fontWeight: '700', color: '#222' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 17,
    marginTop: 14
  },
  responseButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    marginHorizontal: 2
  },
  acceptButton: {
    backgroundColor: '#27ae60'
  },
  rejectButton: {
    backgroundColor: '#e74c3c'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15.5,
    letterSpacing: 0.5
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16.8,
    color: '#888',
    marginTop: 40,
    fontStyle: 'italic'
  }
});

export default RespondToRequestsScreen;
