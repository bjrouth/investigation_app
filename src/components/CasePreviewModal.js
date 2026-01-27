import React, { useState } from 'react';
import { Modal, ScrollView, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { AppTheme } from '../theme/theme';

export default function CasePreviewModal({ visible, onClose, caseItem }) {
  const raw = caseItem?.raw || {};
  const [imagePreview, setImagePreview] = useState(null);
  const images =
    [
      raw?.files_by_type?.response,
      raw?.files,
      raw?.images,
      raw?.case_images,
    ].find(Array.isArray) || [];

  const normalizeObject = (value) => {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return {};
  };

  const renderFields = (title, fields, data) => {
    const source = normalizeObject(data);
    return (
      <View style={styles.previewSection}>
        <Text style={styles.previewSectionTitle}>{title}</Text>
        <View style={styles.previewCardSection}>
          {fields.map(({ key, label }) => {
            const value = source[key];
            const display =
              value === null || value === undefined || value === '' ? 'N/A' : String(value);
            return (
              <View key={key} style={styles.previewRow}>
                <Text style={styles.previewLabel}>{label}:</Text>
                <Text style={styles.previewValue}>{display}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getRawValue = (key) => {
    const value = raw?.[key];
    return value === null || value === undefined || value === '' ? 'N/A' : String(value);
  };

  const caseDetailsFields = [
    { key: 'case_id', label: 'Case ID' },
    { key: 'reference_number', label: 'Reference number' },
    { key: 'fl_type', label: 'FL type' },
    { key: 'status', label: 'Status' },
    { key: 'applicant_name', label: 'Applicant name' },
    { key: 'co_applicant_name', label: 'Co-applicant name' },
    { key: 'guarantee_name', label: 'Guarantee name' },
    { key: 'dob', label: 'DOB' },
    { key: 'amount', label: 'Amount' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'geo_limit', label: 'Geo limit' },
    { key: 'tat_time', label: 'TAT time' },
  ];

  const residenceAddressFields = [
    { key: 'residence_house_no', label: 'Residence house no.' },
    { key: 'residence_landmark', label: 'Residence landmark' },
    { key: 'residence_colony_details', label: 'Residence colony details' },
    { key: 'residence_city', label: 'Residence city' },
    { key: 'residence_phone_number', label: 'Residence phone number' },
  ];

  const businessAddressFields = [
    { key: 'business_house_number', label: 'Business house number' },
    { key: 'business_landmark', label: 'Business landmark' },
    { key: 'business_colony_details', label: 'Business colony details' },
    { key: 'business_city', label: 'Business city' },
    { key: 'business_phone_number', label: 'Business phone number' },
  ];

  const residentialFields = [
    { key: 'name_of_person_met', label: 'Name of person met' },
    { key: 'met_person_relation', label: 'Relationship with applicant' },
    { key: 'other_relation', label: 'Other relation' },
    { key: 'id_proof_seen', label: 'ID proof seen' },
    { key: 'member_count', label: 'Total family members' },
    { key: 'earning_member_count', label: 'Earning members' },
    { key: 'dependent_member_count', label: 'Dependent members' },
    { key: 'total_stability', label: 'Total stability' },
    { key: 'stability_less_6_month_last_address_confirm', label: 'Stability < 6 months confirm last address' },
    { key: 'residence_ownership', label: 'Residence ownership' },
    { key: 'residence_ownership_other', label: 'Residence ownership other' },
    { key: 'agri_land_with_location', label: 'Agri land with location' },
    { key: 'applicant_working_company_name_location', label: 'Applicant working company name & location' },
    { key: 'vehicle_details', label: 'Vehicle details' },
    { key: 'house_class_locality', label: 'House class locality' },
    { key: 'house_interior', label: 'House interior' },
    { key: 'house_interior_other', label: 'House interior other' },
    { key: 'living_standard', label: 'Living standard' },
    { key: 'living_standard_other', label: 'Living standard other' },
    { key: 'exterior_of_house', label: 'Exterior of house' },
    { key: 'remark', label: 'Remark' },
  ];

  const rvNeighbourFields = [
    { key: 'neighbour_1_details', label: 'Neighbour 1 details' },
    { key: 'neighbour_1_remark', label: 'Neighbour 1 remark' },
    { key: 'neighbour_2_details', label: 'Neighbour 2 details' },
    { key: 'neighbour_2_remark', label: 'Neighbour 2 remark' },
  ];

  const bvBaseFields = [
    { key: 'met_person_name', label: 'Met person name' },
    { key: 'relation', label: 'Relation' },
    { key: 'type_of_business', label: 'Type of business' },
    { key: 'signboard_seen_with_name', label: 'Signboard seen with name' },
  ];

  const bvNeighbourFields = [
    { key: 'neighbour_1_details', label: 'Neighbour 1 details' },
    { key: 'neighbour_1_remark', label: 'Neighbour 1 remark' },
    { key: 'neighbour_2_details', label: 'Neighbour 2 details' },
    { key: 'neighbour_2_remark', label: 'Neighbour 2 remark' },
  ];

  const selfEmployedFields = [
    { key: 'id_proof_seen', label: 'ID proof seen' },
    { key: 'applicant_is', label: 'Applicant designation' },
    { key: 'applicant_is_other', label: 'Applicant designation other' },
    { key: 'nature_of_business', label: 'Nature of business' },
    { key: 'nature_of_business_other', label: 'Nature of business other' },
    { key: 'office_ownership', label: 'Business premises' },
    { key: 'stability', label: 'Stability' },
    { key: 'stability_other', label: 'Stability other' },
    { key: 'stocks', label: 'Stocks seen' },
    { key: 'gst_bill_visiting_card_seen', label: 'GST/bill/visiting card seen' },
    { key: 'business_activity_level_seen', label: 'Business activity level seen' },
    { key: 'employee_seen', label: 'Employees seen' },
    { key: 'applicant_current_account_with_bank', label: 'Current account with bank branch' },
    { key: 'applicant_has_vehicle', label: 'Applicant has vehicle' },
    { key: 'exterior_off_floor', label: 'Exterior and off floor' },
    { key: 'remark', label: 'Remark' },
  ];

  const serviceFields = [
    { key: 'working_since', label: 'Working since' },
    { key: 'designation', label: 'Designation' },
    { key: 'department_room_number', label: 'Department & room no.' },
    { key: 'employee_code', label: 'Employee code' },
    { key: 'company_nature_of_business', label: 'Company nature of business' },
    { key: 'drawing_salary_per_month', label: 'Salary per month' },
    { key: 'id_proof_seen', label: 'ID proof seen' },
    { key: 'employee_seen', label: 'Employee seen' },
    { key: 'exterior_off_floor', label: 'Exterior and off floor' },
    { key: 'remark', label: 'Remark' },
  ];

  const caseStatusFields = [
    { key: 'case_status', label: 'Case status' },
    { key: 'rejection_reason', label: 'Rejection reason' },
    { key: 'rejection_reason_other', label: 'Rejection reason other' },
    { key: 'additional_remark', label: 'Additional remark' },
    { key: 'photo_source', label: 'Photo source' },
  ];

  const flType = String(raw?.fl_type || '').toLowerCase();
  const isRv = raw?.is_rv === 1 || flType.includes('rv');
  const isBv = raw?.is_bv === 1 || (!isRv && flType.includes('bv'));
  const businessType = String(raw?.type_of_business || raw?.case_study?.type_of_business || '').toLowerCase();
  const residentialNeighbour = Array.isArray(raw?.residential_neighbour) ? raw.residential_neighbour[0] : raw?.residential_neighbour;
  const businessNeighbour = Array.isArray(raw?.business_neighbour) ? raw.business_neighbour[0] : raw?.business_neighbour;
  const officeNeighbour = Array.isArray(raw?.office_neighbour) ? raw.office_neighbour[0] : raw?.office_neighbour;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.previewOverlay}>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Submitted Case</Text>
            <IconButton icon="close" size={20} onPress={onClose} />
          </View>

          <ScrollView style={styles.previewContent} contentContainerStyle={styles.previewContentContainer}>
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Summary</Text>
              <View style={styles.previewCardSection}>
                {caseItem?.applicantName ? (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Applicant:</Text>
                    <Text style={styles.previewValue}>{caseItem.applicantName}</Text>
                  </View>
                ) : null}
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Status:</Text>
                  <Text style={styles.previewValue}>{caseItem?.status || 'Completed'}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>FL Type:</Text>
                  <Text style={styles.previewValue}>{caseItem?.subtitle?.split(':')[1]?.trim() || 'N/A'}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Address:</Text>
                  <Text style={styles.previewValue}>{caseItem?.address || 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Case Details</Text>
              <View style={styles.previewCardSection}>
                {caseDetailsFields.map(({ key, label }) => (
                  <View key={key} style={styles.previewRow}>
                    <Text style={styles.previewLabel}>{label}:</Text>
                    <Text style={styles.previewValue}>{getRawValue(key)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Residence Address</Text>
              <View style={styles.previewCardSection}>
                {residenceAddressFields.map(({ key, label }) => (
                  <View key={key} style={styles.previewRow}>
                    <Text style={styles.previewLabel}>{label}:</Text>
                    <Text style={styles.previewValue}>{getRawValue(key)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Business Address</Text>
              <View style={styles.previewCardSection}>
                {businessAddressFields.map(({ key, label }) => (
                  <View key={key} style={styles.previewRow}>
                    <Text style={styles.previewLabel}>{label}:</Text>
                    <Text style={styles.previewValue}>{getRawValue(key)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {isRv && renderFields('Residential Details', residentialFields, raw?.residential_details || raw)}
            {isRv && renderFields('Neighbour Verification', rvNeighbourFields, residentialNeighbour || raw?.residential_details || raw)}

            {isBv && renderFields('Business Verification', bvBaseFields, raw)}
            {isBv && businessType === 'self_employed' &&
              renderFields('Self Employed', selfEmployedFields, raw?.self_employed)}
            {isBv && businessType === 'service' &&
              renderFields('Service', serviceFields, raw?.service_details || raw?.service)}
            {isBv && renderFields('Neighbour Verification', bvNeighbourFields, businessNeighbour || officeNeighbour || raw)}

            {renderFields('Case Status', caseStatusFields, raw?.case_study || raw)}

            {images.length > 0 ? (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Images</Text>
                <View style={styles.previewImages}>
                  {images.map((img, index) => {
                    const uri = img?.s3_url || img?.url || img?.uri || img?.path;
                    if (!uri) return null;
                    return (
                      <TouchableOpacity
                        key={`${uri}-${index}`}
                        onPress={() => setImagePreview(uri)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri }} style={styles.previewImage} />
                      </TouchableOpacity>
                    ); 
                  })}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>

      <Modal visible={!!imagePreview} transparent animationType="fade">
        <View style={styles.imageOverlay}>
          <View style={styles.imageHeader}>
            <IconButton icon="close" size={26} iconColor={AppTheme.colors.surface} onPress={() => setImagePreview(null)} />
          </View>
          {imagePreview && (
            <Image source={{ uri: imagePreview }} style={styles.imagePreview} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: AppTheme.spacing.md,
  },
  previewCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 12,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.outline + '20',
  },
  previewTitle: {
    fontSize: AppTheme.typography.h4.fontSize,
    fontWeight: '700',
    color: AppTheme.colors.onSurface,
  },
  previewContent: {
    paddingHorizontal: AppTheme.spacing.md,
  },
  previewContentContainer: {
    paddingVertical: AppTheme.spacing.md,
  },
  previewSection: {
    marginBottom: AppTheme.spacing.md,
  },
  previewCardSection: {
    backgroundColor: AppTheme.colors.surfaceVariant + '40',
    borderRadius: 8,
    padding: AppTheme.spacing.sm,
  },
  previewSectionTitle: {
    fontSize: AppTheme.typography.body.fontSize,
    fontWeight: '700',
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.xs,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: AppTheme.spacing.xs,
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    fontWeight: '700',
  },
  previewValue: {
    flex: 1,
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    lineHeight: AppTheme.typography.body.lineHeight,
  },
  previewImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppTheme.spacing.xs,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 6,
    backgroundColor: AppTheme.colors.surfaceVariant,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingTop: 32,
    paddingRight: AppTheme.spacing.sm,
    zIndex: 1,
  },
  imagePreview: {
    width: '90%',
    height: '80%',
  },
});
