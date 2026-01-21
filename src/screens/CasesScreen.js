import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Avatar, IconButton, ActivityIndicator, Text, FAB } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import authService from '../services/authService';
import casesService from '../services/casesService';
import { CasesStorage } from '../utils/storage';

const renderLeftIcon = (caseCount) => (props) => (
  <View style={styles.iconContainer}>
    <Avatar.Icon {...props} icon="city" />
    {caseCount > 0 && (
      <View style={styles.iconBadge}>
        <Text style={styles.iconBadgeText}>{caseCount}</Text>
      </View>
    )}
  </View>
);
const renderRightIcon = (props) => <IconButton {...props} icon="chevron-right" size={24} />;

export default function CasesScreen({ navigation }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [totalCases, setTotalCases] = useState(0);

  const normalizeCases = (formattedData) => {
    const normalizedCases = [];
    
    // Transform the nested structure into a flat array
    Object.entries(formattedData).forEach(([bankName, bankData]) => {
      ['rv', 'bv'].forEach(type => {
        const typeData = bankData[type];
        if (typeData && typeData.cases && typeData.cases.length > 0) {
          normalizedCases.push({
            id: `${bankName}_${type}`, // Unique key for React
            bank_name: typeData.name || bankName,
            fl_type: typeData.type || type,
            bank_id: typeData.cases[0]?.bank_id,
            rawData: typeData, // Store full data for navigation
            cases: typeData.cases, // Store cases array
            caseCount: typeData.cases.length, // Store case count for badge
          });
        }
      });
    });

    return normalizedCases;
  };

  const fetchCases = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const user = await authService.getCurrentUser();
      if (!user?.id) {
        setErrorMessage('User not found. Please login again.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const result = await casesService.getEmployeeCases({ userId: user.id });

      if (!result.success) {
        setErrorMessage(
          result?.error ||
            result?.data?.message ||
            result?.data?.error ||
            'Failed to load cases.',
        );
        setCases([]);
      } else {
        // Normalize cases to match UI expectations
        const normalizedCases = normalizeCases(result.raw.formatted_data);
        const casesTotal = result.raw.total_cases;

        setCases(normalizedCases);
        setTotalCases(casesTotal);
        setErrorMessage('');

        // Save to local storage
        await CasesStorage.setCasesData(normalizedCases, casesTotal);
      }
    } catch (e) {
      setErrorMessage('An unexpected error occurred while loading cases.');
      setCases([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCasesFromStorage = async () => {
    try {
      const { cases: storedCases, totalCases: storedTotalCases } = await CasesStorage.getCasesData();
      if (storedCases && storedCases.length > 0) {
        setCases(storedCases);
        setTotalCases(storedTotalCases);
        setLoading(false);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const loadCases = async () => {
      // Try to load from local storage first
      const hasStoredData = await loadCasesFromStorage();
      
      // If no stored data, fetch from API
      if (!hasStoredData) {
        await fetchCases(false);
      }
    };

    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    // Always fetch from API when refresh is pressed
    await fetchCases(true);
  };

  const handleItemPress = (caseItem) => {
    // Navigate to case list 2 with full case data
    navigation.navigate('CaseList2', { caseItem: caseItem.rawData || caseItem });
  };

  return (
    <AppLayout>
      <AppHeader title="Cases" showTotalCases={true} totalCases={totalCases} />
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          animating
          color={AppTheme.colors.primary}
          size="large"
        />
      ) : (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            {cases.map((caseItem) => (
              <TouchableOpacity
                key={caseItem.id}
                onPress={() => handleItemPress(caseItem)}
                activeOpacity={0.7}
                style={styles.cardWrapper}
              >
                <Card style={styles.card}>
                  <Card.Title
                    title={caseItem.bank_name}
                    subtitle={'Case Type : '+caseItem.fl_type}
                    left={renderLeftIcon(caseItem.caseCount || 0)}
                    right={renderRightIcon}
                    titleStyle={styles.title}
                    subtitleStyle={styles.subtitle}
                    style={styles.cardTitle}
                  />
                </Card>
              </TouchableOpacity>
            ))}
            {!errorMessage && cases.length === 0 && (
              <Text style={styles.emptyText}>No cases found.</Text>
            )}
          </ScrollView>
          <FAB
            icon="refresh"
            style={styles.fab}
            onPress={handleRefresh}
            loading={refreshing}
            disabled={refreshing || loading}
            color="white"
          />
        </View>
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.s,
    paddingTop: AppTheme.spacing.sm,
    paddingBottom: 80, // Add padding to prevent content from being hidden behind FAB
  },
  cardWrapper: {
    marginBottom: AppTheme.spacing.md,
  },
  card: {
    width: '100%',
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  cardTitle: {
    paddingBottom: AppTheme.spacing.xs,
  },
  iconContainer: {
    position: 'relative',
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: AppTheme.typography.h4.fontSize,
    fontWeight: AppTheme.typography.h5.fontWeight,
    color: AppTheme.colors.onSurface,
    marginBottom: -9,
  },
  subtitle: {
    fontSize: AppTheme.typography.h5.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    lineHeight: AppTheme.typography.body.lineHeight,
    marginTop: 0,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: AppTheme.colors.error,
    fontSize: AppTheme.typography.body.fontSize,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.md,
    padding: AppTheme.spacing.sm,
  },
  emptyText: {
    color: AppTheme.colors.onSurfaceVariant,
    fontSize: AppTheme.typography.body.fontSize,
    textAlign: 'center',
    marginTop: AppTheme.spacing.xl,
    padding: AppTheme.spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: AppTheme.colors.primary,
  },
});
