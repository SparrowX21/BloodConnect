export default {
  appName: "FoodConnect",
  logo: require('../assets/food_logo.png'),
  brandColor: "#27ae60",
  welcomeText: "Welcome to FoodConnect",
  tagline: "Let's end hunger, one meal at a time",
  infoTitle: "Types of Food Donation",
  infoSource: "Food Bank Association\nfoodbank.org/donate-food/types",
  serverURL: "192.168.1.122:3001",
  infoTypes: [
    {
      icon: '🍎',
      label: 'Fresh Fruit',
      description: 'Donate fresh uncut fruit for healthy snacks.'
    },
    {
      icon: '🥫',
      label: 'Canned Goods',
      description: 'Stable canned food accepted year round.'
    },
    {
      icon: '🥖',
      label: 'Bakery Items',
      description: 'Bread and baked goods, 24h shelf life.'
    },
    {
      icon: '🥕',
      label: 'Vegetables',
      description: 'Uncut vegetables suitable for donation.'
    }
  ],
  // ...other app-specific config
};
