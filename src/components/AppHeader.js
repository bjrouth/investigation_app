import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppTheme } from '../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const renderIcon = (iconName, color) => (
  <Icon name={iconName} size={24} color={color} />
);

export default function AppHeader({ title, icon = 'menu', onIconPress, back, navigation, totalCases, showTotalCases = false, rightButton, rightButtonText, onRightButtonPress }) {
  return (
    <Appbar.Header style={styles.header} mode="center-aligned">
      <View style={styles.leftContainer}>
        {back ? (
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        ) : (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onIconPress}
            activeOpacity={0.7}
          >
            {renderIcon(icon, '#FFFFFF')}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        {rightButton ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightButtonPress}
            activeOpacity={0.7}
          >
            <Text style={styles.rightButtonText}>{rightButtonText}</Text>
          </TouchableOpacity>
        ) : showTotalCases ? (
          <Text style={styles.totalCases}>Total case :{totalCases || 54}</Text>
        ) : null}
      </View>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#800000',
    elevation: 0,
    marginTop: 0,
    marginLeft: -AppTheme.spacing.md,
    marginRight: -AppTheme.spacing.md,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    width: SCREEN_WIDTH,
    alignSelf: 'stretch',
    height: 56,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: AppTheme.spacing.md,
  },
  iconButton: {
    padding: AppTheme.spacing.sm,
    marginLeft: AppTheme.spacing.xs,
  },
  title: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: '#FFFFFF',
  },
  totalCases: {
    fontSize: AppTheme.typography.body.fontSize,
    color: '#FFFFFF',
  },
  rightButton: {
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
  },
  rightButtonText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
