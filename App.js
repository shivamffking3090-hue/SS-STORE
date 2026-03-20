// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import LoginScreen from './src/screens/Auth/LoginScreen';
import SignupScreen from './src/screens/Auth/SignupScreen';
import UserDashboard from './src/screens/User/UserDashboard';
import DeveloperDashboard from './src/screens/Developer/DeveloperDashboard';
import AdminDashboard from './src/screens/Admin/AdminDashboard';
import AppDetailsScreen from './src/screens/User/AppDetailsScreen';
import UploadAppScreen from './src/screens/Developer/UploadAppScreen';
import PendingAppsScreen from './src/screens/Admin/PendingAppsScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = ({ userRole }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Developer') {
            iconName = 'developer-mode';
          } else if (route.name === 'Admin') {
            iconName = 'admin-panel-settings';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={UserDashboard} options={{ title: 'SS STORE' }} />
      {(userRole === 'developer' || userRole === 'admin') && (
        <Tab.Screen name="Developer" component={DeveloperDashboard} />
      )}
      {userRole === 'admin' && (
        <Tab.Screen name="Admin" component={AdminDashboard} />
      )}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (authenticatedUser) => {
      setUser(authenticatedUser);
      if (authenticatedUser) {
        const userDoc = await firestore()
          .collection('users')
          .doc(authenticatedUser.uid)
          .get();
        if (userDoc.exists) {
          setUserRole(userDoc.data().role);
        }
      }
      setLoading(false);
    });
    return subscriber;
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen} 
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="HomeTabs" 
              options={{ headerShown: false }}
            >
              {props => <HomeTabs {...props} userRole={userRole} />}
            </Stack.Screen>
            <Stack.Screen 
              name="AppDetails" 
              component={AppDetailsScreen}
              options={{ title: 'App Details' }}
            />
            <Stack.Screen 
              name="UploadApp" 
              component={UploadAppScreen}
              options={{ title: 'Upload App' }}
            />
            <Stack.Screen 
              name="PendingApps" 
              component={PendingAppsScreen}
              options={{ title: 'Pending Apps' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
