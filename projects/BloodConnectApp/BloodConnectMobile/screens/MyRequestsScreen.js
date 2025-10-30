// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AppHeader from '../components/AppHeader';

const MyRequestsScreen = ({ route, navigation, appConfig }) => {
  const initialEmail = route?.params?.email;
  const [requests, setRequests] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [initialEmail]);

  const fetchRequests = () => {
    if (!initialEmail) return;
    fetch(`${appConfig?.serverURL ? `http://${appConfig.serverURL}` : 'http://192.168.1.121:3001'}/api/my-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientEmail: initialEmail }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setRequests(result.requests);
          if (result.user && result.user.name) setName(result.user.name);
        }
      });
  };

  const clearAllPendingRequests = async () => {
    if (!initialEmail) return;
    Alert.alert(
      "Clear All Pending Requests",
      "Are you sure you want to delete all open/pending blood requests?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete Pending", style: "destructive",
          onPress: async () => {
            try {
              const resp = await fetch(`${appConfig?.serverURL ? `http://${appConfig.serverURL}` : 'http://192.168.1.121:3001'}/api/clear-pending-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientEmail: initialEmail }),
              });
              const result = await resp.json();
              if (result.success) {
                setRequests(requests.filter(r => r.status !== 'pending' && r.status !== 'open'));
              } else {
                Alert.alert('Error', result.error || 'Failed to clear pending requests');
              }
            } catch (err) {
              Alert.alert('Error', 'Network error. Please try again.');
            }
          }
        }
      ]
    );
  };

  const pendingRequestsExist = requests.some(r => r.status === 'pending' || r.status === 'open');

  const renderRequest = ({item}) => (
    <View style={styles.requestCard}>
      <Text style={styles.bloodType}>Blood Type: {item.bloodType}</Text>
      <Text style={styles.details}>pincode: {item.pincode}</Text>
      <Text style={styles.details}>Status: {item.status}</Text>
      <Text style={styles.details}>Requested: {new Date(item.createdAt).toLocaleDateString()}</Text>
      {item.status === 'accepted' && (
        <View style={styles.donorInfo}>
          <Text style={styles.donorTitle}>Donor Accepted:</Text>
          <Text style={styles.donorDetails}>Name: {item.responderName}</Text>
          <Text style={styles.donorDetails}>Phone: {item.responderPhone}</Text>
          <Text style={styles.donorDetails}>Email: {item.responderEmail}</Text>
        </View>
      )}
    </View>
  );

  // Always pass user email to AppHeader for robust session-safe navigation!
  return (
    <>
      <AppHeader
        navigation={navigation}
        appConfig={appConfig}
        email={initialEmail}
        route={route}
        userName={name || null}
      />
      <View style={styles.container}>
        <Text style={styles.title}>My Blood Requests</Text>
        <TouchableOpacity
          style={[styles.clearButton, !pendingRequestsExist && { backgroundColor: '#ccc' }]}
          disabled={!pendingRequestsExist}
          onPress={clearAllPendingRequests}
        >
          <Text style={styles.clearButtonText}>Clear All Pending Requests</Text>
        </TouchableOpacity>
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderRequest}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>You haven't made any blood requests yet.</Text>
          )}
          onRefresh={fetchRequests}
          refreshing={false}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  requestCard: { backgroundColor: 'white', padding: 16, borderRadius: 10, marginBottom: 16, elevation: 2 },
  bloodType: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  details: { fontSize: 14, color: '#666', marginBottom: 4 },
  donorInfo: { marginTop: 12, padding: 12, backgroundColor: '#d5f4e6', borderRadius: 8 },
  donorTitle: { fontSize: 16, fontWeight: 'bold', color: '#27ae60', marginBottom: 4 },
  donorDetails: { fontSize: 14, color: '#333', marginBottom: 2 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 50 },
  clearButton: {
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 8
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default MyRequestsScreen;
