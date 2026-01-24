import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Alert, Modal, Dimensions } from 'react-native';
import { Card, Text, TextInput, Button, RadioButton, FAB, Menu, TouchableRipple, IconButton } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import { confirmDeleteImage, takePhotoWithGeoAndCompression, pickImageFromGallery } from '../utils/locationHelpers';
import { generateTestData } from '../utils/testDataGenerator';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function ProcessApplicationScreen({ route, navigation }) {
  const { caseData } = route.params || {};
  
  // Determine case type from FL Type (Bv = Business Verification, Rv = Residential Verification)
  // Check fl_type directly first, then fallback to subtitle parsing
  const flTypeFromData = caseData?.fl_type?.toLowerCase() || 
    caseData?.subtitle?.split(':')[1]?.trim()?.toLowerCase() || 
    'bv';
  const caseType = flTypeFromData.includes('rv') ? 'rv' : 'bv';
  const isBv = caseType === 'bv';
  const isRv = caseType === 'rv';

  // Step management
  const [step, setStep] = useState('details');
  
  // Menu state for status dropdown
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  
  // Menu state for signboard dropdown
  const [signboardMenuVisible, setSignboardMenuVisible] = useState(false);
  
  // Menu state for id proof dropdown
  const [idProofMenuVisible, setIdProofMenuVisible] = useState(false);
  
  // Image modal state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  // Image source menu state
  const [imageSourceMenuVisible, setImageSourceMenuVisible] = useState(false);
  
  // Generate default test data based on case type
  const getDefaultFormData = () => {
    const defaultData = generateTestData(caseType, null);
    
    // Merge with empty structure to ensure all fields exist
    return {
      // RV Personal Details
      residential_details: {
        name_of_person_met: defaultData.residential_details?.name_of_person_met || '',
        met_person_relation: defaultData.residential_details?.met_person_relation || '',
        other_relation: defaultData.residential_details?.other_relation || '',
        id_proof_seen: defaultData.residential_details?.id_proof_seen || '',
        member_count: defaultData.residential_details?.member_count || '',
        earning_member_count: defaultData.residential_details?.earning_member_count || '',
        dependent_member_count: defaultData.residential_details?.dependent_member_count || '',
        total_stability: defaultData.residential_details?.total_stability || '',
        stability_less_6_month_last_address_confirm: defaultData.residential_details?.stability_less_6_month_last_address_confirm || '',
        residence_ownership: defaultData.residential_details?.residence_ownership || '',
        residence_ownership_other: defaultData.residential_details?.residence_ownership_other || '',
        agri_land_with_location: defaultData.residential_details?.agri_land_with_location || '',
        applicant_working_company_name_location: defaultData.residential_details?.applicant_working_company_name_location || '',
        vehicle_details: defaultData.residential_details?.vehicle_details || '',
        house_class_locality: defaultData.residential_details?.house_class_locality || '',
        house_interior: defaultData.residential_details?.house_interior || '',
        house_interior_other: defaultData.residential_details?.house_interior_other || '',
        living_standard: defaultData.residential_details?.living_standard || '',
        living_standard_other: defaultData.residential_details?.living_standard_other || '',
        exterior_of_house: defaultData.residential_details?.exterior_of_house || '',
        remark: defaultData.residential_details?.remark || '',
        neighbour_1_details: defaultData.residential_details?.neighbour_1_details || '',
        neighbour_1_remark: defaultData.residential_details?.neighbour_1_remark || '',
        neighbour_2_details: defaultData.residential_details?.neighbour_2_details || '',
        neighbour_2_remark: defaultData.residential_details?.neighbour_2_remark || '',
      },
      // BV Basic
      met_person_name: defaultData.met_person_name || '',
      relation: defaultData.relation || '',
      type_of_business: defaultData.type_of_business || '',
      // Self Employed
      self_employed: {
        id_proof_seen: defaultData.self_employed?.id_proof_seen || '',
        applicant_is: defaultData.self_employed?.applicant_is || '',
        applicant_is_other: defaultData.self_employed?.applicant_is_other || '',
        nature_of_business: defaultData.self_employed?.nature_of_business || '',
        nature_of_business_other: defaultData.self_employed?.nature_of_business_other || '',
        office_ownership: defaultData.self_employed?.office_ownership || '',
        stability: defaultData.self_employed?.stability || '',
        stability_other: defaultData.self_employed?.stability_other || '',
        stocks: defaultData.self_employed?.stocks || '',
        gst_bill_visiting_card_seen: defaultData.self_employed?.gst_bill_visiting_card_seen || '',
        business_activity_level_seen: defaultData.self_employed?.business_activity_level_seen || '',
        employee_seen: defaultData.self_employed?.employee_seen || '',
        applicant_current_account_with_bank: defaultData.self_employed?.applicant_current_account_with_bank || '',
        applicant_has_vehicle: defaultData.self_employed?.applicant_has_vehicle || '',
        exterior_off_floor: defaultData.self_employed?.exterior_off_floor || '',
        remark: defaultData.self_employed?.remark || '',
      },
      // Service
      service: {
        working_since: defaultData.service?.working_since || '',
        designation: defaultData.service?.designation || '',
        department_room_number: defaultData.service?.department_room_number || '',
        employee_code: defaultData.service?.employee_code || '',
        company_nature_of_business: defaultData.service?.company_nature_of_business || '',
        drawing_salary_per_month: defaultData.service?.drawing_salary_per_month || '',
        id_proof_seen: defaultData.service?.id_proof_seen || '',
        employee_seen: defaultData.service?.employee_seen || '',
        exterior_off_floor: defaultData.service?.exterior_off_floor || '',
        remark: defaultData.service?.remark || '',
      },
      // BV Neighbours
      neighbour_1_details: defaultData.neighbour_1_details || '',
      neighbour_1_remark: defaultData.neighbour_1_remark || '',
      neighbour_2_details: defaultData.neighbour_2_details || '',
      neighbour_2_remark: defaultData.neighbour_2_remark || '',
      signboard_seen_with_name: defaultData.signboard_seen_with_name || '',
      // Case Status
      case_status: defaultData.case_status || '',
      rejection_reason: defaultData.rejection_reason || '',
      rejection_reason_other: defaultData.rejection_reason_other || '',
      // Additional
      additional_remark: defaultData.additional_remark || '',
      // Location Pictures
      locationPictures: [],
      photo_source: '', // 'camera', 'gallery', or 'no_photo'
    };
  };

  // Form data state
  const [formData, setFormData] = useState(getDefaultFormData());

  const updateFormData = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const steps = isRv 
    ? ['details', 'rv_personal_details', 'rv_neighbours', 'case_status', 'take_pictures', 'preview', 'remark_submit']
    : ['details', 'bv_basic', 'work_details', 'bv_neighbours', 'case_status', 'take_pictures', 'preview', 'remark_submit'];

  const currentStepIndex = steps.indexOf(step);

  const changePage = (direction) => {
    if (direction === 'next') {
      if (currentStepIndex < steps.length - 1) {
        setStep(steps[currentStepIndex + 1]);
      }
    } else if (direction === 'pre') {
      if (currentStepIndex > 0) {
        setStep(steps[currentStepIndex - 1]);
      }
    }
  };

  const renderDetailsStep = () => (
    <View>
      {/* Single Compact Card with All Information */}
      <Card style={styles.compactDetailsCard}>
        <Card.Content style={styles.compactCardContent}>
          {/* Row 1: Reference & FL Type */}
          <View style={styles.compactRow}>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon="identifier" size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>Reference</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={1}>{caseData?.reference_number || 'N/A'}</Text>
            </View>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon="tag" size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>FL Type</Text>
              </View>
              <Text style={[styles.compactFieldValue, styles.flTypeBadge]} numberOfLines={1}>
                {caseData?.fl_type?.toUpperCase() || flTypeFromData.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Row 2: Bank/Product & Applicant */}
          <View style={styles.compactRow}>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon={caseData?.case_type === 'bank' ? "bank" : "package-variant"} size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>{caseData?.case_type === 'bank' ? 'Bank' : 'Category'}</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={1}>
                {caseData?.case_type === 'bank' 
                  ? (caseData?.bank?.name || 'N/A')
                  : (caseData?.category?.name || 'N/A')}
              </Text>
            </View>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon="account-circle" size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>Applicant</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={1}>{caseData?.applicant_name || 'N/A'}</Text>
            </View>
          </View>

          {/* Row 3: Product/Category & Work Flow */}
          <View style={styles.compactRow}>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon="package-variant" size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>Product</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={1}>
                {caseData?.case_type === 'bank' 
                  ? (caseData?.product?.name || 'N/A')
                  : (caseData?.category?.name || 'N/A')}
              </Text>
            </View>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon="workflow" size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>Work Flow</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={1}>
                {caseData?.case_type === 'miscellaneous'
                  ? (caseData?.category?.name || 'N/A')
                  : `${caseData?.bank?.name || ''} ${caseData?.product?.name || ''}`.trim() || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Row 4: Address (Full Width) */}
          <View style={styles.compactRow}>
            <View style={[styles.compactField, styles.fullWidthField]}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon={isBv ? "office-building" : "home"} size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>{isBv ? 'Office Address' : 'Permanent Address'}</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={2}>
                {isBv 
                  ? ([
                      caseData?.business_house_number,
                      caseData?.business_landmark,
                      caseData?.business_colony_details,
                      caseData?.business_city,
                      caseData?.business_phone_number
                    ].filter(Boolean).join(', ') || 'N/A')
                  : ([
                      caseData?.residence_house_no,
                      caseData?.residence_landmark,
                      caseData?.residence_colony_details,
                      caseData?.residence_city,
                      caseData?.residence_phone_number
                    ].filter(Boolean).join(', ') || 'N/A')}
              </Text>
            </View>
          </View>

          {/* Row 5: Due Date & Geo Limit */}
          <View style={styles.compactRow}>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon="calendar" size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>Due Date</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={1}>{caseData?.due_date || 'N/A'}</Text>
            </View>
            <View style={styles.compactField}>
              <View style={styles.compactFieldHeader}>
                <IconButton icon="map-marker-radius" size={14} iconColor={AppTheme.colors.primary} style={styles.compactFieldIcon} />
                <Text style={styles.compactFieldLabel}>Geo Limit</Text>
              </View>
              <Text style={styles.compactFieldValue} numberOfLines={1}>{caseData?.geo_limit || 'N/A'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Location Pictures Section */}
      <Card style={styles.compactDetailsCard}>
        <Card.Content style={styles.compactCardContent}>
          <View style={styles.imageSectionHeader}>
            <View style={styles.imageSectionTitleRow}>
              <IconButton icon="camera" size={18} iconColor={AppTheme.colors.primary} style={styles.imageSectionIcon} />
              <Text style={styles.imageSectionTitle}>Location Pictures</Text>
              {formData.locationPictures.length > 0 && (
                <View style={styles.imageCountBadge}>
                  <Text style={styles.imageCountText}>{formData.locationPictures.length}</Text>
                </View>
              )}
            </View>
            <Menu
              visible={imageSourceMenuVisible}
              onDismiss={() => setImageSourceMenuVisible(false)}
              anchor={
                <Button
                  mode="contained"
                  onPress={() => {
                    console.log('Add Location Picture button pressed');
                    setImageSourceMenuVisible(true);
                  }}
                  style={styles.compactAddButton}
                  buttonColor={AppTheme.colors.primary}
                  icon="plus"
                  contentStyle={styles.compactButtonContent}
                  labelStyle={styles.compactButtonLabel}
                >
                  Add
                </Button>
              }
            >
              <Menu.Item
                onPress={async () => {
                  setImageSourceMenuVisible(false);
                  try {
                    console.log('Camera option selected');
                    const imageData = await takePhotoWithGeoAndCompression();
                    if (imageData) {
                      setFormData(prev => ({
                        ...prev,
                        locationPictures: [...prev.locationPictures, imageData]
                      }));
                    }
                  } catch (error) {
                    console.error('Camera error:', error);
                    Alert.alert('Error', error.message || 'Failed to capture image');
                  }
                }}
                title="Camera"
                leadingIcon="camera"
              />
              <Menu.Item
                onPress={async () => {
                  setImageSourceMenuVisible(false);
                  try {
                    console.log('Gallery option selected');
                    const imageData = await pickImageFromGallery();
                    if (imageData) {
                      setFormData(prev => ({
                        ...prev,
                        locationPictures: [...prev.locationPictures, imageData]
                      }));
                    }
                  } catch (error) {
                    console.error('Gallery error:', error);
                    Alert.alert('Error', error.message || 'Failed to pick image');
                  }
                }}
                title="Gallery"
                leadingIcon="image"
              />
            </Menu>
          </View>
          {formData.locationPictures.length > 0 && (
            <View style={styles.compactImagesContainer}>
              {formData.locationPictures.map((img, index) => (
                <View key={index} style={styles.compactImageWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedImage(img);
                      setImageModalVisible(true);
                    }}
                    style={styles.compactImageTouchable}
                  >
                    <Image
                      source={{ uri: img.uri }}
                      style={styles.compactImageThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.compactImageOverlay}>
                      <IconButton
                        icon="eye"
                        size={20}
                        iconColor={AppTheme.colors.surface}
                        style={styles.viewIcon}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.compactDeleteButton}
                    onPress={() => {
                      confirmDeleteImage(() => {
                        const newPics = formData.locationPictures.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, locationPictures: newPics }));
                      });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <IconButton
                      icon="close-circle"
                      size={20}
                      iconColor={AppTheme.colors.error}
                      style={styles.compactDeleteIcon}
                    />
                  </TouchableOpacity>
                  <View style={styles.compactImageInfo}>
                    {img.address && img.address !== 'Gallery image' && (
                      <Text style={styles.compactImageInfoText} numberOfLines={1}>
                        📍 {img.address}
                      </Text>
                    )}
                    {img.latitude && img.longitude && (
                      <Text style={styles.compactImageInfoDetail} numberOfLines={1}>
                        {img.latitude.toFixed(4)}, {img.longitude.toFixed(4)}
                      </Text>
                    )}
                    {img.fileSize && (
                      <Text style={styles.compactImageInfoDetail} numberOfLines={1}>
                        📦 {formatFileSize(img.fileSize)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderRVPersonalDetails = () => (
    <View>
      {/* Contact Information Section */}
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="account" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <TextInput
            label="Name of person met*"
            value={formData.residential_details.name_of_person_met}
            onChangeText={(val) => updateFormData('residential_details.name_of_person_met', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Relationship with applicant*"
            value={formData.residential_details.met_person_relation}
            onChangeText={(val) => updateFormData('residential_details.met_person_relation', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account-group" />}
          />
          {formData.residential_details.met_person_relation === 'other' && (
            <TextInput
              label="Specify Other"
              value={formData.residential_details.other_relation}
              onChangeText={(val) => updateFormData('residential_details.other_relation', val)}
              mode="outlined"
              style={styles.formInput}
            />
          )}
          <TextInput
            label="Id proof seen*"
            value={formData.residential_details.id_proof_seen}
            onChangeText={(val) => updateFormData('residential_details.id_proof_seen', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="card-account-details" />}
          />
        </Card.Content>
      </Card>

      {/* Family Details Section */}
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="home-group" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Family Details</Text>
          </View>
          <View style={styles.rowInputs}>
            <TextInput
              label="Total family members*"
              value={formData.residential_details.member_count}
              onChangeText={(val) => updateFormData('residential_details.member_count', val)}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.formInput, styles.halfInput]}
              left={<TextInput.Icon icon="account-multiple" />}
            />
            <TextInput
              label="Earning members"
              value={formData.residential_details.earning_member_count}
              onChangeText={(val) => updateFormData('residential_details.earning_member_count', val)}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.formInput, styles.halfInput]}
              left={<TextInput.Icon icon="briefcase" />}
            />
          </View>
          <TextInput
            label="Dependent members"
            value={formData.residential_details.dependent_member_count}
            onChangeText={(val) => updateFormData('residential_details.dependent_member_count', val)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.formInput}
            left={<TextInput.Icon icon="baby-face-outline" />}
          />
          <TextInput
            label="Total stability"
            value={formData.residential_details.total_stability}
            onChangeText={(val) => updateFormData('residential_details.total_stability', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="calendar-clock" />}
          />
          <TextInput
            label="Stability < 6 month confirm last resi address*"
            value={formData.residential_details.stability_less_6_month_last_address_confirm}
            onChangeText={(val) => updateFormData('residential_details.stability_less_6_month_last_address_confirm', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="home-city" />}
          />
        </Card.Content>
      </Card>

      {/* Residence Details Section */}
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="home" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Residence Details</Text>
          </View>
          <TextInput
            label="Residence ownership*"
            value={formData.residential_details.residence_ownership}
            onChangeText={(val) => updateFormData('residential_details.residence_ownership', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="key" />}
          />
          {formData.residential_details.residence_ownership === 'other' && (
            <TextInput
              label="Specify Other"
              value={formData.residential_details.residence_ownership_other}
              onChangeText={(val) => updateFormData('residential_details.residence_ownership_other', val)}
              mode="outlined"
              style={styles.formInput}
            />
          )}
          <TextInput
            label="Agri land with location"
            value={formData.residential_details.agri_land_with_location}
            onChangeText={(val) => updateFormData('residential_details.agri_land_with_location', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="map-marker" />}
          />
          <TextInput
            label="House class locality"
            value={formData.residential_details.house_class_locality}
            onChangeText={(val) => updateFormData('residential_details.house_class_locality', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="city" />}
          />
          <TextInput
            label="House interior"
            value={formData.residential_details.house_interior}
            onChangeText={(val) => updateFormData('residential_details.house_interior', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="sofa" />}
          />
          {formData.residential_details.house_interior === 'other' && (
            <TextInput
              label="Specify Other"
              value={formData.residential_details.house_interior_other}
              onChangeText={(val) => updateFormData('residential_details.house_interior_other', val)}
              mode="outlined"
              style={styles.formInput}
            />
          )}
          <TextInput
            label="Living standard"
            value={formData.residential_details.living_standard}
            onChangeText={(val) => updateFormData('residential_details.living_standard', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="star" />}
          />
          {formData.residential_details.living_standard === 'other' && (
            <TextInput
              label="Specify Other"
              value={formData.residential_details.living_standard_other}
              onChangeText={(val) => updateFormData('residential_details.living_standard_other', val)}
              mode="outlined"
              style={styles.formInput}
            />
          )}
          <TextInput
            label="Exterior of house (area, floor, color)"
            value={formData.residential_details.exterior_of_house}
            onChangeText={(val) => updateFormData('residential_details.exterior_of_house', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="palette" />}
          />
        </Card.Content>
      </Card>

      {/* Employment & Assets Section */}
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="briefcase-outline" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Employment & Assets</Text>
          </View>
          <TextInput
            label="Applicant working company name & location*"
            value={formData.residential_details.applicant_working_company_name_location}
            onChangeText={(val) => updateFormData('residential_details.applicant_working_company_name_location', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="office-building" />}
          />
          <TextInput
            label="Vehicle details (free/finance/EMI)"
            value={formData.residential_details.vehicle_details}
            onChangeText={(val) => updateFormData('residential_details.vehicle_details', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="car" />}
          />
        </Card.Content>
      </Card>

      {/* Additional Remarks Section */}
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="note-text" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Additional Remarks</Text>
          </View>
          <TextInput
            label="Remark"
            value={formData.residential_details.remark}
            onChangeText={(val) => updateFormData('residential_details.remark', val)}
            mode="outlined"
            style={styles.formInput}
            multiline
            numberOfLines={4}
            left={<TextInput.Icon icon="pencil" />}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderRVNeighbours = () => (
    <View>
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="account-group" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Neighbour Verification</Text>
          </View>
          <Text style={styles.subsectionTitle}>Neighbour 1</Text>
          <TextInput
            label="Neighbour 1 details"
            value={formData.residential_details.neighbour_1_details}
            onChangeText={(val) => updateFormData('residential_details.neighbour_1_details', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Neighbour 1 remark"
            value={formData.residential_details.neighbour_1_remark}
            onChangeText={(val) => updateFormData('residential_details.neighbour_1_remark', val)}
            mode="outlined"
            style={styles.formInput}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="note-text" />}
          />
          <Text style={[styles.subsectionTitle, styles.subsectionTitleSpaced]}>Neighbour 2</Text>
          <TextInput
            label="Neighbour 2 details"
            value={formData.residential_details.neighbour_2_details}
            onChangeText={(val) => updateFormData('residential_details.neighbour_2_details', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Neighbour 2 remark"
            value={formData.residential_details.neighbour_2_remark}
            onChangeText={(val) => updateFormData('residential_details.neighbour_2_remark', val)}
            mode="outlined"
            style={styles.formInput}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="note-text" />}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderBVBasic = () => (
    <View>
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="account-circle" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <TextInput
            label="Met person name*"
            value={formData.met_person_name}
            onChangeText={(val) => updateFormData('met_person_name', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Relation"
            value={formData.relation}
            onChangeText={(val) => updateFormData('relation', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account-group" />}
          />
        </Card.Content>
      </Card>
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="briefcase" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Type of Work*</Text>
          </View>
          <RadioButton.Group
            onValueChange={(val) => updateFormData('type_of_business', val)}
            value={formData.type_of_business}
          >
            <View style={styles.radioOption}>
              <RadioButton value="self_employed" />
              <Text style={styles.radioText}>Self Employed</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="service" />
              <Text style={styles.radioText}>Service</Text>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>
    </View>
  );

  const renderWorkDetails = () => {
    if (formData.type_of_business === 'self_employed') {
      return (
        <View>
          <TextInput
            label="Id proof seen"
            value={formData.self_employed.id_proof_seen}
            onChangeText={(val) => updateFormData('self_employed.id_proof_seen', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Applicant Designation*"
            value={formData.self_employed.applicant_is}
            onChangeText={(val) => updateFormData('self_employed.applicant_is', val)}
            mode="outlined"
            style={styles.input}
          />
          {formData.self_employed.applicant_is === 'other' && (
            <TextInput
              label="Specify Other"
              value={formData.self_employed.applicant_is_other}
              onChangeText={(val) => updateFormData('self_employed.applicant_is_other', val)}
              mode="outlined"
              style={styles.input}
            />
          )}
          <TextInput
            label="Nature of business*"
            value={formData.self_employed.nature_of_business}
            onChangeText={(val) => updateFormData('self_employed.nature_of_business', val)}
            mode="outlined"
            style={styles.input}
          />
          {formData.self_employed.nature_of_business === 'other' && (
            <TextInput
              label="Specify Other"
              value={formData.self_employed.nature_of_business_other}
              onChangeText={(val) => updateFormData('self_employed.nature_of_business_other', val)}
              mode="outlined"
              style={styles.input}
            />
          )}
          <TextInput
            label="Business Premisis*"
            value={formData.self_employed.office_ownership}
            onChangeText={(val) => updateFormData('self_employed.office_ownership', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Stability*"
            value={formData.self_employed.stability}
            onChangeText={(val) => updateFormData('self_employed.stability', val)}
            mode="outlined"
            style={styles.input}
          />
          {formData.self_employed.stability === 'other' && (
            <TextInput
              label="Other remark"
              value={formData.self_employed.stability_other}
              onChangeText={(val) => updateFormData('self_employed.stability_other', val)}
              mode="outlined"
              style={styles.input}
            />
          )}
          <TextInput
            label="Stocks seen"
            value={formData.self_employed.stocks}
            onChangeText={(val) => updateFormData('self_employed.stocks', val)}
            mode="outlined"
            style={styles.input}
            multiline
          />
          <TextInput
            label="GST no and bill or visiting card seen"
            value={formData.self_employed.gst_bill_visiting_card_seen}
            onChangeText={(val) => updateFormData('self_employed.gst_bill_visiting_card_seen', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Business activity seen level*"
            value={formData.self_employed.business_activity_level_seen}
            onChangeText={(val) => updateFormData('self_employed.business_activity_level_seen', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Employees seen*"
            value={formData.self_employed.employee_seen}
            onChangeText={(val) => updateFormData('self_employed.employee_seen', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Applicant current account with bank branch*"
            value={formData.self_employed.applicant_current_account_with_bank}
            onChangeText={(val) => updateFormData('self_employed.applicant_current_account_with_bank', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="The applicant has vehicle"
            value={formData.self_employed.applicant_has_vehicle}
            onChangeText={(val) => updateFormData('self_employed.applicant_has_vehicle', val)}
            mode="outlined"
            style={styles.input}
          />
          <Menu
            visible={signboardMenuVisible}
            onDismiss={() => setSignboardMenuVisible(false)}
            anchor={
              <TouchableRipple
                onPress={() => setSignboardMenuVisible(true)}
                style={styles.dropdownInput}
              >
                <View style={styles.dropdownContainer}>
                  <Text style={[styles.dropdownLabel, !formData.signboard_seen_with_name && styles.dropdownPlaceholder]}>
                    {formData.signboard_seen_with_name ? formData.signboard_seen_with_name.charAt(0).toUpperCase() + formData.signboard_seen_with_name.slice(1) : 'Signboard seen with name'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </View>
              </TouchableRipple>
            }
          >
            <Menu.Item
              onPress={() => {
                updateFormData('signboard_seen_with_name', 'yes');
                setSignboardMenuVisible(false);
              }}
              title="Yes"
            />
            <Menu.Item
              onPress={() => {
                updateFormData('signboard_seen_with_name', 'no');
                setSignboardMenuVisible(false);
              }}
              title="No"
            />
          </Menu>
          <TextInput
            label="Exterior and off floor"
            value={formData.self_employed.exterior_off_floor}
            onChangeText={(val) => updateFormData('self_employed.exterior_off_floor', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Remark"
            value={formData.self_employed.remark}
            onChangeText={(val) => updateFormData('self_employed.remark', val)}
            mode="outlined"
            style={styles.input}
            multiline
          />
        </View>
      );
    } else if (formData.type_of_business === 'service') {
      return (
        <View>
          <TextInput
            label="Stability*"
            value={formData.service.working_since}
            onChangeText={(val) => updateFormData('service.working_since', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Nature of job(designation)*"
            value={formData.service.designation}
            onChangeText={(val) => updateFormData('service.designation', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Department & room no.*"
            value={formData.service.department_room_number}
            onChangeText={(val) => updateFormData('service.department_room_number', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Employee code*"
            value={formData.service.employee_code}
            onChangeText={(val) => updateFormData('service.employee_code', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Company nature of business"
            value={formData.service.company_nature_of_business}
            onChangeText={(val) => updateFormData('service.company_nature_of_business', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Applicant is drawing salary PM*"
            value={formData.service.drawing_salary_per_month}
            onChangeText={(val) => updateFormData('service.drawing_salary_per_month', val)}
            mode="outlined"
            style={styles.input}
          />
          <Menu
            visible={idProofMenuVisible}
            onDismiss={() => setIdProofMenuVisible(false)}
            anchor={
              <TouchableRipple
                onPress={() => setIdProofMenuVisible(true)}
                style={styles.dropdownInput}
              >
                <View style={styles.dropdownContainer}>
                  <Text style={[styles.dropdownLabel, !formData.service.id_proof_seen && styles.dropdownPlaceholder]}>
                    {formData.service.id_proof_seen ? formData.service.id_proof_seen.charAt(0).toUpperCase() + formData.service.id_proof_seen.slice(1) : 'Id proof seen*'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </View>
              </TouchableRipple>
            }
          >
            <Menu.Item
              onPress={() => {
                updateFormData('service.id_proof_seen', 'yes');
                setIdProofMenuVisible(false);
              }}
              title="Yes"
            />
            <Menu.Item
              onPress={() => {
                updateFormData('service.id_proof_seen', 'no');
                setIdProofMenuVisible(false);
              }}
              title="No"
            />
          </Menu>
          <TextInput
            label="Employee seen*"
            value={formData.service.employee_seen}
            onChangeText={(val) => updateFormData('service.employee_seen', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Signboard seen with name"
            value={formData.signboard_seen_with_name}
            onChangeText={(val) => updateFormData('signboard_seen_with_name', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Exterior and off floor"
            value={formData.service.exterior_off_floor}
            onChangeText={(val) => updateFormData('service.exterior_off_floor', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Remark"
            value={formData.service.remark}
            onChangeText={(val) => updateFormData('service.remark', val)}
            mode="outlined"
            style={styles.input}
            multiline
          />
        </View>
      );
    }
    return null;
  };

  const renderBVNeighbours = () => (
    <View>
      <Card style={styles.formSectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <IconButton icon="account-group" size={20} iconColor={AppTheme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Neighbour Verification</Text>
          </View>
          <Text style={styles.subsectionTitle}>Neighbour 1</Text>
          <TextInput
            label="Neighbour 1 Details"
            value={formData.neighbour_1_details}
            onChangeText={(val) => updateFormData('neighbour_1_details', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Neighbour 1 remark"
            value={formData.neighbour_1_remark}
            onChangeText={(val) => updateFormData('neighbour_1_remark', val)}
            mode="outlined"
            style={styles.formInput}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="note-text" />}
          />
          <Text style={[styles.subsectionTitle, styles.subsectionTitleSpaced]}>Neighbour 2</Text>
          <TextInput
            label="Neighbour 2 details"
            value={formData.neighbour_2_details}
            onChangeText={(val) => updateFormData('neighbour_2_details', val)}
            mode="outlined"
            style={styles.formInput}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Neighbour 2 remark"
            value={formData.neighbour_2_remark}
            onChangeText={(val) => updateFormData('neighbour_2_remark', val)}
            mode="outlined"
            style={styles.formInput}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="note-text" />}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderCaseStatus = () => (
    <View>
      <Menu
        visible={statusMenuVisible}
        onDismiss={() => setStatusMenuVisible(false)}
        anchor={
          <TouchableRipple
            onPress={() => setStatusMenuVisible(true)}
            style={styles.dropdownInput}
          >
            <View style={styles.dropdownContainer}>
              <Text style={[styles.dropdownLabel, !formData.case_status && styles.dropdownPlaceholder]}>
                {formData.case_status ? formData.case_status.charAt(0).toUpperCase() + formData.case_status.slice(1) : 'Status*'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </View>
          </TouchableRipple>
        }
      >
        <Menu.Item
          onPress={() => {
            updateFormData('case_status', 'positive');
            setStatusMenuVisible(false);
          }}
          title="Positive"
        />
        <Menu.Item
          onPress={() => {
            updateFormData('case_status', 'negative');
            setStatusMenuVisible(false);
          }}
          title="Negative"
        />
      </Menu>
      {formData.case_status === 'negative' && (
        <Card style={styles.radioCard}>
          <Card.Content>
            <Text style={styles.radioGroupTitle}>Rejection reason*</Text>
            <RadioButton.Group
              onValueChange={(val) => updateFormData('rejection_reason', val)}
              value={formData.rejection_reason}
            >
              {[
                'Poor living condition',
                'Address not traceable/does not exists',
                'Door locked',
                'Details mismatch',
                'Any other reason(not covered by above)',
                'Application or family member not met',
                'Non targeted area',
                'Outside geographical limits',
                'Residence cum office',
                'Defaulter/bad market reputation',
                'Negative neighbour check',
                'Shared/bachelor accomodation',
                'Incomplete address',
                'Wrong address',
                'Entry not allowed',
                'Details refused/application not interested for load',
                'Other'
              ].map((reason, index) => (
                <View key={index} style={styles.radioOption}>
                  <RadioButton value={reason.toLowerCase().replace(/\s+/g, '_')} />
                  <Text>{reason}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>
      )}
      {formData.rejection_reason === 'other' && (
        <TextInput
          label="Specify Other*"
          value={formData.rejection_reason_other}
          onChangeText={(val) => updateFormData('rejection_reason_other', val)}
          mode="outlined"
          style={styles.input}
        />
      )}
    </View>
  );

  const renderTakePictures = () => (
    <View>
      <Card style={styles.elegantPhotoCard}>
        <Card.Content style={styles.elegantPhotoCardContent}>
          {/* Header Section */}
          <View style={styles.elegantPhotoHeader}>
            <View style={styles.elegantPhotoTitleRow}>
              <IconButton 
                icon="camera-image" 
                size={20} 
                iconColor={AppTheme.colors.primary} 
                style={styles.elegantPhotoIcon} 
              />
              <View style={styles.elegantPhotoTitleContainer}>
                <Text style={styles.elegantPhotoTitle}>Location Pictures</Text>
                {formData.locationPictures.length > 0 && (
                  <View style={styles.elegantPhotoCountBadge}>
                    <Text style={styles.elegantPhotoCountText}>{formData.locationPictures.length}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons - Compact Grid */}
          <View style={styles.elegantPhotoActions}>
            <TouchableOpacity
              style={[
                styles.elegantPhotoActionButton,
                styles.elegantPhotoActionButtonPrimary
              ]}
              onPress={async () => {
                try {
                  const imageData = await takePhotoWithGeoAndCompression();
                  setFormData(prev => ({
                    ...prev,
                    locationPictures: [...prev.locationPictures, imageData],
                    photo_source: 'camera'
                  }));
                } catch (error) {
                  Alert.alert('Error', error.message || 'Failed to capture image');
                }
              }}
            >
              <IconButton icon="camera" size={22} iconColor={AppTheme.colors.surface} style={styles.elegantActionIcon} />
              <Text style={styles.elegantActionButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.elegantPhotoActionButton,
                styles.elegantPhotoActionButtonPrimary
              ]}
              onPress={async () => {
                try {
                  const imageData = await pickImageFromGallery();
                  setFormData(prev => ({
                    ...prev,
                    locationPictures: [...prev.locationPictures, imageData],
                    photo_source: 'gallery'
                  }));
                } catch (error) {
                  Alert.alert('Error', error.message || 'Failed to pick image');
                }
              }}
            >
              <IconButton icon="image" size={22} iconColor={AppTheme.colors.surface} style={styles.elegantActionIcon} />
              <Text style={styles.elegantActionButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.elegantPhotoActionButton,
                formData.photo_source === 'no_photo' 
                  ? styles.elegantPhotoActionButtonSelected 
                  : styles.elegantPhotoActionButtonSecondary
              ]}
              onPress={() => {
                setFormData(prev => ({
                  ...prev,
                  locationPictures: [],
                  photo_source: 'no_photo'
                }));
              }}
            >
              <IconButton 
                icon={formData.photo_source === 'no_photo' ? "check-circle" : "image-off"} 
                size={22} 
                iconColor={formData.photo_source === 'no_photo' ? AppTheme.colors.surface : AppTheme.colors.onSurfaceVariant} 
                style={styles.elegantActionIcon} 
              />
              <Text style={[
                formData.photo_source === 'no_photo' 
                  ? styles.elegantActionButtonTextSelected 
                  : styles.elegantActionButtonTextSecondary
              ]}>No Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Images Grid */}
          {formData.locationPictures.length > 0 && (
            <View style={styles.elegantImagesGrid}>
              {formData.locationPictures.map((img, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.elegantImageCard,
                    (index + 1) % 3 === 0 && styles.elegantImageCardLastInRow
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setSelectedImage(img);
                      setImageModalVisible(true);
                    }}
                    style={styles.elegantImageTouchable}
                  >
                    <Image
                      source={{ uri: img.uri }}
                      style={styles.elegantImageThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.elegantImageOverlay}>
                      <IconButton
                        icon="eye"
                        size={18}
                        iconColor={AppTheme.colors.surface}
                        style={styles.elegantViewIcon}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.elegantDeleteButton}
                    onPress={() => {
                      confirmDeleteImage(() => {
                        const newPics = formData.locationPictures.filter((_, i) => i !== index);
                        setFormData(prev => ({ 
                          ...prev, 
                          locationPictures: newPics,
                          photo_source: newPics.length === 0 ? 'no_photo' : prev.photo_source
                        }));
                      });
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <IconButton
                      icon="close-circle"
                      size={18}
                      iconColor={AppTheme.colors.error}
                      style={styles.elegantDeleteIcon}
                    />
                  </TouchableOpacity>
                  <View style={styles.elegantImageInfo}>
                    {img.address && img.address !== 'Gallery image' && (
                      <Text style={styles.elegantImageInfoText} numberOfLines={1}>
                        📍 {img.address}
                      </Text>
                    )}
                    {img.latitude && img.longitude && (
                      <Text style={styles.elegantImageInfoDetail} numberOfLines={1}>
                        {img.latitude.toFixed(4)}, {img.longitude.toFixed(4)}
                      </Text>
                    )}
                    {img.fileSize && (
                      <Text style={styles.elegantImageInfoDetail} numberOfLines={1}>
                        📦 {formatFileSize(img.fileSize)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* No Photo Status Indicator */}
          {formData.photo_source === 'no_photo' && formData.locationPictures.length === 0 && (
            <View style={styles.elegantNoPhotoIndicator}>
              <IconButton icon="image-off" size={24} iconColor={AppTheme.colors.onSurfaceVariant} style={styles.elegantNoPhotoIcon} />
              <Text style={styles.elegantNoPhotoText}>No photos selected</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderPreview = () => (
    <View>
      <TextInput
        label="Additional remark*"
        value={formData.additional_remark}
        onChangeText={(val) => updateFormData('additional_remark', val)}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderRemarkSubmit = () => (
    <ScrollView>
      {isRv && renderRVPersonalDetails()}
      {isRv && renderRVNeighbours()}
      {isBv && renderBVBasic()}
      {isBv && formData.type_of_business && renderWorkDetails()}
      {isBv && renderBVNeighbours()}
      {renderCaseStatus()}
      <TextInput
        label="Additional remark*"
        value={formData.additional_remark}
        onChangeText={(val) => updateFormData('additional_remark', val)}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={4}
      />
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'details':
        return renderDetailsStep();
      case 'rv_personal_details':
        return renderRVPersonalDetails();
      case 'rv_neighbours':
        return renderRVNeighbours();
      case 'bv_basic':
        return renderBVBasic();
      case 'work_details':
        return renderWorkDetails();
      case 'bv_neighbours':
        return renderBVNeighbours();
      case 'case_status':
        return renderCaseStatus();
      case 'take_pictures':
        return renderTakePictures();
      case 'preview':
        return renderPreview();
      case 'remark_submit':
        return renderRemarkSubmit();
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    console.log('========== FORM SUBMISSION DATA ==========');
    console.log('Case Data:', JSON.stringify(caseData, null, 2));
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    console.log('Case Type:', caseType);
    console.log('FL Type:', flTypeFromData);
    console.log('Total Location Pictures:', formData.locationPictures.length);
    console.log('Photo Source:', formData.photo_source);
    console.log('==========================================');
    
    // Handle form submission
    navigation.goBack();
  };

  const canProceed = () => {
    if (step === 'case_status' && !formData.case_status) return false;
    if (step === 'preview' && !formData.additional_remark) return false;
    if (step === 'remark_submit' && !formData.additional_remark) return false;
    return true;
  };

  // Get header title - show applicant name or case ID
  const getHeaderTitle = () => {
    if (caseData?.applicant_name) {
      return caseData.applicant_name;
    }
    if (caseData?.case_id) {
      return caseData.case_id;
    }
    if (caseData?.reference_number) {
      return caseData.reference_number;
    }
    return 'Process Application';
  };

  return (
    <AppLayout>
      <AppHeader title={getHeaderTitle()} back navigation={navigation} />
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {renderStepContent()}
        </ScrollView>
        {currentStepIndex > 0 && (
          <FAB
            icon="arrow-left"
            style={styles.fabLeft}
            onPress={() => changePage('pre')}
            color="white"
            size="small"
          />
        )}
        {step !== 'remark_submit' ? (
          <FAB
            icon="arrow-right"
            style={styles.fab}
            onPress={() => changePage('next')}
            disabled={!canProceed()}
            color="white"
            size="small"
          />
        ) : (
          <FAB
            icon="check"
            style={styles.fab}
            onPress={handleSubmit}
            disabled={!canProceed()}
            color="white"
            size="small"
          />
        )}
      </View>
      
      {/* Image Modal for Full Screen View */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <IconButton
              icon="close"
              iconColor={AppTheme.colors.surface}
              size={28}
              onPress={() => setImageModalVisible(false)}
            />
          </View>
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.modalImageInfo}>
                {selectedImage.address && selectedImage.address !== 'Gallery image' && (
                  <>
                    <View style={styles.modalImageInfoRow}>
                      <IconButton icon="map-marker" size={16} iconColor={AppTheme.colors.surface} style={styles.modalInfoIcon} />
                      <Text style={styles.modalImageInfoText}>
                        {selectedImage.address}
                      </Text>
                    </View>
                    {selectedImage.latitude && selectedImage.longitude && (
                      <>
                        <View style={styles.modalImageInfoRow}>
                          <IconButton icon="latitude" size={16} iconColor={AppTheme.colors.surface} style={styles.modalInfoIcon} />
                          <Text style={styles.modalImageDetailText}>
                            Lat: {selectedImage.latitude.toFixed(6)}
                          </Text>
                        </View>
                        <View style={styles.modalImageInfoRow}>
                          <IconButton icon="longitude" size={16} iconColor={AppTheme.colors.surface} style={styles.modalInfoIcon} />
                          <Text style={styles.modalImageDetailText}>
                            Long: {selectedImage.longitude.toFixed(6)}
                          </Text>
                        </View>
                        {selectedImage.accuracy && (
                          <View style={styles.modalImageInfoRow}>
                            <IconButton icon="crosshairs-gps" size={16} iconColor={AppTheme.colors.surface} style={styles.modalInfoIcon} />
                            <Text style={styles.modalImageDetailText}>
                              Accuracy: {selectedImage.accuracy.toFixed(0)}m
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </>
                )}
                {selectedImage.fileSize && (
                  <View style={styles.modalImageInfoRow}>
                    <IconButton icon="file-image" size={16} iconColor={AppTheme.colors.surface} style={styles.modalInfoIcon} />
                    <Text style={styles.modalImageDetailText}>
                      Size: {formatFileSize(selectedImage.fileSize)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
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
    paddingBottom: 80, // Add padding to prevent content from being hidden behind FAB
  },
  sectionCard: {
    marginBottom: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.xs,
  },
  detailLabel: {
    fontSize: AppTheme.typography.body.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
    flex: 1,
  },
  detailValue: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurfaceVariant,
    flex: 2,
  },
  compactDetailRow: {
    flexDirection: 'row',
    marginBottom: AppTheme.spacing.md,
    alignItems: 'flex-start',
  },
  detailIcon: {
    margin: 0,
    marginRight: AppTheme.spacing.xs,
    padding: 0,
    width: 24,
    height: 24,
  },
  compactDetailContent: {
    flex: 1,
    paddingTop: 2,
  },
  compactDetailLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: AppTheme.colors.onSurfaceVariant,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactDetailValue: {
    fontSize: AppTheme.typography.body.fontSize,
    fontWeight: '500',
    color: AppTheme.colors.onSurface,
    lineHeight: 20,
  },
  flTypeBadge: {
    backgroundColor: AppTheme.colors.primaryContainer,
    color: AppTheme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'flex-start',
    fontWeight: '600',
    fontSize: 10,
    overflow: 'hidden',
  },
  compactDetailsCard: {
    marginBottom: AppTheme.spacing.sm,
    borderRadius: AppTheme.roundness,
    elevation: 2,
    backgroundColor: AppTheme.colors.surface,
  },
  compactCardContent: {
    padding: AppTheme.spacing.sm,
  },
  compactRow: {
    flexDirection: 'row',
    marginBottom: AppTheme.spacing.xs,
    gap: AppTheme.spacing.xs,
  },
  compactField: {
    flex: 1,
    paddingVertical: AppTheme.spacing.xs,
    paddingHorizontal: AppTheme.spacing.xs,
    backgroundColor: AppTheme.colors.surfaceVariant + '20',
    borderRadius: 6,
    minHeight: 48,
    justifyContent: 'flex-start',
  },
  fullWidthField: {
    flex: 1,
  },
  compactFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  compactFieldIcon: {
    margin: 0,
    marginRight: 2,
    padding: 0,
    width: 16,
    height: 16,
  },
  compactFieldLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: AppTheme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  compactFieldValue: {
    fontSize: 12,
    fontWeight: '500',
    color: AppTheme.colors.onSurface,
    marginTop: 2,
    lineHeight: 16,
  },
  locationButton: {
    marginTop: AppTheme.spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: AppTheme.spacing.md,
  },
  imageWrapper: {
    width: 120,
    height: 140,
    margin: AppTheme.spacing.xs,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.roundness,
    position: 'relative',
    overflow: 'visible', // Changed from 'hidden' to prevent clipping
  },
  imageTouchable: {
    width: '100%',
    height: 100,
    borderRadius: AppTheme.roundness,
    overflow: 'hidden',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: AppTheme.roundness,
  },
  imageInfo: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 100,
  },
  imageInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  imageInfoText: {
    color: AppTheme.colors.surface,
    fontSize: 9,
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  imageInfoDetailText: {
    color: AppTheme.colors.surfaceVariant,
    fontSize: 8,
    marginLeft: 4,
  },
  infoIcon: {
    margin: 0,
    padding: 0,
    width: 12,
    height: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: AppTheme.colors.error,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteIcon: {
    margin: 0,
  },
  deleteButtonText: {
    color: AppTheme.colors.surface,
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 40,
  },
  modalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 200,
  },
  modalImageInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 8,
  },
  modalImageInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalInfoIcon: {
    margin: 0,
    padding: 0,
    width: 16,
    height: 16,
  },
  modalImageInfoText: {
    color: AppTheme.colors.surface,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  modalImageDetailText: {
    color: AppTheme.colors.surfaceVariant,
    fontSize: 12,
    marginLeft: 8,
  },
  imagesCard: {
    marginTop: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  imagesTitle: {
    fontSize: AppTheme.typography.h4.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.sm,
  },
  imageSourceButtons: {
    flexDirection: 'row',
    gap: AppTheme.spacing.xs,
    marginTop: 0,
  },
  sourceButton: {
    flex: 1,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
    paddingBottom: AppTheme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.outline + '20',
  },
  imageSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageSectionIcon: {
    margin: 0,
    marginRight: AppTheme.spacing.xs,
    padding: 0,
  },
  imageSectionTitle: {
    fontSize: AppTheme.typography.h5.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
  },
  imageCountBadge: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: AppTheme.spacing.xs,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCountText: {
    color: AppTheme.colors.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  compactAddButton: {
    margin: 0,
    marginLeft: AppTheme.spacing.xs,
  },
  compactButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 36,
  },
  compactButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginVertical: 0,
    paddingVertical: 0,
  },
  compactImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: AppTheme.spacing.sm,
    gap: AppTheme.spacing.xs,
    justifyContent: 'flex-start',
  },
  compactImageWrapper: {
    width: 85,
    marginBottom: AppTheme.spacing.xs,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 6,
    position: 'relative',
    overflow: 'visible',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    borderWidth: 0.5,
    borderColor: AppTheme.colors.outline + '15',
  },
  compactImageTouchable: {
    width: '100%',
    height: 85,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  compactImageThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  compactImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewIcon: {
    margin: 0,
    padding: 0,
    width: 32,
    height: 32,
  },
  compactDeleteButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 10,
    elevation: 4,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactDeleteIcon: {
    margin: 0,
    padding: 0,
    width: 20,
    height: 20,
  },
  compactImageInfo: {
    padding: 4,
    paddingTop: 4,
    backgroundColor: AppTheme.colors.surface,
    minHeight: 30,
  },
  compactImageInfoText: {
    color: AppTheme.colors.onSurface,
    fontSize: 7,
    fontWeight: '500',
    marginBottom: 1,
    lineHeight: 10,
  },
  compactImageInfoDetail: {
    color: AppTheme.colors.onSurfaceVariant,
    fontSize: 6,
    marginBottom: 0,
    lineHeight: 8,
  },
  compactSourceButton: {
    flex: 1,
    marginHorizontal: AppTheme.spacing.xs / 2,
    height: 36,
  },
  input: {
    marginBottom: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
  },
  formSectionCard: {
    marginBottom: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    elevation: 2,
    backgroundColor: AppTheme.colors.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.outline + '20',
  },
  sectionIcon: {
    margin: 0,
    marginRight: AppTheme.spacing.xs,
  },
  sectionTitle: {
    fontSize: AppTheme.typography.h5.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
    flex: 1,
  },
  subsectionTitle: {
    fontSize: AppTheme.typography.body.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.xs,
    marginTop: AppTheme.spacing.sm,
  },
  subsectionTitleSpaced: {
    marginTop: 16,
  },
  formInput: {
    marginBottom: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.surface,
  },
  halfInput: {
    flex: 1,
    marginRight: AppTheme.spacing.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: AppTheme.spacing.xs,
  },
  radioCard: {
    marginBottom: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    elevation: 2,
  },
  radioGroupTitle: {
    fontSize: AppTheme.typography.h4.fontSize,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
    marginBottom: AppTheme.spacing.sm,
  },
  radioText: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xs,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: AppTheme.colors.primary,
  },
  fabLeft: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: AppTheme.colors.primary,
  },
  dropdownInput: {
    marginBottom: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.outline,
    borderRadius: AppTheme.roundness,
    backgroundColor: AppTheme.colors.surface,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  dropdownLabel: {
    fontSize: 16,
    color: AppTheme.colors.onSurface,
  },
  dropdownPlaceholder: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  dropdownArrow: {
    fontSize: 12,
    color: AppTheme.colors.onSurfaceVariant,
  },
  // Elegant Photo Section Styles
  elegantPhotoCard: {
    marginBottom: AppTheme.spacing.sm,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: AppTheme.colors.surface,
    overflow: 'hidden',
  },
  elegantPhotoCardContent: {
    padding: AppTheme.spacing.md,
  },
  elegantPhotoHeader: {
    marginBottom: AppTheme.spacing.md,
  },
  elegantPhotoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elegantPhotoIcon: {
    margin: 0,
    marginRight: AppTheme.spacing.xs,
    padding: 0,
  },
  elegantPhotoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  elegantPhotoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.colors.onSurface,
    letterSpacing: 0.3,
  },
  elegantPhotoCountBadge: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: AppTheme.spacing.xs,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elegantPhotoCountText: {
    color: AppTheme.colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  elegantPhotoActions: {
    flexDirection: 'row',
    gap: AppTheme.spacing.xs,
    marginBottom: AppTheme.spacing.md,
  },
  elegantPhotoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 44,
  },
  elegantPhotoActionButtonPrimary: {
    backgroundColor: AppTheme.colors.primary,
  },
  elegantPhotoActionButtonSecondary: {
    backgroundColor: AppTheme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: AppTheme.colors.outline,
  },
  elegantPhotoActionButtonSelected: {
    backgroundColor: AppTheme.colors.error,
  },
  elegantActionIcon: {
    margin: 0,
    marginRight: 4,
    padding: 0,
  },
  elegantActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.colors.surface,
    letterSpacing: 0.2,
  },
  elegantActionButtonTextSecondary: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  elegantActionButtonTextSelected: {
    color: AppTheme.colors.surface,
  },
  elegantImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: AppTheme.spacing.xs,
    justifyContent: 'flex-start',
  },
  elegantImageCard: {
    width: Math.floor((Dimensions.get('window').width - (AppTheme.spacing.md * 2) - (AppTheme.spacing.xs * 2)) / 3),
    marginRight: AppTheme.spacing.xs,
    marginBottom: AppTheme.spacing.xs,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 8,
    position: 'relative',
    overflow: 'visible',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 0.5,
    borderColor: AppTheme.colors.outline + '20',
  },
  elegantImageCardLastInRow: {
    marginRight: 0,
  },
  elegantImageTouchable: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: AppTheme.colors.surfaceVariant,
  },
  elegantImageThumbnail: {
    width: '100%',
    height: '100%',
  },
  elegantImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elegantViewIcon: {
    margin: 0,
    padding: 0,
  },
  elegantDeleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
    elevation: 5,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  elegantDeleteIcon: {
    margin: 0,
    padding: 0,
  },
  elegantImageInfo: {
    padding: 6,
    paddingTop: 4,
    backgroundColor: AppTheme.colors.surface,
    minHeight: 32,
  },
  elegantImageInfoText: {
    color: AppTheme.colors.onSurface,
    fontSize: 8,
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 11,
  },
  elegantImageInfoDetail: {
    color: AppTheme.colors.onSurfaceVariant,
    fontSize: 7,
    marginBottom: 1,
    lineHeight: 9,
  },
  elegantNoPhotoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.surfaceVariant + '40',
    borderRadius: 8,
    marginTop: AppTheme.spacing.xs,
  },
  elegantNoPhotoIcon: {
    margin: 0,
    marginRight: AppTheme.spacing.xs,
    padding: 0,
  },
  elegantNoPhotoText: {
    fontSize: 13,
    color: AppTheme.colors.onSurfaceVariant,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
