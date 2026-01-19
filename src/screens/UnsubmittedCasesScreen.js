import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Chip, FAB, Dialog, Portal, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';

const unsubmittedCasesData = [
  {
    id: '1',
    fullTitle: 'HDFC PFI PFI (PD)',
    subtitle: 'Fl Type : Bv',
    status: 'Pending',
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
    status: 'Pending',
    address: '456 COMMERCIAL AVENUE, NEW DELHI 110001, DELHI 8765432109',
    dateTime: 'Wednesday, June 12th 2024, 10:45:22 am',
  },
  {
    id: '4',
    fullTitle: 'Axis Bank Case Study',
    subtitle: 'Fl Type : Bv',
    status: 'Pending',
    address: '789 FINANCIAL PLAZA, BANGALORE 560001, KARNATAKA 7654321098',
    dateTime: 'Thursday, June 13th 2024, 4:30:15 pm',
  },
  {
    id: '5',
    fullTitle: 'HDFC Credit Analysis',
    subtitle: 'Fl Type : Dv',
    status: 'Pending',
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
    status: 'Pending',
    address: '987 BUSINESS HUB, PUNE 411001, MAHARASHTRA 4321098765',
    dateTime: 'Sunday, June 16th 2024, 5:55:20 pm',
  },
  {
    id: '8',
    fullTitle: 'Bank of Baroda Review',
    subtitle: 'Fl Type : Av',
    status: 'Pending',
    address: '147 BANKING SQUARE, AHMEDABAD 380001, GUJARAT 3210987654',
    dateTime: 'Monday, June 17th 2024, 9:40:10 am',
  },
];

export default function UnsubmittedCasesScreen() {
  const [syncDialogVisible, setSyncDialogVisible] = useState(false);

  const handleSyncAll = () => {
    setSyncDialogVisible(true);
  };

  const handleConfirmSync = () => {
    setSyncDialogVisible(false);
    // Handle sync all action here
    console.log('Syncing all cases...');
  };

  const handleCancelSync = () => {
    setSyncDialogVisible(false);
  };

  const handleSubmit = () => {
    // Handle submit action here
    console.log('Submitting cases...');
  };

  return (
    <AppLayout>
      <AppHeader 
        title="Unsubmitted Cases" 
        rightButton
        rightButtonText=""
        onRightButtonPress={handleSyncAll}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {unsubmittedCasesData.map((caseData) => (
          <Card key={caseData.id} style={styles.card}>
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
        ))}
      </ScrollView>
      
      <FAB
        icon="check"
        style={styles.fab}
        onPress={handleSubmit}
        label="Sync All Cases"
        color={AppTheme.colors.surface}
        labelStyle={styles.fabLabel}
      />

      <Portal>
        <Dialog visible={syncDialogVisible} onDismiss={handleCancelSync}>
          <View style={styles.dialogIconContainer}>
            <Icon name="sync" size={48} color={AppTheme.colors.primary} />
          </View>
          <Dialog.Title style={styles.dialogTitle}>Sync All Cases</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sync all unsubmitted cases?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelSync}>Cancel</Button>
            <Button onPress={handleConfirmSync} textColor={AppTheme.colors.primary}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.s,
    paddingBottom: AppTheme.spacing.xxl,
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
  fab: {
    position: 'absolute',
    margin: AppTheme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: AppTheme.colors.primary,
  },
  fabLabel: {
    color: AppTheme.colors.surface,
  },
  dialogTitle: {
    textAlign: 'center',
  },
  dialogIconContainer: {
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
  },
});
