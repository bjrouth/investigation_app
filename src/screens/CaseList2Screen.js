import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';

const testCasesData = [
  {
    id: '1',
    fullTitle: 'HDFC PFI PFI (PD)',
    subtitle: 'Fl Type : Bv',
    status: 'Accepted',
    address: 'OFFICE PRIMARY HEALTH CARE, SURAJPUR PANCHKULA PANCHKULA 133301 A A 8926484848',
    dateTime: 'Monday, June 10th 2024, 6:08:14 pm',
  },
  {
    id: '2',
    fullTitle: 'ICICI Bank Investigation',
    subtitle: 'Fl Type : Cv',
    status: 'Pending',
    address: '123 MAIN STREET, BUSINESS DISTRICT, MUMBAI 400001, MAHARASHTRA 9876543210',
    dateTime: 'Tuesday, June 11th 2024, 2:15:30 pm',
  },
  {
    id: '3',
    fullTitle: 'SBI Financial Review',
    subtitle: 'Fl Type : Av',
    status: 'Accepted',
    address: '456 COMMERCIAL AVENUE, NEW DELHI 110001, DELHI 8765432109',
    dateTime: 'Wednesday, June 12th 2024, 10:45:22 am',
  },
  {
    id: '4',
    fullTitle: 'Axis Bank Case Study',
    subtitle: 'Fl Type : Bv',
    status: 'Under Review',
    address: '789 FINANCIAL PLAZA, BANGALORE 560001, KARNATAKA 7654321098',
    dateTime: 'Thursday, June 13th 2024, 4:30:15 pm',
  },
  {
    id: '5',
    fullTitle: 'HDFC Credit Analysis',
    subtitle: 'Fl Type : Dv',
    status: 'Accepted',
    address: '321 BANKING TOWER, CHENNAI 600001, TAMIL NADU 6543210987',
    dateTime: 'Friday, June 14th 2024, 8:20:45 am',
  },
  {
    id: '6',
    fullTitle: 'Kotak Mahindra Inquiry',
    subtitle: 'Fl Type : Bv',
    status: 'Pending',
    address: '654 FINANCE CENTER, HYDERABAD 500001, TELANGANA 5432109876',
    dateTime: 'Saturday, June 15th 2024, 1:10:30 pm',
  },
  {
    id: '7',
    fullTitle: 'PNB Investigation Report',
    subtitle: 'Fl Type : Cv',
    status: 'Accepted',
    address: '987 BUSINESS HUB, PUNE 411001, MAHARASHTRA 4321098765',
    dateTime: 'Sunday, June 16th 2024, 5:55:20 pm',
  },
  {
    id: '8',
    fullTitle: 'Bank of Baroda Review',
    subtitle: 'Fl Type : Av',
    status: 'Under Review',
    address: '147 BANKING SQUARE, AHMEDABAD 380001, GUJARAT 3210987654',
    dateTime: 'Monday, June 17th 2024, 9:40:10 am',
  },
  {
    id: '9',
    fullTitle: 'Canara Bank Analysis',
    subtitle: 'Fl Type : Bv',
    status: 'Accepted',
    address: '258 FINANCIAL DISTRICT, KOLKATA 700001, WEST BENGAL 2109876543',
    dateTime: 'Tuesday, June 18th 2024, 3:25:55 pm',
  },
  {
    id: '10',
    fullTitle: 'Union Bank Case File',
    subtitle: 'Fl Type : Dv',
    status: 'Pending',
    address: '369 COMMERCIAL ZONE, JAIPUR 302001, RAJASTHAN 1098765432',
    dateTime: 'Wednesday, June 19th 2024, 11:15:40 am',
  },
];

export default function CaseList2Screen({ route, navigation }) {
  const { caseItem } = route.params || {};

  // Always show multiple cases - if caseItem is passed, include it with test data
  const casesToDisplay = caseItem 
    ? [caseItem, ...testCasesData.filter(item => item.id !== caseItem.id)]
    : testCasesData;

  return (
    <AppLayout>
      <AppHeader title="My Cases" back navigation={navigation} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {casesToDisplay.map((caseData) => (
          <TouchableOpacity
            key={caseData.id}
            onPress={() => navigation.navigate('ProcessApplication', { caseData })}
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
              
              <Text style={styles.subtitle}>FL Type: {caseData.subtitle?.split(':')[1]?.trim() || 'bv'}</Text>
              
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressText}>{caseData.address}</Text>
              </View>
              
              <View style={styles.dateContainer}>
                <Chip style={styles.dateChip} textStyle={styles.dateText}>
                  {caseData.dateTime}
                </Chip>
              </View>
            </Card.Content>
          </Card>
          </TouchableOpacity>
        ))}
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
  subtitle: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.md,
    marginTop: 0,
  },
  addressContainer: {
    marginBottom: AppTheme.spacing.md,
  },
  addressLabel: {
    fontSize: AppTheme.typography.body.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.xs,
  },
  addressText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    lineHeight: AppTheme.typography.body.lineHeight,
  },
  dateContainer: {
    marginTop: AppTheme.spacing.md,
    alignItems: 'flex-start',
  },
  dateChip: {
    backgroundColor: AppTheme.colors.primary,
    height: 32,
  },
  dateText: {
    color: AppTheme.colors.surface,
    fontSize: AppTheme.typography.caption.fontSize,
  },
});
