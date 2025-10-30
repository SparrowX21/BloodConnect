// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LOGO_SIZE = 44;
const ICON_SIZE = 32;

const AppHeader = ({ userName, navigation, appConfig, email, route }) => {
  let emailParam = email;
  if (!emailParam && route && route.params && route.params.email) {
    emailParam = route.params.email;
  }
  const isHomeScreen = route && route.name === 'HomeScreen';
  const firstName = userName ? userName.split(' ')[0] : "";

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View style={styles.side}>
          {appConfig?.logo ? (
            <Image source={appConfig.logo} style={styles.logo} />
          ) : <View style={{ width: LOGO_SIZE, height: LOGO_SIZE }} />}
        </View>
        <Text style={styles.title}>
          {appConfig?.appName || "BloodConnect"}
        </Text>
        <View style={styles.side}>
          {navigation && !isHomeScreen ? (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() =>
                emailParam
                  ? navigation.navigate('HomeScreen', { email: emailParam })
                  : navigation.navigate('LoginScreen')
              }
              accessibilityLabel="Home"
            >
              <MaterialCommunityIcons name="home" size={ICON_SIZE} color="#e74c3c" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: ICON_SIZE + 12, height: ICON_SIZE }} />
          )}
        </View>
      </View>
      {/* Welcome and Slogan */}
      <View style={styles.welcomeMsgContainer}>
        {firstName ? (
          <Text style={styles.welcomeMsg}>
            Welcome, <Text style={styles.welcomeName}>{firstName}</Text>
          </Text>
        ) : null}
        <Text style={styles.sloganLine}>
          <Text style={styles.sloganStart}>Let’s </Text>
          <Text style={styles.sloganGreen}>change </Text>
          <Text style={styles.sloganGold}>Lives </Text>
          <Text style={styles.sloganDrop}>one <Text style={styles.dropWord}>Drop</Text></Text>
          <Text style={styles.sloganStart}> at a time</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    elevation: 4,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 19,
    paddingBottom: 12,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  side: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1.5,
    color: '#d35400'
  },
  homeButton: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#fdeaea',
  },
  welcomeMsgContainer: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 0,
    width: '100%',
  },
  welcomeMsg: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b5123',
    marginBottom: -1,
    letterSpacing: 0.25,
    textShadowColor: '#e1ffd5',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeName: {
    color: '#e74c3c',
    fontWeight: 'bold',
    letterSpacing: 0.3,
    fontSize: 18,
  },
  sloganLine: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 1,
    textShadowColor: '#ffe8a1',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 7,
  },
  sloganStart: {
    color: '#de6806',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sloganGreen: {
    color: '#229954', 
    fontWeight: 'bold',
    letterSpacing: 0.2,
    textShadowColor: '#bbf2d2',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 7,
  },
  sloganGold: {
    color: '#cfa104',
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: '#ffe691',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
  },
  sloganDrop: {
    color: '#d35400',
    fontWeight: 'bold',
  },
  dropWord: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 21,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textShadowColor: '#ffdeda',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
});

export default AppHeader;
