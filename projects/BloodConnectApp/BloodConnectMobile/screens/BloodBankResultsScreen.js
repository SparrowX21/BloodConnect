// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeader';

const BloodBankResultsScreen = ({ route, navigation, appConfig }) => {
  const initialEmail = route?.params?.email;
  const [banks, setBanks] = useState([]);
  const [banksToShow, setBanksToShow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({});
  const [error, setError] = useState('');

  const SERVER = appConfig?.serverURL || '192.168.1.121:3001';

  useEffect(() => {
    if (!initialEmail) {
      setError('No email provided for blood bank search.');
      setLoading(false);
      return;
    }
    const fetchAndGetBanks = async () => {
      try {
        setLoading(true);
        setError('');
        setBanks([]);
        setBanksToShow([]);
        const profResp = await fetch(`http://${SERVER}/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: initialEmail }),
        });
        const profResult = await profResp.json();
        if (!profResult.success) {
          setError('Profile not found.');
          setLoading(false);
          return;
        }
        setUserProfile(profResult.user || {});
        const latestPincode = profResult.user.pincode;

        await new Promise(resolve => setTimeout(resolve, 900)); // Small animation effect

        const resp = await fetch(`http://${SERVER}/api/nearby-blood-banks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pincode: latestPincode }),
        });
        const result = await resp.json();
        if (result.success) {
          setBanks(result.banks || []);
        }
        setLoading(false);
      } catch (e) {
        setError('Network or backend error.');
        setLoading(false);
      }
    };
    fetchAndGetBanks();
  }, [initialEmail, SERVER]);

  useEffect(() => {
    if (loading || !banks.length) {
      setBanksToShow([]);
      return;
    }
    setBanksToShow([]);
    let idx = 0;
    function revealNext() {
      setBanksToShow(prev => banks.slice(0, prev.length + 1));
      idx += 1;
      if (idx < banks.length) {
        setTimeout(revealNext, 900 + Math.floor(Math.random() * 800));
      }
    }
    if (banks.length > 0) {
      setTimeout(revealNext, 900);
    }
  }, [banks, loading]);

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
      <View style={styles.container}>
        <Text style={styles.title}>Nearby Blood Banks {userProfile?.pincode ? `for ${userProfile.pincode}` : ''}</Text>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.llmWait}>
              Wait – Gen AI Large Language Model is fetching info based on your location...
            </Text>
          </>
        ) : error ? (
          <Text style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</Text>
        ) : banksToShow.length === 0 ? (
          <Text>No blood banks found for pincode {userProfile.pincode}.</Text>
        ) : (
          <FlatList
            data={banksToShow}
            keyExtractor={(_, i) => `${i}`}
            renderItem={({ item }) => (
              <View style={styles.bankCard}>
                <Text style={styles.bankName}>{item.name}</Text>
                <Text>Address: {item.address}</Text>
                <Text>Contact: {item.contact}</Text>
                <Text>Timings: {item.timings}</Text>
                {item.campaign && <Text style={styles.campaign}>Campaign: {item.campaign}</Text>}
              </View>
            )}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  llmWait: {
    color: '#e67e22',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  bankCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 15, elevation: 2 },
  bankName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  campaign: { color: '#e74c3c', fontWeight: 'bold', marginTop: 5 },
});

export default BloodBankResultsScreen;
