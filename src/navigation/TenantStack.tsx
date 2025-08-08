import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import SearchScreen from '../screens/tenant/SearchScreen';
import ShortlistScreen from '../screens/tenant/ShortlistScreen';
import RequestsScreen from '../screens/tenant/RequestsScreen';
import PropertyDetailScreen from '../screens/tenant/PropertyDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SearchStack = () => {
  const { signOut } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Search Properties',
          headerRight: () => (
            <TouchableOpacity onPress={signOut}>
              <Text style={{ color: '#FF3B30', fontSize: 16, marginRight: 15 }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen}
        options={{ title: 'Property Details' }}
      />
    </Stack.Navigator>
  );
};

const ShortlistStack = () => {
  const { signOut } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ShortlistScreen" 
        component={ShortlistScreen}
        options={{
          title: 'Shortlist',
          headerRight: () => (
            <TouchableOpacity onPress={signOut}>
              <Text style={{ color: '#FF3B30', fontSize: 16, marginRight: 15 }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen}
        options={{ title: 'Property Details' }}
      />
    </Stack.Navigator>
  );
};

const TenantStack = () => {
  const { signOut } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'SearchStack') {
            return (
              <Image 
                source={require('../../assets/search-icon.png')}
                style={{ 
                  width: size, 
                  height: size,
                  tintColor: color,
                }}
              />
            );
          } else if (route.name === 'ShortlistStack') {
            return (
              <Image 
                source={require('../../assets/heart.png')}
                style={{ 
                  width: size, 
                  height: size,
                  tintColor: color,
                }}
              />
            );
          } else if (route.name === 'Requests') {
            return (
              <Image 
                source={require('../../assets/google-docs.png')}
                style={{ 
                  width: size, 
                  height: size,
                  tintColor: color,
                }}
              />
            );
          }
        },
      })}
    >
      <Tab.Screen 
        name="SearchStack" 
        component={SearchStack}
        options={{ headerShown: false, title: 'Search' }}
      />
      <Tab.Screen 
        name="ShortlistStack"  
        component={ShortlistStack}  
        options={{ headerShown: false, title: 'Shortlist' }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestsScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={signOut}>
              <Text style={{ color: '#FF3B30', fontSize: 16, marginRight: 15 }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TenantStack;