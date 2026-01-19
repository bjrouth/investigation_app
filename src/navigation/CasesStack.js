import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CasesScreen from '../screens/CasesScreen';
import CaseList2Screen from '../screens/CaseList2Screen';
import ProcessApplicationScreen from '../screens/ProcessApplicationScreen';

const Stack = createStackNavigator();

export default function CasesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CasesList" component={CasesScreen} />
      <Stack.Screen name="CaseList2" component={CaseList2Screen} />
      <Stack.Screen name="ProcessApplication" component={ProcessApplicationScreen} />
    </Stack.Navigator>
  );
}
