import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, TextInput, Switch, List, Button, Text, Divider } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import authService from '../services/authService';
import userService from '../services/userService';

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    // Load user data from storage
    const loadUserData = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setPhone(user.mobile_number || '');
        setUsername(user.user_name || user.email || '');
        setUserId(user.id);
      }
    };
    loadUserData();
  }, []);

  const handleUpdateDetails = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('First name and last name are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const result = await userService.updateUser(userId, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      mobile_number: phone.trim(),
    });

    setLoading(false);

    if (!result.success) {
      const errorMsg =
        result?.error ||
        result?.data?.message ||
        result?.data?.error ||
        'Failed to update user details. Please try again.';
      setErrorMessage(errorMsg);
      return;
    }

    // Success - show alert and clear error
    setErrorMessage('');
    Alert.alert('Success', result.message || 'User details updated successfully', [
      { text: 'OK' },
    ]);
  };

  const handleLostCase = () => {
    navigation.getParent()?.navigate('PunchLosCase');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppLayout>
      <AppHeader title="Settings 1.0.1"  />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>User Details</Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="FIRST NAME"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={styles.input}
              contentStyle={styles.inputContent}
              dense
            />
            
            <TextInput
              label="LAST NAME"
              value={lastName}
              onChangeText={setLastName}
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
              label="USERNAME"
              value={username}
              mode="outlined"
              style={styles.input}
              contentStyle={styles.inputContent}
              dense
              editable={false}
              disabled
            />
            
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            
            <Button
              mode="contained"
              onPress={handleUpdateDetails}
              style={styles.updateButton}
              buttonColor={AppTheme.colors.primary}
              textColor={AppTheme.colors.surface}
              icon="account-edit"
              loading={loading}
              disabled={loading}
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
          icon="file-alert"
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
  errorText: {
    color: AppTheme.colors.error,
    fontSize: AppTheme.typography.body.fontSize,
    marginBottom: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.xs,
  },
  updateButton: {
    marginTop: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.roundness * 2,
  },
  lostCaseButton: {
    marginTop: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.roundness * 2,
  },
  logoutButton: {
    marginTop: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.roundness * 2,
  },
});
