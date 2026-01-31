import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { AppTheme } from '../theme/theme';
import authService from '../services/authService';

const logoImage = require('../assets/logo.png');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Basic validation
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const result = await authService.login(username, password);

    setLoading(false);

    if (!result.success) {
      // Prefer backend message if available
      const messageFromServer =
        result?.error ||
        result?.message ||
        result?.data?.message ||
        'Login failed. Please check your credentials.';

      setErrorMessage(messageFromServer);
      return;
    }

    // On success, navigate to main tabs
    navigation.replace('MainTabs');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoImageContainer}>
          <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
        </View>
        {/* <Text style={styles.appVersion}>Version {appJson.version || '1.0.0'}</Text> */}
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Email"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.loginButton}
          buttonColor={AppTheme.colors.primary}
          textColor="#FFFFFF"
          labelStyle={styles.loginButtonLabel}
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef5f8',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AppTheme.spacing.xl,
    paddingTop: AppTheme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  logoImageContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: AppTheme.typography.h1.fontSize,
    fontWeight: AppTheme.typography.h1.fontWeight,
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.xs,
  },
  appVersion: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
  },
  errorText: {
    color: AppTheme.colors.error,
    marginBottom: AppTheme.spacing.sm,
  },
  loginButton: {
    marginTop: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.roundness,
  },
  loginButtonLabel: {
    fontSize: AppTheme.typography.h4.fontSize,
    fontWeight: '600',
  },
});
