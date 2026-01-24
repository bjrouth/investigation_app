/**
 * Test Data Generator Helper
 * Generates random test data for form fields
 */

// Random name generators
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Patricia', 'Joseph', 'Linda'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor'];
const relations = ['self', 'spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'other'];
const businessTypes = ['retail', 'wholesale', 'manufacturing', 'service', 'trading', 'other'];
const ownershipTypes = ['owned', 'rented', 'leased', 'other'];
const houseInteriors = ['good', 'average', 'poor', 'other'];
const livingStandards = ['high', 'medium', 'low', 'other'];
const idProofTypes = ['yes', 'no'];
const employeeCounts = ['1-5', '6-10', '11-20', '21-50', '50+'];
const stabilityOptions = ['less_than_6_months', '6_months_to_1_year', '1_to_3_years', 'more_than_3_years', 'other'];
const businessActivityLevels = ['high', 'medium', 'low'];
const vehicleTypes = ['car', 'bike', 'scooter', 'none'];
const houseClasses = ['posh', 'middle_class', 'lower_middle', 'slum'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const companies = ['Tech Corp', 'Global Industries', 'ABC Services', 'XYZ Solutions', 'Prime Business', 'Elite Enterprises'];
const departments = ['Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Operations', 'Production'];
const designations = ['Manager', 'Executive', 'Senior Executive', 'Assistant Manager', 'Team Lead', 'Supervisor'];

// Helper function to get random item from array
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random number in range
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random boolean
const randomBoolean = () => Math.random() > 0.5;

/**
 * Generate random test data for RV (Residential Verification) case
 * @returns {Object} Form data object with random values
 */
export const generateRVTestData = () => {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const relation = randomItem(relations);
  
  return {
    residential_details: {
      name_of_person_met: `${firstName} ${lastName}`,
      met_person_relation: relation,
      other_relation: relation === 'other' ? 'Cousin' : '',
      id_proof_seen: randomItem(idProofTypes),
      member_count: randomNumber(2, 8).toString(),
      earning_member_count: randomNumber(1, 4).toString(),
      dependent_member_count: randomNumber(0, 3).toString(),
      total_stability: randomItem(stabilityOptions),
      stability_less_6_month_last_address_confirm: randomBoolean() ? 'yes' : 'no',
      residence_ownership: randomItem(ownershipTypes),
      residence_ownership_other: '',
      agri_land_with_location: randomBoolean() ? `${randomItem(cities)} - ${randomNumber(1, 50)} acres` : '',
      applicant_working_company_name_location: `${randomItem(companies)}, ${randomItem(cities)}`,
      vehicle_details: randomItem(vehicleTypes) !== 'none' ? `${randomItem(vehicleTypes)} - ${randomBoolean() ? 'Owned' : 'Financed'}` : 'None',
      house_class_locality: randomItem(houseClasses),
      house_interior: randomItem(houseInteriors),
      house_interior_other: '',
      living_standard: randomItem(livingStandards),
      living_standard_other: '',
      exterior_of_house: `${randomNumber(2, 4)} BHK, ${randomNumber(1, 3)} floor, ${randomItem(['White', 'Beige', 'Yellow', 'Blue'])} color`,
      remark: `Verified residence. ${randomBoolean() ? 'All documents verified.' : 'Some documents pending.'}`,
      neighbour_1_details: `Neighbour 1: ${randomItem(firstNames)} ${randomItem(lastNames)}, ${randomNumber(20, 60)} years, ${randomItem(['Known for 5 years', 'Known for 10 years', 'Recently moved'])}`,
      neighbour_1_remark: randomBoolean() ? 'Positive feedback' : 'Neutral feedback',
      neighbour_2_details: `Neighbour 2: ${randomItem(firstNames)} ${randomItem(lastNames)}, ${randomNumber(25, 65)} years, ${randomItem(['Known for 3 years', 'Known for 8 years', 'Long time neighbour'])}`,
      neighbour_2_remark: randomBoolean() ? 'Good neighbour' : 'Average',
    },
    case_status: randomBoolean() ? 'positive' : 'negative',
    rejection_reason: '',
    rejection_reason_other: '',
    additional_remark: 'Case verification completed successfully.',
    locationPictures: [],
    photo_source: '',
  };
};

/**
 * Generate random test data for BV (Business Verification) case
 * @param {string} businessType - 'self_employed' or 'service'
 * @returns {Object} Form data object with random values
 */
export const generateBVTestData = (businessType = null) => {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const selectedType = businessType || (randomBoolean() ? 'self_employed' : 'service');
  
  const baseData = {
    met_person_name: `${firstName} ${lastName}`,
    relation: randomItem(['self', 'partner', 'employee', 'manager']),
    type_of_business: selectedType,
    neighbour_1_details: `Business Neighbour 1: ${randomItem(['Shop', 'Office', 'Warehouse'])} - ${randomItem(firstNames)} ${randomItem(lastNames)}`,
    neighbour_1_remark: randomBoolean() ? 'Active business' : 'Regular operations',
    neighbour_2_details: `Business Neighbour 2: ${randomItem(['Store', 'Factory', 'Showroom'])} - ${randomItem(firstNames)} ${randomItem(lastNames)}`,
    neighbour_2_remark: randomBoolean() ? 'Good location' : 'Average area',
    signboard_seen_with_name: randomItem(idProofTypes),
    case_status: randomBoolean() ? 'positive' : 'negative',
    rejection_reason: '',
    rejection_reason_other: '',
    additional_remark: 'Business verification completed.',
    locationPictures: [],
    photo_source: '',
  };

  if (selectedType === 'self_employed') {
    baseData.self_employed = {
      id_proof_seen: randomItem(idProofTypes),
      applicant_is: randomItem(['owner', 'partner', 'director', 'proprietor', 'other']),
      applicant_is_other: '',
      nature_of_business: randomItem(businessTypes),
      nature_of_business_other: '',
      office_ownership: randomItem(ownershipTypes),
      stability: randomItem(stabilityOptions),
      stability_other: '',
      stocks: randomBoolean() ? `Stock value: ₹${randomNumber(50000, 500000)}` : 'No visible stock',
      gst_bill_visiting_card_seen: randomBoolean() ? 'Yes, GST number verified' : 'No',
      business_activity_level_seen: randomItem(businessActivityLevels),
      employee_seen: randomItem(employeeCounts),
      applicant_current_account_with_bank: `${randomItem(['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak'])} Bank, ${randomItem(cities)}`,
      applicant_has_vehicle: randomItem(vehicleTypes) !== 'none' ? `${randomItem(vehicleTypes)} - ${randomBoolean() ? 'Owned' : 'Financed'}` : 'None',
      exterior_off_floor: `${randomNumber(1, 5)} floor, ${randomItem(['Good condition', 'Average', 'Needs maintenance'])}`,
      remark: `Business verified. ${randomBoolean() ? 'All documents in order.' : 'Some documents pending verification.'}`,
    };
  } else {
    baseData.service = {
      working_since: `${randomNumber(1, 15)} years`,
      designation: randomItem(designations),
      department_room_number: `${randomItem(departments)} - Room ${randomNumber(101, 999)}`,
      employee_code: `EMP${randomNumber(1000, 9999)}`,
      company_nature_of_business: randomItem(businessTypes),
      drawing_salary_per_month: `₹${randomNumber(20000, 100000)}`,
      id_proof_seen: randomItem(idProofTypes),
      employee_seen: randomItem(idProofTypes),
      exterior_off_floor: `${randomNumber(1, 10)} floor, ${randomItem(['Corporate building', 'Office complex', 'Business park'])}`,
      remark: `Employee verification completed. ${randomBoolean() ? 'All details verified.' : 'Pending some documents.'}`,
    };
  }

  return baseData;
};

/**
 * Generate random test data based on case type
 * @param {string} caseType - 'rv' or 'bv'
 * @param {string} businessType - Optional: 'self_employed' or 'service' for BV cases
 * @returns {Object} Form data object with random values
 */
export const generateTestData = (caseType = 'bv', businessType = null) => {
  if (caseType === 'rv') {
    return generateRVTestData();
  } else {
    return generateBVTestData(businessType);
  }
};
