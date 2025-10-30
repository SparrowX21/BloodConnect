// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Animated, Switch, Platform } from 'react-native';
import AppHeader from '../components/AppHeader';

const DEMO_BANKS = [
  { name: 'Red Cross Center', address: '101 Main St', distanceKm: 1.2 },
  { name: 'City Blood Bank', address: '222 High Rd', distanceKm: 2.3 },
  { name: 'Urban Donation Point', address: '355 Maple Ave', distanceKm: 2.7 },
];

function kmToMiles(km) {
  return (km * 0.621371).toFixed(1);
}

const DonateScreen = ({ navigation, route, appConfig }) => {
  const initialEmail = route?.params?.email;
  const [eligible, setEligible] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [stage, setStage] = useState(0);
  const [banks, setBanks] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [loadingBanks, setLoadingBanks] = useState(false);

  const banksAnim = useState(new Animated.Value(0))[0];
  const slotsAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    async function doFetch() {
      if (!initialEmail) return;
      setLoadingBanks(true);
      let fetchedBanks = [];
      try {
        const profResp = await fetch(`http://${appConfig?.serverURL || '192.168.1.121:3001'}/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: initialEmail }),
        });
        const profResult = await profResp.json();
        setUserProfile(profResult.user || {});
        if (!profResult.success) throw new Error('Profile not found');
        const pincode = profResult.user.pincode;

        const resp = await fetch(`http://${appConfig?.serverURL || '192.168.1.121:3001'}/api/nearby-blood-banks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pincode }),
        });
        const result = await resp.json();
        if (result.success && result.banks && result.banks.length > 0) {
          fetchedBanks = result.banks;
        } else {
          throw new Error('No banks from API');
        }
      } catch {
        fetchedBanks = DEMO_BANKS;
      }
      setBanks(fetchedBanks);
      setLoadingBanks(false);
    }
    doFetch();
  }, [initialEmail, appConfig?.serverURL]);

  function generateSlotsWithBanks() {
    if (!banks.length) return [];
    const slots = [];
    const now = new Date();
    let attempts = 0;
    while (slots.length < Math.min(5, banks.length * 2) && attempts < 60) {
      const d = new Date(now);
      d.setDate(now.getDate() + Math.floor(Math.random() * 14));
      const weekday = d.getDay();
      if (weekday !== 0 && weekday !== 6 && banks.length > 0) {
        const hour = 8 + Math.floor(Math.random() * 8);
        const minute = Math.random() < 0.5 ? '00' : '30';
        const bankIdx = slots.length % banks.length;
        const formatted = {
          date: d.toLocaleDateString(),
          time: `${hour}:${minute}`,
          bank: banks[bankIdx]
        };
        if (!slots.find(s => s.date === formatted.date && s.time === formatted.time && s.bank.name === formatted.bank.name)) {
          slots.push(formatted);
        }
      }
      attempts++;
    }
    return slots;
  }
  const slots = showSlots ? generateSlotsWithBanks() : [];

  useEffect(() => {
    if (!showSlots) {
      banksAnim.setValue(0);
      slotsAnim.setValue(0);
      setStage(0);
      return;
    }
    setStage(1);
    Animated.timing(banksAnim, { toValue: 1, duration: 650, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        setStage(2);
        Animated.timing(slotsAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
      }, 650);
    });
  }, [showSlots]);

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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Donate Blood</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Eligibility Confirmation</Text>
          <View style={styles.checkboxRow}>
            <Switch
              value={eligible}
              onValueChange={setEligible}
              trackColor={{ false: '#bbb', true: '#e74c3c' }}
              thumbColor="#fff"
              style={styles.cbBox}
            />
            <Text style={styles.eligText}>
              I confirm that I meet the <Text style={styles.eligLink}>eligibility criteria</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.donateBtn, { opacity: eligible ? 1 : 0.5 }]}
            onPress={() => !eligible ? Alert.alert('Please confirm eligibility!') : setShowSlots(true)}
            disabled={!eligible}
          >
            <Text style={styles.donateBtnText}>I want to Donate</Text>
          </TouchableOpacity>
        </View>
        {showSlots && (
          <>
            <Animated.View style={{ opacity: banksAnim, width: '100%' }}>
              <Text style={styles.genAiLabel}>🤖 GenAI finding banks in your area...</Text>
              <Text style={styles.subHeader}>Available Banks Nearby</Text>
              <View style={styles.bankGrid}>
                {loadingBanks ? (
                  <Text style={styles.genAiLabel}>Loading banks...</Text>
                ) : banks.length === 0 ? (
                  <Text style={styles.genAiLabel}>No banks found for your area.</Text>
                ) : banks.map((bank, i) => (
                  <View key={i} style={[styles.bankCard, { backgroundColor: ['#fdebd0', '#fff6e3', '#edeff2'][i % 3] }]}>
                    <Text style={styles.bankName}>🏥 {bank.name}</Text>
                    <Text style={styles.bankAddr}>{bank.address}</Text>
                    {bank.distanceKm !== undefined &&
                      <Text style={styles.bankDist}>📍 {kmToMiles(bank.distanceKm)} miles</Text>
                    }
                  </View>
                ))}
              </View>
            </Animated.View>
            <Animated.View style={{ opacity: slotsAnim, width: '100%' }}>
              {stage > 1 && (
                <>
                  <Text style={styles.genAiLabel}>🤖 GenAI finding the best appointment slots...</Text>
                  <Text style={styles.subHeader}>Available Appointment Slots</Text>
                  <View style={{ width: '100%' }}>
                    {slots.map((slot, idx) => (
                      <View key={idx} style={styles.slotCard}>
                        <View style={{ flex: 2 }}>
                          <Text style={styles.slotDT}>{slot.date} | <Text style={styles.slotTime}>{slot.time}</Text></Text>
                        </View>
                        <View style={{ flex: 4, marginLeft: 14 }}>
                          <Text style={styles.slotBankLabel}>at {slot.bank.name}</Text>
                          <Text style={styles.slotBankAddr}>{slot.bank.address}</Text>
                          {slot.bank.distanceKm !== undefined &&
                            <Text style={styles.slotBankDist}>📍 {kmToMiles(slot.bank.distanceKm)} miles away</Text>
                          }
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#faf9f6',
    alignItems: 'center',
    flexGrow: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 10,
    letterSpacing: 1.1
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 30,
    marginBottom: 26,
    elevation: 4,
    shadowColor: '#f1c40f',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center'
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
    color: '#d35400',
    marginBottom: 12,
    textAlign: 'center'
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, alignSelf: 'center', width: '96%' },
  cbBox: { marginRight: 12 },
  eligText: { fontSize: 16.5, color: '#444', flex: 1, flexWrap: 'wrap' },
  eligLink: { textDecorationLine: 'underline', color: '#2980b9', fontWeight: 'bold' },
  donateBtn: { backgroundColor: '#e74c3c', borderRadius: 13, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  donateBtnText: { color: 'white', fontWeight: 'bold', fontSize: 19.5, letterSpacing: 1.05 },
  genAiLabel: { textAlign: 'center', fontSize: 15.5, color: '#757575', fontStyle: 'italic', marginVertical: 6, marginBottom: 2 },
  subHeader: { fontSize: 21, fontWeight: '700', marginTop: 24, color: '#d35400', marginBottom: 17, textAlign: 'center', letterSpacing: 0.5 },
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 },
  bankCard: {
    borderRadius: 14, padding: 15, width: 190, alignItems: 'center', minHeight: 94,
    marginHorizontal: 8, marginVertical: 10,
    borderColor: '#f9c92e', borderWidth: 0.5, elevation: 2,
    shadowColor: '#f1c40f', shadowOpacity: 0.13, shadowRadius: 16
  },
  bankName: { fontSize: 15.5, fontWeight: 'bold', color: '#c0392b', textAlign: 'center' },
  bankAddr: { fontSize: 14, color: '#34495e', textAlign: 'center', marginVertical: 2 },
  bankDist: { fontSize: 13, color: '#27ae60', marginTop: 2 },
  slotCard: {
    backgroundColor: '#fff6e3',
    marginVertical: 8,
    marginHorizontal: 0,
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderColor: '#ffebb1',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#f9d076'
  },
  slotDT: { fontWeight: 'bold', fontSize: 16.5, color: '#e67e22' },
  slotTime: { fontWeight: 'bold', fontSize: 18, color: '#e74c3c' },
  slotBankLabel: { fontWeight: '600', color: '#d35400', fontSize: 15, marginTop: 1 },
  slotBankAddr: { fontSize: 13.5, color: '#34495e' },
  slotBankDist: { fontSize: 13, color: '#27ae60', marginTop: 0 },
});

export default DonateScreen;
