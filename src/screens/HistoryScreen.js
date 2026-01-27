import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Platform, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Searchbar, Button, Dialog, Portal, ActivityIndicator, FAB } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import authService from '../services/authService';
import { getEmployeeCompletedCases } from '../services/casesService';
import CasePreviewModal from '../components/CasePreviewModal';

export default function HistoryScreen() {
  const todayString = new Date().toISOString().split('T')[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const formatHistoryCase = (caseObj) => {
    const applicantName =
      caseObj.applicant_name ||
      caseObj.applicant?.name ||
      caseObj.customer_name ||
      caseObj.name ||
      '';
    const residenceAddress = caseObj.residence_colony_details 
      ? `${caseObj.residence_house_no || ''} ${caseObj.residence_colony_details}, ${caseObj.residence_city || ''}`.trim()
      : '';
    const businessAddress = caseObj.business_colony_details
      ? `${caseObj.business_house_number || ''} ${caseObj.business_colony_details}, ${caseObj.business_city || ''}`.trim()
      : '';
    const address = businessAddress || residenceAddress || 'Address not available';

    const submittedDate =
      caseObj.submitted_date ||
      caseObj.completed_at ||
      caseObj.enquery_time ||
      caseObj.updated_at ||
      caseObj.created_at;
    const dateTime = submittedDate
      ? new Date(submittedDate).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Date not available';

    const productName = caseObj.product?.name || caseObj.custom_name || caseObj.bank_product_name || 'N/A';
    const bankName = caseObj.bank?.name || caseObj.bank_name || 'Unknown Bank';

    return {
      id: caseObj.id || caseObj.case_id || String(Math.random()),
      fullTitle: `${bankName} ${productName}`.trim(),
      subtitle: `Fl Type : ${caseObj.fl_type?.toUpperCase() || 'N/A'}`,
      applicantName,
      status: caseObj.status || 'Completed',
      address,
      dateTime,
      submittedDate: submittedDate ? String(submittedDate).split('T')[0] : '',
      raw: caseObj,
    };
  };

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const user = await authService.getCurrentUser();
      if (!user?.id) {
        setErrorMessage('User not found. Please login again.');
        setHistoryData([]);
        return;
      }

      const effectiveDate = selectedDate || new Date().toISOString().split('T')[0];
      const result = await getEmployeeCompletedCases({
        userId: user.id,
        selectedDate: effectiveDate,
      });

      if (!result.success) {
        setErrorMessage(
          result?.error ||
            result?.data?.message ||
            result?.data?.error ||
            'Failed to load history.',
        );
        setHistoryData([]);
        return;
      }

      const formatted = (result.cases || []).map(formatHistoryCase);
      setHistoryData(formatted);
    } catch (error) {
      console.error('Error loading history:', error);
      setErrorMessage('An unexpected error occurred while loading history.');
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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
        {loading ? (
          <ActivityIndicator style={styles.loader} animating color={AppTheme.colors.primary} size="large" />
        ) : errorMessage ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{errorMessage}</Text>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history found</Text>
          </View>
        ) : (
          filteredData.map((caseData) => (
            <TouchableOpacity
              key={caseData.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedCase(caseData);
                setPreviewVisible(true);
              }}
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
                      FL Type: {caseData.subtitle?.split(':')[1]?.trim() || 'bv'}
                    </Text>
                    <Chip style={styles.dateChip} textStyle={styles.dateText}>
                      {caseData.dateTime}
                    </Chip>
                  </View>

                  <Text style={styles.addressText} numberOfLines={2}>
                    {caseData.address}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={loadHistory}
        loading={loading}
        disabled={loading}
        color="white"
      />

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

      <CasePreviewModal
        visible={previewVisible}
        caseItem={selectedCase}
        onClose={() => setPreviewVisible(false)}
      />
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
    borderRadius: 0,
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
    borderRadius: 0,
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
  loader: {
    marginTop: AppTheme.spacing.xl,
  },
  contentContainer: {
    padding: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.xl,
    paddingTop: AppTheme.spacing.sm,
  },
  card: {
    width: '100%',
    borderRadius: AppTheme.roundness,
    elevation: 1,
    marginBottom: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
  },
  cardContent: {
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppTheme.spacing.xs,
  },
  title: {
    fontSize: AppTheme.typography.h4.fontSize, 
    fontWeight: '700',
    color: AppTheme.colors.primary,
    flex: 1,
    marginRight: AppTheme.spacing.sm,
    marginBottom: 0,
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
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.primary,
    fontWeight: '500',
  },
  addressText: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    lineHeight: AppTheme.typography.body.lineHeight,
    marginTop: AppTheme.spacing.xs,
  },
  applicantText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    fontWeight: '600',
    marginBottom: AppTheme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: AppTheme.typography.caption.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
  },
  dateChip: {
    backgroundColor: AppTheme.colors.primary,
    height: 30,
    minHeight: 30,
  },
  dateText: {
    color: AppTheme.colors.surface,
    fontSize: 11,
    lineHeight: 14,
  },
  emptyContainer: {
    padding: AppTheme.spacing.xl,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.primary,
  },
  emptyText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
  },
});
