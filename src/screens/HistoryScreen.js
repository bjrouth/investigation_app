import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { Card, Text, Chip, Searchbar, Button, Dialog, Portal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';

const historyData = [
  {
    id: '1',
    fullTitle: 'HDFC PFI PFI (PD)',
    subtitle: 'Fl Type : Bv',
    status: 'Completed',
    address: 'OFFICE PRIMARY HEALTH CARE, SURAJPUR PANCHKULA PANCHKULA 133301 A A 8926484848',
    dateTime: 'Monday, June 10th 2024, 6:08:14 pm',
    submittedDate: '2024-06-10',
  },
  {
    id: '2',
    fullTitle: 'ICICI Bank Investigation',
    subtitle: 'Fl Type : Cv',
    status: 'Completed',
    address: '123 MAIN STREET, BUSINESS DISTRICT, MUMBAI 400001, MAHARASHTRA 9876543210',
    dateTime: 'Tuesday, June 11th 2024, 2:15:30 pm',
    submittedDate: '2024-06-11',
  },
  {
    id: '3',
    fullTitle: 'SBI Financial Review',
    subtitle: 'Fl Type : Av',
    status: 'Completed',
    address: '456 COMMERCIAL AVENUE, NEW DELHI 110001, DELHI 8765432109',
    dateTime: 'Wednesday, June 12th 2024, 10:45:22 am',
    submittedDate: '2024-06-12',
  },
  {
    id: '4',
    fullTitle: 'Axis Bank Case Study',
    subtitle: 'Fl Type : Bv',
    status: 'Completed',
    address: '789 FINANCIAL PLAZA, BANGALORE 560001, KARNATAKA 7654321098',
    dateTime: 'Thursday, June 13th 2024, 4:30:15 pm',
    submittedDate: '2024-06-13',
  },
  {
    id: '5',
    fullTitle: 'HDFC Credit Analysis',
    subtitle: 'Fl Type : Dv',
    status: 'Completed',
    address: '321 BANKING TOWER, CHENNAI 600001, TAMIL NADU 6543210987',
    dateTime: 'Friday, June 14th 2024, 8:20:45 am',
    submittedDate: '2024-06-14',
  },
  {
    id: '6',
    fullTitle: 'Kotak Mahindra Inquiry',
    subtitle: 'Fl Type : Bv',
    status: 'Completed',
    address: '654 FINANCE CENTER, HYDERABAD 500001, TELANGANA 5432109876',
    dateTime: 'Saturday, June 15th 2024, 1:10:30 pm',
    submittedDate: '2024-06-15',
  },
  {
    id: '7',
    fullTitle: 'PNB Investigation Report',
    subtitle: 'Fl Type : Cv',
    status: 'Completed',
    address: '987 BUSINESS HUB, PUNE 411001, MAHARASHTRA 4321098765',
    dateTime: 'Sunday, June 16th 2024, 5:55:20 pm',
    submittedDate: '2024-06-16',
  },
  {
    id: '8',
    fullTitle: 'Bank of Baroda Review',
    subtitle: 'Fl Type : Av',
    status: 'Completed',
    address: '147 BANKING SQUARE, AHMEDABAD 380001, GUJARAT 3210987654',
    dateTime: 'Monday, June 17th 2024, 9:40:10 am',
    submittedDate: '2024-06-17',
  },
];

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const filterHistory = () => {
    return historyData.filter((item) => {
      const matchesSearch = 
        item.fullTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = !selectedDate || item.submittedDate === selectedDate;
      
      return matchesSearch && matchesDate;
    });
  };

  const filteredData = filterHistory();

  const handleDatePickerOpen = () => {
    setTempDate(selectedDate ? new Date(selectedDate) : new Date());
    setDatePickerVisible(true);
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
      if (event.type === 'set' && date) {
        const dateString = date.toISOString().split('T')[0];
        setSelectedDate(dateString);
      }
    } else {
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleDateConfirm = () => {
    const dateString = tempDate.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setDatePickerVisible(false);
  };

  const handleDateCancel = () => {
    setDatePickerVisible(false);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return 'Select Date';
    return new Date(selectedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AppLayout>
      <AppHeader title="History" />
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search history..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
        />
        <Button
          mode="outlined"
          onPress={handleDatePickerOpen}
          style={styles.dateButton}
          contentStyle={styles.dateButtonContent}
          labelStyle={styles.dateButtonLabel}
          icon="calendar"
        >
          {formatSelectedDate()}
        </Button>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history found</Text>
          </View>
        ) : (
          filteredData.map((caseData) => (
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
          ))
        )}
      </ScrollView>

      <Portal>
        {Platform.OS === 'ios' ? (
          <Dialog visible={datePickerVisible} onDismiss={handleDateCancel}>
            <Dialog.Title>Select Date</Dialog.Title>
            <Dialog.Content>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.datePicker}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleDateCancel}>Cancel</Button>
              <Button onPress={clearDateFilter}>Clear</Button>
              <Button onPress={handleDateConfirm} textColor={AppTheme.colors.primary}>
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>
        ) : (
          datePickerVisible && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )
        )}
      </Portal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    padding: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.surface,
    flexDirection: 'row',
    gap: AppTheme.spacing.sm,
    alignItems: 'stretch',
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    height: 56,
    maxHeight: 56,
  },
  searchbarInput: {
    height: 56,
    fontSize: AppTheme.typography.body.fontSize,
    paddingVertical: 0,
  },
  dateButton: {
    minWidth: 150,
    height: 56,
    maxHeight: 56,
    marginVertical: 0,
  },
  dateButtonContent: {
    height: 56,
    paddingVertical: 0,
    paddingHorizontal: AppTheme.spacing.md,
  },
  dateButtonLabel: {
    fontSize: AppTheme.typography.body.fontSize,
    lineHeight: AppTheme.typography.body.fontSize,
  },
  datePicker: {
    width: '100%',
  },
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
  emptyContainer: {
    padding: AppTheme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
  },
});
