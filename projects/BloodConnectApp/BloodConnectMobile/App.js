// Author: Armaan Gugnani, Independence High School, Frisco, Texas

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import whichApp from './config/whichApp';
import bloodConnect from './config/bloodConnect';
import foodConnect from './config/foodConnect';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import DonateScreen from './screens/DonateScreen';
import ProfileScreen from './screens/ProfileScreen';
import BloodBankResultsScreen from './screens/BloodBankResultsScreen';
import RequestBloodScreen from './screens/RequestBloodScreen';
import MyRequestsScreen from './screens/MyRequestsScreen';
import RespondToRequestsScreen from './screens/RespondToRequestsScreen';
import DonationTypesScreen from './screens/DonationTypesScreen';
import CampaignScreen from './screens/CampaignScreen';
import MyCampaignsScreen from './screens/MyCampaignsScreen';

const configMap = {
  bloodConnect,
  foodConnect,
};
const appConfig = configMap[whichApp];

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen">
          {props => <LoginScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="RegisterScreen">
          {props => <RegisterScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="HomeScreen">
          {props => <HomeScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="DonateScreen">
          {props => <DonateScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="ProfileScreen">
          {props => <ProfileScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="BloodBankResultsScreen">
          {props => <BloodBankResultsScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="RequestBloodScreen">
          {props => <RequestBloodScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="MyRequestsScreen">
          {props => <MyRequestsScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="RespondToRequestsScreen">
          {props => <RespondToRequestsScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="DonationTypesScreen">
          {props => <DonationTypesScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="CampaignScreen">
          {props => <CampaignScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
        <Stack.Screen name="MyCampaignsScreen">
          {props => <MyCampaignsScreen {...props} appConfig={appConfig} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
