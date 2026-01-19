import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, TextInput, Button, RadioButton, Divider } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';

export default function ProcessApplicationScreen({ route, navigation }) {
  const { caseData } = route.params || {};
  
  // Determine case type from FL Type (Bv = Business Verification, Rv = Residential Verification)
  const flType = caseData?.subtitle?.split(':')[1]?.trim()?.toLowerCase() || 'bv';
  const caseType = flType.includes('rv') ? 'rv' : 'bv';
  const isBv = caseType === 'bv';
  const isRv = caseType === 'rv';

  // Step management
  const [step, setStep] = useState('details');
  
  // Form data state
  const [formData, setFormData] = useState({
    // RV Personal Details
    residential_details: {
      name_of_person_met: '',
      met_person_relation: '',
      other_relation: '',
      id_proof_seen: '',
      member_count: '',
      earning_member_count: '',
      dependent_member_count: '',
      total_stability: '',
      stability_less_6_month_last_address_confirm: '',
      residence_ownership: '',
      residence_ownership_other: '',
      agri_land_with_location: '',
      applicant_working_company_name_location: '',
      vehicle_details: '',
      house_class_locality: '',
      house_interior: '',
      house_interior_other: '',
      living_standard: '',
      living_standard_other: '',
      exterior_of_house: '',
      remark: '',
      neighbour_1_details: '',
      neighbour_1_remark: '',
      neighbour_2_details: '',
      neighbour_2_remark: '',
    },
    // BV Basic
    met_person_name: '',
    relation: '',
    type_of_business: '',
    // Self Employed
    self_employed: {
      id_proof_seen: '',
      applicant_is: '',
      applicant_is_other: '',
      nature_of_business: '',
      nature_of_business_other: '',
      office_ownership: '',
      stability: '',
      stability_other: '',
      stocks: '',
      gst_bill_visiting_card_seen: '',
      business_activity_level_seen: '',
      employee_seen: '',
      applicant_current_account_with_bank: '',
      applicant_has_vehicle: '',
      exterior_off_floor: '',
      remark: '',
    },
    // Service
    service: {
      working_since: '',
      designation: '',
      department_room_number: '',
      employee_code: '',
      company_nature_of_business: '',
      drawing_salary_per_month: '',
      id_proof_seen: '',
      employee_seen: '',
      exterior_off_floor: '',
      remark: '',
    },
    // BV Neighbours
    neighbour_1_details: '',
    neighbour_1_remark: '',
    neighbour_2_details: '',
    neighbour_2_remark: '',
    signboard_seen_with_name: '',
    // Case Status
    case_status: '',
    rejection_reason: '',
    rejection_reason_other: '',
    // Additional
    additional_remark: '',
    // Location Pictures
    locationPictures: [],
  });

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
      <Card style={styles.sectionCard}>
        <Card.Content>
          {caseData?.case_type === 'bank' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Name:</Text>
              <Text style={styles.detailValue}>{caseData?.bank?.name || 'N/A'}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product Name:</Text>
            <Text style={styles.detailValue}>
              {caseData?.case_type === 'bank' 
                ? (caseData?.product?.name || 'N/A')
                : (caseData?.category?.name || 'N/A')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number:</Text>
            <Text style={styles.detailValue}>{caseData?.reference_number || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>FL Type:</Text>
            <Text style={styles.detailValue}>{caseData?.fl_type || flType}</Text>
          </View>
          {isBv && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Office City:</Text>
              <Text style={styles.detailValue}>{caseData?.business_city || 'N/A'}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Applicant Name:</Text>
            <Text style={styles.detailValue}>{caseData?.applicant_name || 'N/A'}</Text>
          </View>
          {isBv && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Office Address:</Text>
              <Text style={styles.detailValue}>
                {[
                  caseData?.business_house_number,
                  caseData?.business_landmark,
                  caseData?.business_colony_details,
                  caseData?.business_city,
                  caseData?.business_phone_number
                ].filter(Boolean).join(' ') || 'N/A'}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Work Flow:</Text>
            <Text style={styles.detailValue}>
              {caseData?.case_type === 'miscellaneous'
                ? (caseData?.category?.name || 'N/A')
                : `${caseData?.bank?.name || ''} ${caseData?.product?.name || ''}`.trim() || 'N/A'}
            </Text>
          </View>
          {isRv && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Permanent Address:</Text>
              <Text style={styles.detailValue}>
                {[
                  caseData?.residence_house_no,
                  caseData?.residence_landmark,
                  caseData?.residence_colony_details,
                  caseData?.residence_city,
                  caseData?.residence_phone_number
                ].filter(Boolean).join(' ') || 'N/A'}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>{caseData?.due_date || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Geo Limit:</Text>
            <Text style={styles.detailValue}>{caseData?.geo_limit || 'N/A'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => console.log('Add Location Picture')}
            style={styles.locationButton}
            buttonColor={AppTheme.colors.primary}
          >
            Add Location Picture
          </Button>
          {formData.locationPictures.length > 0 && (
            <View style={styles.imagesContainer}>
              {formData.locationPictures.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      const newPics = formData.locationPictures.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, locationPictures: newPics }));
                    }}
                  >
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                  {/* Image would be displayed here */}
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
      <TextInput
        label="Name of person met*"
        value={formData.residential_details.name_of_person_met}
        onChangeText={(val) => updateFormData('residential_details.name_of_person_met', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Relationship with applicant*"
        value={formData.residential_details.met_person_relation}
        onChangeText={(val) => updateFormData('residential_details.met_person_relation', val)}
        mode="outlined"
        style={styles.input}
      />
      {formData.residential_details.met_person_relation === 'other' && (
        <TextInput
          label="Specify Other"
          value={formData.residential_details.other_relation}
          onChangeText={(val) => updateFormData('residential_details.other_relation', val)}
          mode="outlined"
          style={styles.input}
        />
      )}
      <TextInput
        label="Id proof seen*"
        value={formData.residential_details.id_proof_seen}
        onChangeText={(val) => updateFormData('residential_details.id_proof_seen', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Total family members*"
        value={formData.residential_details.member_count}
        onChangeText={(val) => updateFormData('residential_details.member_count', val)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Total earning member in the family"
        value={formData.residential_details.earning_member_count}
        onChangeText={(val) => updateFormData('residential_details.earning_member_count', val)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Total dependant member in the family"
        value={formData.residential_details.dependent_member_count}
        onChangeText={(val) => updateFormData('residential_details.dependent_member_count', val)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Total stability"
        value={formData.residential_details.total_stability}
        onChangeText={(val) => updateFormData('residential_details.total_stability', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Stability < 6 month confirm last resi address*"
        value={formData.residential_details.stability_less_6_month_last_address_confirm}
        onChangeText={(val) => updateFormData('residential_details.stability_less_6_month_last_address_confirm', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="The residence ownership*"
        value={formData.residential_details.residence_ownership}
        onChangeText={(val) => updateFormData('residential_details.residence_ownership', val)}
        mode="outlined"
        style={styles.input}
      />
      {formData.residential_details.residence_ownership === 'other' && (
        <TextInput
          label="Specify Other"
          value={formData.residential_details.residence_ownership_other}
          onChangeText={(val) => updateFormData('residential_details.residence_ownership_other', val)}
          mode="outlined"
          style={styles.input}
        />
      )}
      <TextInput
        label="Agri land with location"
        value={formData.residential_details.agri_land_with_location}
        onChangeText={(val) => updateFormData('residential_details.agri_land_with_location', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Applicant working company name & location*"
        value={formData.residential_details.applicant_working_company_name_location}
        onChangeText={(val) => updateFormData('residential_details.applicant_working_company_name_location', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Vehicle details.. free/finance (EMI)"
        value={formData.residential_details.vehicle_details}
        onChangeText={(val) => updateFormData('residential_details.vehicle_details', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="House class locality"
        value={formData.residential_details.house_class_locality}
        onChangeText={(val) => updateFormData('residential_details.house_class_locality', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="House interior"
        value={formData.residential_details.house_interior}
        onChangeText={(val) => updateFormData('residential_details.house_interior', val)}
        mode="outlined"
        style={styles.input}
      />
      {formData.residential_details.house_interior === 'other' && (
        <TextInput
          label="Specify Other"
          value={formData.residential_details.house_interior_other}
          onChangeText={(val) => updateFormData('residential_details.house_interior_other', val)}
          mode="outlined"
          style={styles.input}
        />
      )}
      <TextInput
        label="Living standard"
        value={formData.residential_details.living_standard}
        onChangeText={(val) => updateFormData('residential_details.living_standard', val)}
        mode="outlined"
        style={styles.input}
      />
      {formData.residential_details.living_standard === 'other' && (
        <TextInput
          label="Specify Other"
          value={formData.residential_details.living_standard_other}
          onChangeText={(val) => updateFormData('residential_details.living_standard_other', val)}
          mode="outlined"
          style={styles.input}
        />
      )}
      <TextInput
        label="Exterior of house (area, floor, color)"
        value={formData.residential_details.exterior_of_house}
        onChangeText={(val) => updateFormData('residential_details.exterior_of_house', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Remark"
        value={formData.residential_details.remark}
        onChangeText={(val) => updateFormData('residential_details.remark', val)}
        mode="outlined"
        style={styles.input}
        multiline
      />
    </View>
  );

  const renderRVNeighbours = () => (
    <View>
      <TextInput
        label="Neighbour 1 details"
        value={formData.residential_details.neighbour_1_details}
        onChangeText={(val) => updateFormData('residential_details.neighbour_1_details', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Neighbour 1 remark"
        value={formData.residential_details.neighbour_1_remark}
        onChangeText={(val) => updateFormData('residential_details.neighbour_1_remark', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Neighbour 2 details"
        value={formData.residential_details.neighbour_2_details}
        onChangeText={(val) => updateFormData('residential_details.neighbour_2_details', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Neighbour 2 remark"
        value={formData.residential_details.neighbour_2_remark}
        onChangeText={(val) => updateFormData('residential_details.neighbour_2_remark', val)}
        mode="outlined"
        style={styles.input}
      />
    </View>
  );

  const renderBVBasic = () => (
    <View>
      <TextInput
        label="Met person name*"
        value={formData.met_person_name}
        onChangeText={(val) => updateFormData('met_person_name', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Relation"
        value={formData.relation}
        onChangeText={(val) => updateFormData('relation', val)}
        mode="outlined"
        style={styles.input}
      />
      <Card style={styles.radioCard}>
        <Card.Content>
          <Text style={styles.radioGroupTitle}>Type of work*</Text>
          <RadioButton.Group
            onValueChange={(val) => updateFormData('type_of_business', val)}
            value={formData.type_of_business}
          >
            <View style={styles.radioOption}>
              <RadioButton value="self_employed" />
              <Text>Self employed</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="service" />
              <Text>Service</Text>
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
          <TextInput
            label="Signboard seen with name"
            value={formData.signboard_seen_with_name}
            onChangeText={(val) => updateFormData('signboard_seen_with_name', val)}
            mode="outlined"
            style={styles.input}
          />
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
          <TextInput
            label="Id proof seen*"
            value={formData.service.id_proof_seen}
            onChangeText={(val) => updateFormData('service.id_proof_seen', val)}
            mode="outlined"
            style={styles.input}
          />
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
      <TextInput
        label="Neighbour 1 Details"
        value={formData.neighbour_1_details}
        onChangeText={(val) => updateFormData('neighbour_1_details', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Neighbour 1 remark"
        value={formData.neighbour_1_remark}
        onChangeText={(val) => updateFormData('neighbour_1_remark', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Neighbour 2 details"
        value={formData.neighbour_2_details}
        onChangeText={(val) => updateFormData('neighbour_2_details', val)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Neighbour 2 remark"
        value={formData.neighbour_2_remark}
        onChangeText={(val) => updateFormData('neighbour_2_remark', val)}
        mode="outlined"
        style={styles.input}
      />
    </View>
  );

  const renderCaseStatus = () => (
    <View>
      <TextInput
        label="Status*"
        value={formData.case_status}
        onChangeText={(val) => updateFormData('case_status', val)}
        mode="outlined"
        style={styles.input}
      />
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
      <Card style={styles.radioCard}>
        <Card.Content>
          <Text style={styles.radioGroupTitle}>Take photo*</Text>
          <RadioButton.Group
            onValueChange={(val) => {
              if (val === 'camera') {
                console.log('Open camera');
              } else if (val === 'gallery') {
                console.log('Open gallery');
              }
            }}
            value=""
          >
            <View style={styles.radioOption}>
              <RadioButton value="camera" />
              <Text>Camera</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="gallery" />
              <Text>Gallery</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="no_photo" />
              <Text>No photo</Text>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>
      {formData.locationPictures.length > 0 && (
        <View style={styles.imagesContainer}>
          {formData.locationPictures.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  const newPics = formData.locationPictures.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, locationPictures: newPics }));
                }}
              >
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
    console.log('Submitting form data:', formData);
    // Handle form submission
    navigation.goBack();
  };

  const canProceed = () => {
    if (step === 'case_status' && !formData.case_status) return false;
    if (step === 'preview' && !formData.additional_remark) return false;
    if (step === 'remark_submit' && !formData.additional_remark) return false;
    return true;
  };

  return (
    <AppLayout>
      <AppHeader title="Process Application" back navigation={navigation} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {renderStepContent()}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {currentStepIndex > 0 && (
          <Button
            mode="outlined"
            onPress={() => changePage('pre')}
            style={styles.backButton}
            buttonColor={AppTheme.colors.surface}
          >
            Back
          </Button>
        )}
        {step !== 'remark_submit' ? (
          <Button
            mode="contained"
            onPress={() => changePage('next')}
            style={styles.nextButton}
            buttonColor={AppTheme.colors.primary}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.nextButton}
            buttonColor={AppTheme.colors.primary}
            disabled={!canProceed()}
          >
            Submit
          </Button>
        )}
      </View>
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
  locationButton: {
    marginTop: AppTheme.spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: AppTheme.spacing.md,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: AppTheme.spacing.xs,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.roundness,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: AppTheme.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: AppTheme.colors.surface,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
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
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.outline,
  },
  backButton: {
    flex: 1,
    marginRight: AppTheme.spacing.sm,
  },
  nextButton: {
    flex: 1,
    marginLeft: AppTheme.spacing.sm,
  },
});
