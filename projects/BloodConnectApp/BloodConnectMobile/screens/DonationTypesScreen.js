import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeader';

const DonationTypesScreen = ({ navigation }) => (
  <>
    <AppHeader userName={null} />
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Blood Donation Types & Eligibility</Text>

      <Text style={styles.sectionTitle}>Whole Blood Donation</Text>
      <Text style={styles.content}>
        • Every 56 days, up to 6 times/year{'\n'}
        • Must be in good health and feeling well{'\n'}
        • At least 16 years old (most states){'\n'}
        • Must weigh at least 110 lbs
      </Text>

      <Text style={styles.sectionTitle}>Power Red Donation</Text>
      <Text style={styles.content}>
        • Every 112 days, up to 3 times/year{'\n'}
        • Must be in good health and feeling well{'\n'}
        • Males: At least 17, 5'1", 130 lbs{'\n'}
        • Females: At least 19, 5'3", 150 lbs
      </Text>

      <Text style={styles.sectionTitle}>Platelet Donation</Text>
      <Text style={styles.content}>
        • Every 7 days, up to 24 times/year{'\n'}
        • Must be in good health and feeling well{'\n'}
        • At least 17 years old (most states){'\n'}
        • Must weigh at least 110 lbs
      </Text>

      <Text style={styles.sectionTitle}>AB Elite Plasma Donation</Text>
      <Text style={styles.content}>
        • Every 28 days, up to 13 times/year{'\n'}
        • Must have AB blood type{'\n'}
        • Must be in good health and feeling well{'\n'}
        • At least 17 years old{'\n'}
        • Must weigh at least 110 lbs
      </Text>

      <Text style={styles.sectionTitle}>Common Restrictions</Text>
      <Text style={styles.content}>
        • If unwell on donation day, reschedule{'\n'}
        • Some medications/conditions require waiting periods{'\n'}
        • Recent malaria region travel: defer for 3 years{'\n'}
        • Low iron: iron levels should be normal before donating{'\n'}
        {'\n'}Final eligibility is determined at donation center.
      </Text>

      <Text style={styles.reference}>
        Source: American Red Cross{'\n'}
        https://www.redcrossblood.org/donate-blood/how-to-donate/eligibility-requirements.html
      </Text>
    </ScrollView>
  </>
);

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#d35400', textAlign: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#e74c3c', marginTop: 18, marginBottom: 4 },
  content: { fontSize: 15, color: '#222', marginBottom: 10, paddingLeft: 12 },
  reference: { fontSize: 12, color: '#888', paddingTop: 25, textAlign: 'center' }
});

export default DonationTypesScreen;
