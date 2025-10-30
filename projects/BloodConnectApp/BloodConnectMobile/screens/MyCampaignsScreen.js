// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import AppHeader from '../components/AppHeader';

const BACKEND = 'http://192.168.1.121:3001';

export default function MyCampaignsScreen({ navigation, route, appConfig }) {
  const email = route?.params?.email;
  const userName = route?.params?.name || (email ? email.split('@')[0] : '');
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (!email) return;
    fetch(`${BACKEND}/api/campaigns/by-organizer?email=${encodeURIComponent(email)}`)
      .then(res => res.json()).then(setCampaigns);
  }, [email]);

  async function loadResponses(camp) {
    setSelected(camp);
    const r = await fetch(`${BACKEND}/api/campaigns/${camp._id}/responses`);
    const json = await r.json();
    setResponses(json.responses || []);
  }

  return (
    <View style={{flex: 1, backgroundColor: "#fcfcfc"}}>
      <AppHeader
        navigation={navigation}
        route={route}
        appConfig={appConfig}
        email={email}
        userName={userName}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>My Campaigns</Text>
        <Text style={styles.subheader}>Tap a campaign to view responses</Text>
        <FlatList
          data={campaigns}
          contentContainerStyle={{ alignItems: "center", width:"100%" }}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.campCard} onPress={() => loadResponses(item)}>
              <View style={styles.campCardBar} />
              <Text style={styles.campCardTitle}>{item.title}</Text>
              <Text style={styles.campCardDates}>🗓 {item.startDate} – {item.endDate}</Text>
              <Text style={styles.campCardVenue}>📍 {item.venue}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.caption}>No campaigns found.</Text>}
        />
        {selected &&
          <View style={styles.respModalBox}>
            <Text style={styles.respModalTitle}>Responses for <Text style={styles.respTitleAccent}>{selected.title}</Text></Text>
            {responses.length === 0 && <Text style={styles.caption}>No participants yet.</Text>}
            {responses.map((r,ix) =>
              <Text key={ix} style={styles.respRow}>• <Text style={styles.respName}>{r.name}</Text> <Text style={styles.respEmail}>({r.email})</Text> <Text style={styles.respTime}>at {new Date(r.joined).toLocaleString()}</Text></Text>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={()=>{setSelected(null);setResponses([]);}}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fcfcfc', flexGrow: 1, minHeight: 520, alignItems: 'center'},
  header: { fontSize: 32, fontWeight: "800", color:"#c0392b", marginTop: 15, marginBottom: 1, letterSpacing: 0.5 },
  subheader: { fontSize: 16, color:"#e67e22", marginBottom: 16, textAlign:"center" },
  campCard: {
    minWidth:300, maxWidth:430, width:"100%",
    backgroundColor: '#fff', borderRadius: 16,
    marginVertical: 10, padding: 19,
    shadowColor:"#e67e22", shadowRadius:10, shadowOpacity:0.07, elevation:2
  },
  campCardBar: {
    width: 50, height: 5, borderRadius: 3,
    backgroundColor: '#27ae60',
    marginBottom: 9, marginLeft: -6
  },
  campCardTitle: { fontWeight: "bold", fontSize:19, color:"#c0392b", marginBottom:2, letterSpacing:0.1 },
  campCardDates: { color: "#229954", fontWeight:"700", fontSize: 14, marginBottom: 1 },
  campCardVenue: { color: "#a3701a", fontWeight: "700", fontSize: 13, marginBottom: 1 },
  caption: { color: "#6f6f6f", marginVertical: 7, fontSize:15, alignSelf:"center", textAlign:"center" },
  respModalBox: {
    backgroundColor: '#fafdff',
    borderRadius: 17,
    marginTop: 30,
    padding: 20, minWidth:260, maxWidth:530,
    width: Platform.OS==='web'?'48%':'93%',
    shadowColor: "#2ecc71", shadowOffset: {width:0, height:3}, shadowOpacity:0.09, shadowRadius:13, elevation:7,
    borderWidth:1, borderColor:"#def4e3"
  },
  respModalTitle: { fontWeight:"bold", color:'#229954', fontSize:17, marginBottom:9, letterSpacing:0.26, textAlign:"center" },
  respTitleAccent: { color:"#e74c3c", fontWeight:"bold" },
  respRow: { color:"#005f1c", fontSize:14, letterSpacing:0.05, marginVertical:2 },
  respName: { color:"#229954", fontWeight:"bold" },
  respEmail: { color:"#b44615" },
  respTime: { color:"#333", fontStyle:"italic", fontSize:12, marginLeft:4 },
  closeBtn: { backgroundColor:'#e74c3c', borderRadius:8, marginTop:11, paddingVertical:7, paddingHorizontal:18, alignSelf:'center' },
  closeText: { color:'#fff', fontWeight:'bold', fontSize:16, letterSpacing:0.18 }
});
