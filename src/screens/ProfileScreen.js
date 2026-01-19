import React from 'react';
import { View } from 'react-native';
import { Text, Avatar } from 'react-native-paper';

export default function ProfileScreen() {
  return (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <Avatar.Text size={80} label="BR" />
      <Text variant="titleLarge" style={{ marginTop: 10 }}>
        Profile
      </Text>
    </View>
  );
}
