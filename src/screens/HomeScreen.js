import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { Card, Text, ProgressBar, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import authService from '../services/authService';

// Sample stats data
const statsData = {
  totalCases: 54,
  pendingCases: 12,
  completedCases: 38,
  unsubmittedCases: 4,
  completionRate: 70,
};

// Weekly data for chart
const weeklyData = [
  { label: 'Mon', value: 8 },
  { label: 'Tue', value: 12 },
  { label: 'Wed', value: 6 },
  { label: 'Thu', value: 15 },
  { label: 'Fri', value: 10 },
  { label: 'Sat', value: 5 },
  { label: 'Sun', value: 3 },
];

// Monthly data for chart
const monthlyData = [
  { label: 'Jan', value: 45 },
  { label: 'Feb', value: 52 },
  { label: 'Mar', value: 38 },
  { label: 'Apr', value: 61 },
  { label: 'May', value: 55 },
  { label: 'Jun', value: 48 },
];

const StatCard = ({ icon, title, value, color, subtitle, index = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Card style={styles.statCard}>
        <Card.Content style={styles.statCardContent}>
          <View style={styles.statIconContainer}>
            <Icon name={icon} size={32} color={color} />
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const AnimatedBar = ({ item, maxValue, index, delay = 0 }) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animation when item changes
    animatedHeight.setValue(0);
    animatedOpacity.setValue(0);
    
    // Staggered animation - each bar starts after a delay
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: (item.value / maxValue) * 100,
        duration: 800,
        delay: delay + index * 100, // Stagger each bar by 100ms
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 600,
        delay: delay + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [item.value, maxValue, index, delay, animatedHeight, animatedOpacity]);

  return (
    <View style={styles.barWrapper}>
      <Animated.Text
        style={[
          styles.barValue,
          {
            opacity: animatedOpacity,
          },
        ]}
      >
        {item.value}
      </Animated.Text>
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              height: animatedHeight,
              backgroundColor: AppTheme.colors.primary,
            },
          ]}
        />
      </View>
      <Animated.Text
        style={[
          styles.barLabel,
          {
            opacity: animatedOpacity,
          },
        ]}
      >
        {item.label}
      </Animated.Text>
    </View>
  );
};

const BarChart = ({ data, maxChartValue, chartKey }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the entire chart when data changes
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [chartKey, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.chartContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {data.map((item, index) => (
        <AnimatedBar
          key={`${item.label}-${index}-${chartKey}`}
          item={item}
          maxValue={maxChartValue}
          index={index}
          delay={0}
        />
      ))}
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [viewType, setViewType] = useState('week');
  const [menuVisible, setMenuVisible] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const firstName = user.first_name || '';
          const lastName = user.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          setUserName(fullName || user.user_name || user.email || '');
        }
      } catch (e) {
        console.error('Failed to load user for HomeScreen:', e);
      }
    };

    loadUser();
  }, []);

  const chartData = viewType === 'week' ? weeklyData : monthlyData;
  const maxValue = Math.max(...chartData.map(d => d.value));
  const chartTitle = viewType === 'week' ? 'Cases This Week' : 'Cases This Month';

  return (
    <AppLayout>
      <AppHeader title="Home" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <View style={styles.welcomeContent}>
            <Text style={styles.userNameText}>{userName}</Text>
            <Icon name="hand-wave" size={32} color={AppTheme.colors.primary} style={styles.waveIcon} />
          </View>
        </View>

        {/* Stats Cards - All in One Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon="folder-multiple"
              title="Total Cases"
              value={statsData.totalCases}
              color={AppTheme.colors.primary}
              index={0}
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon="clock-outline"
              title="Pending"
              value={statsData.pendingCases}
              color="#F59E0B"
              index={1}
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon="check-circle"
              title="Completed"
              value={statsData.completedCases}
              color="#10B981"
              index={2}
            />
          </View>
          <View style={styles.statCardWrapper}>
            <StatCard
              icon="file-document-edit-outline"
              title="Unsubmitted"
              value={statsData.unsubmittedCases}
              color="#EF4444"
              index={3}
            />
          </View>
        </View>

        {/* Completion Rate Card */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Completion Rate</Text>
              <Text style={styles.progressValue}>{statsData.completionRate}%</Text>
            </View>
            <ProgressBar
              progress={statsData.completionRate / 100}
              color={AppTheme.colors.primary}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* Chart Card with Dropdown */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{chartTitle}</Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownContainer}
                    onPress={() => setMenuVisible(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {viewType === 'week' ? 'Week' : 'Month'} ▼
                    </Text>
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setViewType('week');
                    setMenuVisible(false);
                  }}
                  title="Week"
                />
                <Menu.Item
                  onPress={() => {
                    setViewType('month');
                    setMenuVisible(false);
                  }}
                  title="Month"
                />
              </Menu>
            </View>
            <View style={styles.chartWrapper}>
              <BarChart
                data={chartData}
                maxChartValue={maxValue}
                chartKey={viewType}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Quick Stats Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Quick Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Icon name="trending-up" size={20} color={AppTheme.colors.primary} />
                <Text style={styles.summaryText}>+12% this week</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="calendar-clock" size={20} color={AppTheme.colors.primary} />
                <Text style={styles.summaryText}>Avg: 8 cases/day</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.sm,
    paddingBottom: AppTheme.spacing.xl,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
  },
  welcomeText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    marginBottom: AppTheme.spacing.xs,
    textAlign: 'center',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppTheme.spacing.sm,
  },
  userNameText: {
    fontSize: AppTheme.typography.h2.fontSize,
    fontWeight: AppTheme.typography.h2.fontWeight,
    color: AppTheme.colors.onSurface,
  },
  waveIcon: {
    marginLeft: AppTheme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.md,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    borderRadius: AppTheme.roundness,
    elevation: 2,
    height: 120,
  },
  statCardContent: {
    padding: AppTheme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  statIconContainer: {
    marginBottom: AppTheme.spacing.xs,
  },
  statValue: {
    fontSize: AppTheme.typography.h2.fontSize,
    fontWeight: AppTheme.typography.h2.fontWeight,
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.xs,
  },
  statTitle: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: AppTheme.spacing.xs,
  },
  progressCard: {
    marginBottom: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  progressTitle: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: AppTheme.colors.onSurface,
  },
  progressValue: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: AppTheme.colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  chartCard: {
    marginBottom: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  chartTitle: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: AppTheme.colors.onSurface,
    flex: 1,
  },
  dropdownContainer: {
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
  },
  dropdownText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  chartWrapper: {
    marginTop: AppTheme.spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingVertical: AppTheme.spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    width: '80%',
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: AppTheme.spacing.xs,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: AppTheme.typography.caption.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.xs,
  },
  barLabel: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    marginTop: AppTheme.spacing.xs,
  },
  summaryCard: {
    marginBottom: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.xs,
  },
  summaryText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
  },
});
