// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image, Platform } from 'react-native';

const CARD_HEIGHT = 120;

const LoginScreen = ({ navigation, appConfig }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const infoTypes = appConfig?.infoTypes || [
    { icon: '💧', label: 'Whole Blood', description: `Every 56 days, up to 6x/year\nIn good health, ≥16 yrs, ≥110 lbs` },
    { icon: '🩸', label: 'Power Red', description: `Every 112 days, up to 3x/year\nMale: ≥17 yr, 5'1", 130 lbs\nFemale: ≥19 yr, 5'3", 150 lbs` },
    { icon: '🩹', label: 'Platelets', description: `Every 7 days, up to 24x/year\nGood health, ≥17 yrs, ≥110 lbs` },
    { icon: '🧪', label: 'AB Elite Plasma', description: `Every 28 days, up to 13x/year\nMust be AB type, good health, ≥17 yrs, ≥110 lbs` }
  ];

  const rows = [
    [infoTypes[0], infoTypes[1]],
    [infoTypes[2], infoTypes[3]]
  ];

  const SERVER = appConfig?.serverURL || '192.168.1.121:3001';

  const requestOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://${SERVER}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      setLoading(false);
      if (result.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent to your email!');
      } else {
        Alert.alert('Error', result.error || 'Failed to send OTP');
      }
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const verifyResp = await fetch(`http://${SERVER}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const verifyRes = await verifyResp.json();
      if (verifyRes.success) {
        const checkResp = await fetch(`http://${SERVER}/api/check-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const checkRes = await checkResp.json();
        setLoading(false);
        if (checkRes.registered) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeScreen', params: { email } }],
          });
        } else {
          navigation.navigate('RegisterScreen', { email });
        }
      } else {
        setLoading(false);
        Alert.alert('Error', verifyRes.error || 'Invalid OTP');
      }
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroBox}>
        <Image source={appConfig.logo} style={styles.logo} />
        <Text style={styles.heroWelcome}>
          <Text style={styles.brand}>BloodConnect</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          <Text style={styles.orange}>Let’s </Text>
          <Text style={styles.green}>change </Text>
          <Text style={styles.gold}>Lives </Text>
          <Text style={styles.orange}>one </Text>
          <Text style={styles.drop}>Drop</Text>
          <Text style={styles.orange}> at a time</Text>
        </Text>
      </View>
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {otpSent && (
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
          />
        )}
        {!otpSent ? (
          <TouchableOpacity style={styles.button} onPress={requestOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Request OTP'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{appConfig.infoTitle || 'Types of Blood Donation'}</Text>
        <View style={styles.gridWrap}>
          {rows.map((row, rowIdx) => (
            <View style={styles.gridRow} key={rowIdx}>
              {row.map((type, colIdx) => (
                <View style={styles.gridItem} key={colIdx}>
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={styles.infoTypeLabel}>{type.label}</Text>
                  <Text style={styles.infoText}>{type.description}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <Text style={styles.infoRef}>{appConfig.infoSource || (
          <>Source: American Red Cross{'\n'}redcrossblood.org/donate-blood/how-to-donate/eligibility-requirements.html</>
        )}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f4f3f8', padding: 0, minHeight: "100%" },
  heroBox: { alignItems: 'center', marginTop: Platform.OS === 'web' ? 35 : 30, marginBottom: 5 },
  logo: {
    height: 110,
    width: 110,
    borderRadius: 28,
    borderWidth: 5,
    borderColor: '#f7b731',
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: '#fff'
  },
  heroWelcome: {
    fontSize: 34,
    fontWeight: '900',
    color: '#d35400',
    letterSpacing: 1,
    marginBottom: 3,
    textAlign: "center",
  },
  brand: {
    color: '#e74c3c',
    fontWeight: '900',
    fontSize: 36,
  },
  heroSubtitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  green: { color: '#229954', fontWeight: 'bold' },
  gold: { color: '#cfa104', fontWeight: 'bold' },
  orange: { color: '#de6806', fontWeight: 'bold' },
  drop: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 23,
    fontStyle: 'italic',
    textShadowColor: '#ffdeda',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: 2,
  },
  formCard: {
    backgroundColor: '#fffaf7',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 13,
    marginBottom: 14,
    shadowColor: '#d35400',
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 2
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ead7c6',
    fontSize: 18,
    marginBottom: 17,
    letterSpacing: 0.2,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 5,
    shadowColor: '#e74c3c',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 }
  },
  buttonText: { color: '#fff', fontSize: 17.5, fontWeight: 'bold', letterSpacing: 0.5 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 17,
    margin: 11,
    marginBottom: 14,
    elevation: 3,
    borderWidth: 1.4,
    borderColor: '#fdebd0',
    shadowColor: '#e74c3c',
    shadowOpacity: 0.08,
    shadowRadius: 10
  },
  infoTitle: {
    fontWeight: '900',
    fontSize: 20,
    color: '#d35400',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 0.2
  },
  gridWrap: { margin: 3 },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#fff6f5',
    borderRadius: 13,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 7,
    minHeight: CARD_HEIGHT,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fae5e4'
  },
  typeIcon: {
    fontSize: 30,
    marginBottom: 2,
    marginTop: 1,
  },
  infoTypeLabel: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
    textAlign: 'center'
  },
  infoText: {
    color: '#34495e',
    fontSize: 14,
    marginBottom: 1,
    textAlign: 'center'
  },
  infoRef: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LoginScreen;
