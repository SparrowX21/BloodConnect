// Author: Armaan Gugnani, Independence High School, Frisco, Texas

export default {
  appName: "BloodConnect",
  logo: require('../assets/logo.png'),
  brandColor: "#e74c3c",
  welcomeText: "Welcome to BloodConnect",
  tagline: "Let’s change Lives one Drop at a time",
  infoTitle: "Types of Blood Donation",
  infoSource: "American Red Cross\nredcrossblood.org/donate-blood/how-to-donate/eligibility-requirements.html",
  serverURL: "192.168.1.121:3001",
  infoTypes: [
    {
      icon: '💧',
      label: 'Whole Blood',
      description: `Every 56 days, up to 6x/year\nIn good health, ≥16 yrs, ≥110 lbs`
    },
    {
      icon: '🩸',
      label: 'Power Red',
      description: `Every 112 days, up to 3x/year\nMale: ≥17 yr, 5'1", 130 lbs\nFemale: ≥19 yr, 5'3", 150 lbs`
    },
    {
      icon: '🩹',
      label: 'Platelets',
      description: `Every 7 days, up to 24x/year\nGood health, ≥17 yrs, ≥110 lbs`
    },
    {
      icon: '🧪',
      label: 'AB Elite Plasma',
      description: `Every 28 days, up to 13x/year\nMust be AB blood type, good health, ≥17 yrs, ≥110 lbs`
    }
  ],
  menu: [
    {
      title: 'Request Blood',
      icon: 'blood-bag',
      target: 'RequestBloodScreen'
    },
    {
      title: 'Respond to Requests',
      icon: 'account-check',
      target: 'RespondToRequestsScreen'
    },
    {
      title: 'My Requests',
      icon: 'clipboard-list-outline',
      target: 'MyRequestsScreen'
    },
    {
      title: 'My Profile',
      icon: 'account-circle',
      target: 'ProfileScreen'
    },
    {
      title: 'Blood Banks',
      icon: 'hospital-building',
      target: 'BloodBankResultsScreen'
    },
    {
      title: 'Donate',
      icon: 'hand-heart',
      target: 'DonateScreen'
    },
    {
      title: 'Create Campaign',
      icon: 'bullhorn',
      target: 'CampaignScreen'
    },
    {
      title: 'My Campaigns',
      icon: 'format-list-bulleted',
      target: 'MyCampaignsScreen'
    }
  ]
};
