// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import AppHeader from '../components/AppHeader';
import { getUserLocation } from '../utils/getLocation';

const BACKEND = 'http://192.168.1.121:3001';

let DateTimePicker;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export default function CampaignScreen({ navigation, route, appConfig }) {
  const email = route?.params?.email || '';
  const name = route?.params?.name || email.split('@')[0] || '';
  const currentUser = { name, email };

  const [form, setForm] = useState({
    title: '', startDate: '', endDate: '', time: '',
    venue: '', incentive: '', message: ''
  });
  const [created, setCreated] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [responses, setResponses] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    getUserLocation().then(loc => {
      if (loc) {
        fetch(`${BACKEND}/api/campaigns?lat=${loc.lat}&lng=${loc.lng}`)
          .then(res => res.json())
          .then(list => setNearby(list));
      }
    });
  }, []);

  async function handleCreate() {
    if (!form.title || !form.startDate || !form.endDate || !form.time || !form.venue) {
      Alert.alert('Please fill all required fields.');
      return;
    }
    const loc = await getUserLocation();
    if (!loc) return;
    fetch(`${BACKEND}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lat: loc.lat, lng: loc.lng, organizer: currentUser })
    })
    .then(res => res.json())
    .then(data => {
      setCampaign(data.campaign);
      setCreated(true);
    })
    .catch(e => Alert.alert("Failed to create campaign!"));
  }

  async function handleJoin(campaignId) {
    const loc = await getUserLocation();
    if (!loc) return;
    await fetch(`${BACKEND}/api/campaigns/${campaignId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentUser.name, email: currentUser.email, lat: loc.lat, lng: loc.lng })
    });
    Alert.alert("You've joined the campaign! The organizer will be notified.");
    refreshNearby();
  }

  async function fetchResponses() {
    if (!campaign || !campaign._id) return;
    const r = await fetch(`${BACKEND}/api/campaigns/${campaign._id}/responses`);
    const data = await r.json();
    setResponses(data.responses || []);
  }
  useEffect(() => { if (created && campaign) fetchResponses(); }, [created, campaign]);

  async function refreshNearby() {
    getUserLocation().then(loc => {
      if (loc) {
        fetch(`${BACKEND}/api/campaigns?lat=${loc.lat}&lng=${loc.lng}`)
          .then(res => res.json())
          .then(list => setNearby(list));
      }
    });
  }

  function makeSocialMsg(campaign) {
    return `🎉 Blood Donation Campaign: "${campaign.title}" 🩸\nDate: ${campaign.startDate} to ${campaign.endDate}\nVenue: ${campaign.venue}\nTiming: ${campaign.time}\n${campaign.incentive ? 'Incentive: '+campaign.incentive+'\n' : ''}${campaign.message}\nJoin & save lives! #DonateBlood #BloodConnect`;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#faf9f6' }}>
      <AppHeader
        navigation={navigation}
        appConfig={appConfig}
        email={email}
        route={route}
        userName={name}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Run a Blood Donation Campaign</Text>
        {!created && (
          <View style={styles.card}>
            <Text style={styles.subheader}>Create a New Campaign</Text>
            <TextInput style={styles.input} placeholder="Campaign Title" value={form.title} onChangeText={v=>setForm({...form,title:v})}/>
            {Platform.OS === 'web' ? (
              <TextInput style={styles.input} placeholder="Start Date" value={form.startDate} type="date" onFocus={e => { e.target.type = 'date'; }} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.input}>
                  <Text>{form.startDate ? `Start Date: ${form.startDate}` : "Select Start Date"}</Text>
                </TouchableOpacity>
                {showStartPicker && DateTimePicker && (
                  <DateTimePicker
                    mode="date"
                    value={form.startDate ? new Date(form.startDate) : new Date()}
                    onChange={(event, date) => {
                      setShowStartPicker(false);
                      if (date) setForm(f => ({ ...f, startDate: date.toISOString().split('T')[0] }));
                    }}
                  />
                )}
              </>
            )}
            {Platform.OS === 'web' ? (
              <TextInput style={styles.input} placeholder="End Date" value={form.endDate} type="date" onFocus={e => { e.target.type = 'date'; }} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.input}>
                  <Text>{form.endDate ? `End Date: ${form.endDate}` : "Select End Date"}</Text>
                </TouchableOpacity>
                {showEndPicker && DateTimePicker && (
                  <DateTimePicker
                    mode="date"
                    value={form.endDate ? new Date(form.endDate) : new Date()}
                    onChange={(event, date) => {
                      setShowEndPicker(false);
                      if (date) setForm(f => ({ ...f, endDate: date.toISOString().split('T')[0] }));
                    }}
                  />
                )}
              </>
            )}
            <TextInput style={styles.input} placeholder="Time (e.g. 10am-3pm)" value={form.time} onChangeText={v=>setForm({...form,time:v})}/>
            <TextInput style={styles.input} placeholder="Venue (address)" value={form.venue} onChangeText={v=>setForm({...form,venue:v})}/>
            <TextInput style={styles.input} placeholder="Incentive (optional)" value={form.incentive} onChangeText={v=>setForm({...form,incentive:v})}/>
            <TextInput style={styles.input} placeholder="Short message (optional)" value={form.message} multiline onChangeText={v=>setForm({...form,message:v})}/>
            <Button title="Create Campaign" color="#e74c3c" onPress={handleCreate} />
          </View>
        )}
        {created && campaign && (
          <View style={styles.card}>
            <Text style={[styles.subheader,{fontWeight:'bold'}]}>Campaign Created!</Text>
            <Text style={styles.details}>Title: {campaign.title}</Text>
            <Text style={styles.details}>Date: {campaign.startDate} to {campaign.endDate}</Text>
            <Text style={styles.details}>Timing: {campaign.time}</Text>
            <Text style={styles.details}>Venue: {campaign.venue}</Text>
            {!!campaign.incentive && <Text style={styles.details}>Incentive: {campaign.incentive}</Text>}
            {!!campaign.message && <Text style={styles.details}>Note: {campaign.message}</Text>}
            <TouchableOpacity style={styles.cmpBtn} onPress={fetchResponses}>
              <Text style={styles.cmpBtnText}>Refresh Responses</Text>
            </TouchableOpacity>
            <Text style={styles.respHeader}>Accepted Participants:</Text>
            {responses.length === 0 && <Text style={styles.details}>No participants yet.</Text>}
            {responses.map((r,ix) => (
              <Text key={ix} style={styles.details}>• {r.name} ({r.email}) at {new Date(r.joined).toLocaleString()}</Text>
            ))}
            <Text style={{marginTop:14}}>For Social Media:</Text>
            <View style={styles.socialMsgBox}>
              <Text selectable style={styles.socialMsg}>{makeSocialMsg(campaign)}</Text>
            </View>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.subheader}>Active Campaigns Near You</Text>
          {nearby.map(c => {
            const hasResponded = c.responses?.some(r => r.email === currentUser.email);
            return (
              <View key={c._id} style={styles.nearbyCmp}>
                <Text style={styles.details}>
                  <Text style={{fontWeight:'bold'}}>{c.title}</Text> by {c.organizer?.name || "?"} | {c.venue}
                </Text>
                <Text style={styles.details}>Date: {c.startDate} to {c.endDate}, {c.time}</Text>
                {!!c.incentive && <Text style={styles.details}>Incentive: {c.incentive}</Text>}
                {!!c.message && <Text style={styles.details}>Note: {c.message}</Text>}
                {hasResponded ? (
                  <Text style={[styles.cmpBtnText, { color: '#27ae60', marginTop: 8 }]}>You have responded</Text>
                ) : (
                  <TouchableOpacity style={styles.cmpBtn} onPress={()=>handleJoin(c._id)}>
                    <Text style={styles.cmpBtnText}>I Will Join</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 26, alignItems: 'center', flexGrow: 1 },
  header: { fontWeight: 'bold', fontSize: 25, color: '#d35400', marginVertical: 14, textAlign:'center' },
  subheader: { fontWeight:'bold', fontSize: 17, marginBottom: 9, color:'#e74c3c' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 30, minWidth:300, maxWidth:650, width:'100%', elevation:2 },
  input: { backgroundColor:'#f5f5f5', borderRadius:7, marginBottom:10, fontSize:15, paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor:'#dedede' },
  details: { fontSize:14.5, color:'#2d2d2d', marginVertical:2 },
  cmpBtn: { backgroundColor:'#e74c3c', borderRadius:10, padding:10, alignItems:'center', marginTop:10, marginBottom:2 },
  cmpBtnText: { color:'#fff', fontWeight:'bold', fontSize:15 },
  respHeader: { fontWeight:'bold', fontSize:15, color:'#27ae60', marginTop:18, marginBottom:6 },
  nearbyCmp: { backgroundColor:'#f6dad2', borderRadius:10, padding:13, marginBottom:10, elevation:1 },
  socialMsgBox: { backgroundColor:'#fffbe6', borderRadius:8, marginTop:6, padding:7, borderWidth:1, borderColor:'#ead281' },
  socialMsg: { fontSize:14, color:'#6e1a1a', fontFamily:Platform.OS==='web'?'monospace':'monospace' }
});
