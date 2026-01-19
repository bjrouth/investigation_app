import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Avatar, IconButton } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';

const casesData = [
  {
    id: '1',
    title: 'HDFC FBI',
    subtitle: 'Fl Type : Bv',
    fullTitle: 'HDFC PFI PFI (PD)',
    status: 'Accepted',
    address: 'OFFICE PRIMARY HEALTH CARE, SURAJPUR PANCHKULA PANCHKULA 133301 A A 8926484848',
    dateTime: 'Monday, June 10th 2024, 6:08:14 pm',
  },
  {
    id: '2',
    title: 'HDFC FBI',
    subtitle: 'Fl Type : Bv',
    fullTitle: 'HDFC PFI PFI (PD)',
    status: 'Accepted',
    address: 'OFFICE PRIMARY HEALTH CARE, SURAJPUR PANCHKULA PANCHKULA 133301 A A 8926484848',
    dateTime: 'Monday, June 10th 2024, 6:08:14 pm',
  },
  {
    id: '3',
    title: 'HDFC FBI',
    subtitle: 'Fl Type : Bv',
    fullTitle: 'HDFC PFI PFI (PD)',
    status: 'Accepted',
    address: 'OFFICE PRIMARY HEALTH CARE, SURAJPUR PANCHKULA PANCHKULA 133301 A A 8926484848',
    dateTime: 'Monday, June 10th 2024, 6:08:14 pm',
  },
  {
    id: '4',
    title: 'HDFC FBI',
    subtitle: 'Fl Type : Bv',
    fullTitle: 'HDFC PFI PFI (PD)',
    status: 'Accepted',
    address: 'OFFICE PRIMARY HEALTH CARE, SURAJPUR PANCHKULA PANCHKULA 133301 A A 8926484848',
    dateTime: 'Monday, June 10th 2024, 6:08:14 pm',
  },
];

const renderLeftIcon = (props) => <Avatar.Icon {...props} icon="city" />;
const renderRightIcon = (props) => <IconButton {...props} icon="chevron-right" size={24} />;

export default function CasesScreen({ navigation }) {
  const handleItemPress = (caseItem) => {
    // Navigate to case list 2
    navigation.navigate('CaseList2', { caseItem });
  };

  return (
    <AppLayout>
      <AppHeader title="Cases" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {casesData.map((caseItem) => (
          <TouchableOpacity
            key={caseItem.id}
            onPress={() => handleItemPress(caseItem)}
            activeOpacity={0.7}
            style={styles.cardWrapper}
          >
            <Card style={styles.card}>
              <Card.Title
                title={caseItem.title}
                subtitle={caseItem.subtitle}
                left={renderLeftIcon}
                right={renderRightIcon}
                titleStyle={styles.title}
                subtitleStyle={styles.subtitle}
                style={styles.cardTitle}
              />
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
    paddingTop: AppTheme.spacing.sm,
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
});
