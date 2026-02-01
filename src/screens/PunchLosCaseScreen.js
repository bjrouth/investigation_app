import React, { useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Menu, RadioButton, Text, TextInput } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import { confirmDeleteImage, getCurrentLocation, pickImageFromGallery, takePhotoWithGeoAndCompression } from '../utils/locationHelpers';
import { submitLosDetails, uploadLosFiles } from '../services/losService';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function PunchLosCaseScreen({ navigation }) {
  const [bankName, setBankName] = useState('');
  const [productName, setProductName] = useState('');
  const [losNumber, setLosNumber] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [caseType, setCaseType] = useState('RV');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [imageSourceMenuVisible, setImageSourceMenuVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleSubmit = async () => {
    if (!bankName.trim() || !productName.trim() || !losNumber.trim() || !applicantName.trim()) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const geoImage = images.find((img) => img?.latitude && img?.longitude);
      let latitude = geoImage?.latitude;
      let longitude = geoImage?.longitude;

      if (!latitude || !longitude) {
        const location = await getCurrentLocation(8000);
        latitude = location?.latitude;
        longitude = location?.longitude;
      }

      if (!latitude || !longitude) {
        Alert.alert('Location Required', 'Unable to get current location. Please try again.');
        return;
      }

      const caseTypeValue = caseType === 'RV' ? '1' : '0';
      const result = await submitLosDetails({
        losno: losNumber.trim(),
        bankName: bankName.trim(),
        productName: productName.trim(),
        applicantName: applicantName.trim(),
        latitude,
        longitude,
        caseType: caseTypeValue,
        note: note.trim(),
      });

      if (!result.success || result.data?.status === 0) {
        const errorMsg =
          result?.error ||
          result?.data?.message ||
          result?.data?.error ||
          'Failed to submit LOS details';
        Alert.alert('Error', errorMsg);
        return;
      }

      const losDetailId = result?.data?.los_detail_id;
      if (images.length > 0) {
        const uploadResult = await uploadLosFiles({
          losno: losNumber.trim(),
          losDetailId,
          files: images,
        });

        if (!uploadResult.success || uploadResult.data?.status === 0) {
          const uploadError =
            uploadResult?.error ||
            uploadResult?.data?.message ||
            uploadResult?.data?.error ||
            'Failed to upload files';
          Alert.alert('Error', uploadError);
          return;
        }
      }

      Alert.alert('Success', 'LOS details submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to submit LOS details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddImage = () => {
    setImageSourceMenuVisible(true);
  };

  return (
    <AppLayout>
      <AppHeader title="PUNCH LOS Case" back navigation={navigation} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          <View style={styles.row}>
          <Text style={styles.label}>Bank Name :</Text>
          <TextInput
            mode="outlined"
            value={bankName}
            onChangeText={setBankName}
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Bank Name"
            dense
          />
        </View>

          <View style={styles.row}>
          <Text style={styles.label}>Product Name :</Text>
          <TextInput
            mode="outlined"
            value={productName}
            onChangeText={setProductName}
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Product Name"
            dense
          />
        </View>

          <View style={styles.row}>
          <Text style={styles.label}>LOS Number :</Text>
          <TextInput
            mode="outlined"
            value={losNumber}
            onChangeText={setLosNumber}
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Los Number"
            dense
          />
        </View>

          <View style={styles.row}>
          <Text style={styles.label}>Applicant Name :</Text>
          <TextInput
            mode="outlined"
            value={applicantName}
            onChangeText={setApplicantName}
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Applicant Name"
            dense
          />
        </View>

          <View style={styles.row}>
          <Text style={styles.caseTypeLabel}>Case Type :</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group onValueChange={setCaseType} value={caseType}>
              <View style={styles.radioOption}>
                <RadioButton value="RV" color={AppTheme.colors.primary} />
                <Text style={styles.radioLabel}>RV</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="BV" color={AppTheme.colors.primary} />
                <Text style={styles.radioLabel}>BV</Text>
              </View>
            </RadioButton.Group>
          </View>
        </View>

          <View style={styles.row}>
          <Text style={styles.label}>Note :</Text>
          <TextInput
            mode="outlined"
            value={note}
            onChangeText={setNote}
            style={styles.input}
            contentStyle={styles.inputContent}
            placeholder="Note"
            multiline
            numberOfLines={3}
            dense
          />
        </View>

          {images.length > 0 ? (
            <View style={styles.compactImagesContainer}>
              {images.map((img, index) => (
                <View key={`${img.uri}-${index}`} style={styles.compactImageWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedImage(img);
                      setImageModalVisible(true);
                    }}
                    style={styles.compactImageTouchable}
                  >
                    <Image source={{ uri: img.uri }} style={styles.compactImageThumbnail} resizeMode="cover" />
                    <View style={styles.compactImageOverlay}>
                      <IconButton icon="eye" size={20} iconColor={AppTheme.colors.surface} style={styles.viewIcon} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.compactDeleteButton}
                    onPress={() => {
                      confirmDeleteImage(() => {
                        const newPics = images.filter((_, i) => i !== index);
                        setImages(newPics);
                      });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <IconButton icon="close-circle" size={20} iconColor={AppTheme.colors.error} style={styles.compactDeleteIcon} />
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
          ) : null}
        </View>

        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.actionButton}
            buttonColor={AppTheme.colors.primary}
            textColor={AppTheme.colors.surface}
            icon="content-save"
            loading={submitting}
            disabled={submitting}
          >
            SUBMIT
          </Button>
          <Menu
            visible={imageSourceMenuVisible}
            onDismiss={() => setImageSourceMenuVisible(false)}
            anchor={
              <Button
                mode="contained"
                onPress={handleAddImage}
                style={styles.actionButton}
                buttonColor={AppTheme.colors.primary}
                textColor={AppTheme.colors.surface}
                icon="plus"
              >
                IMAGE
              </Button>
            }
          >
            <Menu.Item
              onPress={async () => {
                setImageSourceMenuVisible(false);
                try {
                  const imageData = await takePhotoWithGeoAndCompression();
                  if (imageData) {
                    setImages((prev) => [...prev, imageData]);
                  }
                } catch (error) {
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
                  const imageData = await pickImageFromGallery();
                  if (imageData) {
                    setImages((prev) => [...prev, imageData]);
                  }
                } catch (error) {
                  Alert.alert('Error', error.message || 'Failed to pick image');
                }
              }}
              title="Gallery"
              leadingIcon="image"
            />
          </Menu>
        </View>
      </ScrollView>

      <Modal
        visible={imageModalVisible}
        transparent
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
              <Image source={{ uri: selectedImage.uri }} style={styles.modalImage} resizeMode="contain" />
              <View style={styles.modalImageInfo}>
                {selectedImage.address && selectedImage.address !== 'Gallery image' && (
                  <>
                    <View style={styles.modalImageInfoRow}>
                      <IconButton icon="map-marker" size={16} iconColor={AppTheme.colors.surface} style={styles.modalInfoIcon} />
                      <Text style={styles.modalImageInfoText}>{selectedImage.address}</Text>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: AppTheme.spacing.s,
    paddingBottom: AppTheme.spacing.xl,
    flexGrow: 1,
  },
  formContainer: {
    flexGrow: 1,
  },
  versionText: {
    textAlign: 'center',
    color: AppTheme.colors.onSurfaceVariant,
    fontSize: AppTheme.typography.body.fontSize,
    marginBottom: AppTheme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  label: {
    width: 110,
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
  },
  caseTypeLabel: {
    width: 90,
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
  },
  input: {
    flex: 1,
    backgroundColor: AppTheme.colors.surface,
    marginBottom: AppTheme.spacing.xs,
  },
  inputContent: {
    fontSize: AppTheme.typography.body.fontSize,
  },
  radioGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    flexShrink: 1,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: AppTheme.spacing.sm,
  },
  radioLabel: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: AppTheme.spacing.lg,
  },
  compactImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: AppTheme.spacing.xs,
    gap: AppTheme.spacing.xs,
    paddingLeft: 110,
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
  actionButton: {
    flex: 1,
    marginHorizontal: AppTheme.spacing.xs,
  },
});
