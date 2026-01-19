import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CasesStack from './src/navigation/CasesStack';
import UnsubmittedCasesScreen from './src/screens/UnsubmittedCasesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingScreen from './src/screens/SettingScreen';
import { AppTheme } from './src/theme/theme';

enableScreens();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ICON_MAP: { [key: string]: string } = {
  Home: 'home',
  Cases: 'folder-multiple',
  'Unsubmitted Cases': 'file-document-edit-outline',
  History: 'history',
  Setting: 'cog',
};

const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
  const iconName = ICON_MAP[routeName] || 'help-circle';
  return <Icon name={iconName} size={size} color={color} />;
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: '#800000',
          borderTopWidth: 0,
          elevation: 8,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cases" component={CasesStack} />
      <Tab.Screen 
        name="Unsubmitted Cases" 
        component={UnsubmittedCasesScreen}
        options={{
          tabBarLabel: 'Unsubmitted',
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={AppTheme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
