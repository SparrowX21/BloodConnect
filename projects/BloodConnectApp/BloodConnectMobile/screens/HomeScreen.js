// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BUTTON_HEIGHT = 90;
const BUTTON_GAP = 20;
const BUTTON_RADIUS = 18;

const HomeScreen = ({ navigation, route, appConfig }) => {
  const email = route?.params?.email;
  const [userProfile, setUserProfile] = useState({});
  const name = userProfile?.name || (email ? email.split('@')[0] : '');

  useEffect(() => {
    if (!email) return;
    fetch(`${appConfig.serverURL ? `http://${appConfig.serverURL}` : 'http://192.168.1.121:3001'}/api/get-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) setUserProfile(result.user);
      });
  }, [email, appConfig.serverURL]);

  const buttons = (appConfig.menu ? appConfig.menu.map(item => ({
    ...item,
    onPress: () => navigation.navigate(item.target, { email })
  })) : [
    { title: 'Request Blood', icon: 'blood-bag', onPress: () => navigation.navigate('RequestBloodScreen', { email }) },
    // ...add more buttons as needed
  ]);

  const screenWidth = Dimensions.get('window').width;
  const BUTTON_WIDTH = (screenWidth - 2 * 32 - BUTTON_GAP) / 2;

  const renderButtonRows = () => {
    let rows = [];
    for (let i = 0; i < buttons.length; i += 2) {
      rows.push(
        <View style={styles.buttonRow} key={`row${i}`}>
          {[0,1].map(j => {
             const btn = buttons[i+j];
             if (!btn) return <View key={j} style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT, marginLeft: j ? BUTTON_GAP/2 : 0, marginRight: !j ? BUTTON_GAP/2 : 0 }} />;
             return (
               <TouchableOpacity
                 key={j}
                 style={[
                   styles.button,
                   {
                     width: BUTTON_WIDTH,
                     height: BUTTON_HEIGHT,
                     marginLeft: j ? BUTTON_GAP/2 : 0,
                     marginRight: !j ? BUTTON_GAP/2 : 0
                   }
                 ]}
                 activeOpacity={0.86}
                 onPress={btn.onPress}>
                 <View style={styles.iconCircle}>
                   <MaterialCommunityIcons name={btn.icon} size={38} color="#fff" />
                 </View>
                 <Text style={styles.buttonText}>{btn.title}</Text>
               </TouchableOpacity>
             );
           })}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fbfbfa' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={appConfig.logo} style={styles.logo} />
        <Text style={styles.heroWelcome}>
          <Text style={styles.brand}>BloodConnect</Text>
          {name ? ` · Welcome, ${name}` : ''}
        </Text>
        <Text style={styles.heroSubtitle}>
          <Text style={styles.orange}>Let’s </Text>
          <Text style={styles.green}>change </Text>
          <Text style={styles.gold}>Lives </Text>
          <Text style={styles.orange}>one </Text>
          <Text style={styles.drop}>Drop</Text>
          <Text style={styles.orange}> at a time</Text>
        </Text>
        <View style={styles.gridContainer}>
          {renderButtonRows()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    backgroundColor: '#fbfbfa',
    alignItems: 'center',
    flexGrow: 1
  },
  logo: {
    height: 114,
    width: 114,
    borderRadius: 28,
    borderWidth: 5,
    borderColor: '#f7b731',
    marginTop: Platform.OS === 'web' ? 30 : 46,
    marginBottom: 15,
    alignSelf: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 4px 16px #fbeee0'
  },
  heroWelcome: {
    fontSize: 34,
    fontWeight: '900',
    color: '#d35400',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 2,
    textAlign: "center",
  },
  brand: {
    color: '#e74c3c',
    fontWeight: '900',
    fontSize: 36,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 26,
    letterSpacing: 0.4,
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
  gridContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 17,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: BUTTON_RADIUS,
    justifyContent: 'center',
    elevation: 3,
    paddingHorizontal: 8,
    shadowColor: '#c0392b',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    transition: 'box-shadow 0.25s, transform 0.15s',
  },
  iconCircle: {
    backgroundColor: '#fa8072',
    padding: 12,
    borderRadius: 999,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1.1,
    flexShrink: 1
  }
});

export default HomeScreen;
