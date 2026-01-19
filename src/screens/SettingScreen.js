import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, TextInput, Switch, List, Button, Text, Divider } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';

const renderNotificationSwitch = (value, onValueChange) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    color={AppTheme.colors.primary}
  />
);

const renderBiometricSwitch = (value, onValueChange) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    color={AppTheme.colors.primary}
  />
);

export default function SettingScreen({ navigation }) {
  const [name, setName] = useState('John Doe');
  const [phone, setPhone] = useState('+1 234 567 8900');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('10001');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleUpdateDetails = () => {
    // Handle update user details action
    console.log('Updating user details:', { name, phone, city, state, zip });
    // Here you would typically save to storage/API
  };

  const handleLostCase = () => {
    // Handle lost case action
    console.log('Lost Case button pressed');
  };

  const handleLogout = () => {
    // Navigate to Login screen in parent Stack Navigator
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <AppLayout>
      <AppHeader title="Setting"  />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>User Details</Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="NAME"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              contentStyle={styles.inputContent}
              dense
            />
            
            <TextInput
              label="PHONE"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              contentStyle={styles.inputContent}
              dense
            />
            
            <TextInput
              label="CITY"
              value={city}
              onChangeText={setCity}
              mode="outlined"
              style={styles.input}
              contentStyle={styles.inputContent}
              dense
            />
            
            <View style={styles.row}>
              <TextInput
                label="STATE"
                value={state}
                onChangeText={setState}
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
                contentStyle={styles.inputContent}
                dense
              />
              
              <TextInput
                label="ZIP"
                value={zip}
                onChangeText={setZip}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
                contentStyle={styles.inputContent}
                dense
              />
            </View>
            
            <Button
              mode="contained"
              onPress={handleUpdateDetails}
              style={styles.updateButton}
              buttonColor={AppTheme.colors.primary}
              compact
            >
              Update Details
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="ENABLE NOTIFICATION"
              right={() => renderNotificationSwitch(notificationsEnabled, setNotificationsEnabled)}
              titleStyle={styles.switchTitle}
              style={styles.listItem}
            />
            
            <List.Item
              title="ENABLE BIOMETRIC AUTHENTICATION"
              right={() => renderBiometricSwitch(biometricEnabled, setBiometricEnabled)}
              titleStyle={styles.switchTitle}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLostCase}
          style={styles.lostCaseButton}
          buttonColor={AppTheme.colors.primary}
          textColor={AppTheme.colors.surface}
          compact
        >
          PUNCH LOS Case
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={AppTheme.colors.primary}
          textColor={AppTheme.colors.surface}
          icon="logout"
          compact
        >
          Logout
        </Button>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.s,
    paddingBottom: AppTheme.spacing.md,
  },
  card: {
    marginBottom: AppTheme.spacing.sm,
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  cardContent: {
    padding: AppTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.xs,
  },
  divider: {
    marginBottom: AppTheme.spacing.sm,
  },
  input: {
    marginBottom: AppTheme.spacing.xs,
    backgroundColor: AppTheme.colors.surface,
  },
  listItem: {
    paddingVertical: AppTheme.spacing.xs,
  },
  inputContent: {
    fontSize: AppTheme.typography.body.fontSize,
  },
  row: {
    flexDirection: 'row',
    gap: AppTheme.spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  switchTitle: {
    fontSize: AppTheme.typography.body.fontSize,
    fontWeight: '500',
    color: AppTheme.colors.onSurface,
  },
  updateButton: {
    marginTop: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
  },
  lostCaseButton: {
    marginTop: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
  },
  logoutButton: {
    marginTop: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
  },
});
