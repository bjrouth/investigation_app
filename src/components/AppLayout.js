import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTheme } from '../theme/theme';

export default function AppLayout({ children }) {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#800000"
      />

      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.container}>
          {children}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    paddingTop: 0,
  },
  container: {
    flex: 1,
    padding: AppTheme.spacing.s,
    paddingTop: 0,
    backgroundColor: AppTheme.colors.background,
  },
});
