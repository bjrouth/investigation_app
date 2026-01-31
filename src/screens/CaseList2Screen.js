import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import { CasesStorage } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { getDraftCases } from '../services/caseStorageService';

const formatCaseData = (caseObj) => {
  // Format address from residence or business details
  const residenceAddress = caseObj.residence_colony_details 
    ? `${caseObj.residence_house_no || ''} ${caseObj.residence_colony_details}, ${caseObj.residence_city || ''}`.trim()
    : '';
  const businessAddress = caseObj.business_colony_details
    ? `${caseObj.business_house_number || ''} ${caseObj.business_colony_details}, ${caseObj.business_city || ''}`.trim()
    : '';
  const address = businessAddress || residenceAddress || 'Address not available';

  // Format date
  const date = caseObj.created_at
    ? new Date(caseObj.created_at).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date not available';

  // Get product name
  const productName = caseObj.product?.name || caseObj.custom_name || caseObj.bank_product_name || 'N/A';
  const bankName = caseObj.bank?.name || 'Unknown Bank';
  const flType = caseObj.fl_type?.toLowerCase() || '';
  const isBusinessCase = flType.includes('bv') || flType.includes('pfi');
  const phone = isBusinessCase ? caseObj.business_phone_number : caseObj.residence_phone_number;
  const showPhone = caseObj.show_phone_number !== false;
  const applicantName =
    caseObj.applicant_name ||
    caseObj.applicant?.name ||
    caseObj.customer_name ||
    caseObj.name ||
    '';

  return {
    id: caseObj.id || caseObj.case_id || String(Math.random()),
    fullTitle: `${bankName} ${productName}`,
    subtitle: `Fl Type : ${caseObj.fl_type?.toUpperCase() || 'N/A'}`,
    applicantName,
    status: caseObj.status || 'Pending',
    address: address,
    phone: showPhone ? phone : null,
    dateTime: date,
    caseData: caseObj, // Store full case data for navigation
  };
};

export default function CaseList2Screen({ route, navigation }) {
  const { caseItem } = route.params || {};
  const [casesToDisplay, setCasesToDisplay] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDraftCaseIds = async () => {
    try {
      const drafts = await getDraftCases();
      return new Set(
        drafts
          .map((item) => String(item.id || item.case_id))
          .filter((value) => value && value !== 'undefined' && value !== 'null'),
      );
    } catch (error) {
      console.error('Failed to load draft cases:', error);
      return new Set();
    }
  };

  const filterOutDrafts = (caseList, draftIds) => {
    if (!draftIds || draftIds.size === 0) return caseList;
    return (caseList || []).filter((caseItemEntry) => {
      const id = String(caseItemEntry?.id || caseItemEntry?.case_id || '');
      return id && !draftIds.has(id);
    });
  };

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      const draftIds = await getDraftCaseIds();
      let cases = [];

      // If caseItem is passed and has cases array, use it directly
      if (caseItem?.cases && Array.isArray(caseItem.cases)) {
        cases = caseItem.cases;
      } else {
        // Otherwise, try to load from local storage and find matching cases
        const { cases: storedCases } = await CasesStorage.getCasesData();
        
        if (storedCases && caseItem) {
          // Find the matching case item from stored cases
          const matchingItem = storedCases.find(
            (item) => 
              item.bank_name === caseItem.name && 
              item.fl_type === caseItem.type
          );
          
          if (matchingItem?.cases) {
            cases = matchingItem.cases;
          } else if (matchingItem?.rawData?.cases) {
            cases = matchingItem.rawData.cases;
          }
        }
      }

      // Format cases for display
      const filteredCases = filterOutDrafts(cases, draftIds);
      const formattedCases = filteredCases.map(formatCaseData);
      setCasesToDisplay(formattedCases);
    } catch (error) {
      console.error('Error loading cases:', error);
      setCasesToDisplay([]);
    } finally {
      setLoading(false);
    }
  }, [caseItem]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useFocusEffect(
    useCallback(() => {
      loadCases();
    }, [loadCases]),
  );

  return (
    <AppLayout>
      <AppHeader title="My Cases" back navigation={navigation} />
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          animating
          color={AppTheme.colors.primary}
          size="large"
        />
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {casesToDisplay.length === 0 ? (
            <Text style={styles.emptyText}>No cases found.</Text>
          ) : (
            casesToDisplay.map((caseData) => (
              <TouchableOpacity
                key={caseData.id}
                onPress={() => navigation.navigate('ProcessApplication', { caseData: caseData.caseData || caseData })}
                activeOpacity={0.7}
              >
                <Card style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.headerRow}>
                      <Text style={styles.title}>{caseData.fullTitle || caseData.title}</Text>
                      <View style={styles.statusContainer}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{caseData.status}</Text>
                      </View>
                    </View>

                    {caseData.applicantName ? (
                      <Text style={styles.applicantText} numberOfLines={1}>
                        Applicant: {caseData.applicantName}
                      </Text>
                    ) : null}

                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>
                        FL Type: {caseData.subtitle?.split(':')[1]?.trim() || 'N/A'}
                      </Text>
                      <Chip style={styles.dateChip} textStyle={styles.dateText}>
                        {caseData.dateTime}
                      </Chip>
                    </View>

                    <Text style={styles.addressText} numberOfLines={2}>
                      {caseData.address}
                    </Text>

                    {caseData.phone ? (
                      <Text style={styles.phoneText} numberOfLines={1}>
                        Phone: {caseData.phone}
                      </Text>
                    ) : null}
                    
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.s,
    paddingBottom: AppTheme.spacing.xl,
    paddingTop: AppTheme.spacing.sm,
  },
  card: {
    width: '100%',
    borderRadius: AppTheme.roundness,
    elevation: 2,
    marginBottom: AppTheme.spacing.md,
  },
  cardContent: {
    padding: AppTheme.spacing.s,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppTheme.spacing.md,
  },
  title: {
    fontSize: AppTheme.typography.h3.fontSize,
    fontWeight: AppTheme.typography.h3.fontWeight,
    color: AppTheme.colors.primary,
    flex: 1,
    marginRight: AppTheme.spacing.sm,
    marginBottom: -9,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppTheme.colors.primary,
    marginRight: AppTheme.spacing.xs,
  },
  statusText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.primary,
    fontWeight: '500',
  },
  applicantText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: AppTheme.spacing.xs,
  },
  metaText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
  },
  dateChip: {
    backgroundColor: AppTheme.colors.primary,
    height: 32,
  },
  dateText: {
    color: AppTheme.colors.surface,
    fontSize: AppTheme.typography.caption.fontSize,
  },
  addressText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    lineHeight: AppTheme.typography.body.lineHeight,
    marginBottom: AppTheme.spacing.xs,
  },
  phoneText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.colors.onSurfaceVariant,
    fontSize: AppTheme.typography.body.fontSize,
    textAlign: 'center',
    marginTop: AppTheme.spacing.xl,
    padding: AppTheme.spacing.md,
  },
});
