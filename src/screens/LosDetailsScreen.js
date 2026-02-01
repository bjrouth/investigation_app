import React, { useState } from 'react';
import { Alert, Image, Modal, Platform, PermissionsAndroid, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Portal, RadioButton, Text, TextInput } from 'react-native-paper';
import AppLayout from '../components/AppLayout';
import AppHeader from '../components/AppHeader';
import { AppTheme } from '../theme/theme';
import authService from '../services/authService';
import { fetchLosDetails } from '../services/losService';
import RNFS from 'react-native-fs';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const normalizeLosDetails = (payload, fallbackCaseType) => {
  const formattedEntry = Array.isArray(payload?.formated_data) ? payload.formated_data[0] : null;
  const detail =
    formattedEntry?.case_details ||
    payload?.data ||
    payload?.details ||
    payload?.detail ||
    payload ||
    {};
  const files =
    formattedEntry?.files ||
    detail?.files ||
    detail?.images ||
    detail?.los_files ||
    payload?.files ||
    payload?.images ||
    [];

  const normalizedImages = Array.isArray(files)
    ? files
        .map((file) => {
          if (!file) return null;
          if (typeof file === 'string') return { uri: file };
          return {
            uri: file.s3_url || file.url || file.path || file.uri,
            fileSize: file.file_size || file.size,
          };
        })
        .filter((img) => img?.uri)
    : [];

  return {
    bankName: detail.bank_name || detail.bankName || '',
    productName: detail.product_name || detail.productName || '',
    losNumber: detail.los_number || detail.losno || detail.losNumber || formattedEntry?.los_no || '',
    applicantName: detail.applicant_name || detail.applicantName || '',
    latitude: detail.latitude || '',
    longitude: detail.longitude || '',
    caseType: detail.case_type || fallbackCaseType || '',
    note: detail.note || '',
    images: normalizedImages,
  };
};

export default function LosDetailsScreen({ navigation }) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchLosNumber, setSearchLosNumber] = useState('');
  const [searchCaseType, setSearchCaseType] = useState('RV');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    bankName: '',
    productName: '',
    losNumber: '',
    applicantName: '',
    latitude: '',
    longitude: '',
    caseType: '',
    note: '',
    images: [],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const handleFetchDetails = async () => {
    if (!searchLosNumber.trim()) {
      Alert.alert('Missing LOS Number', 'Please enter LOS Number.');
      return;
    }

    setLoading(true);
    try {
      const caseTypeValue = searchCaseType === 'RV' ? '1' : '0';
      const result = await fetchLosDetails({
        losno: searchLosNumber.trim(),
        caseType: caseTypeValue,
      });

      if (!result.success || result.data?.status === 0) {
        const errorMsg =
          result?.error ||
          result?.data?.message ||
          result?.data?.error ||
          'Failed to fetch LOS details';
        Alert.alert('Error', errorMsg);
        return;
      }

      const normalized = normalizeLosDetails(result.data, searchCaseType);
      setDetails(normalized);
      setSearchVisible(false);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to fetch LOS details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGallery = (image) => {
    if (!details.images.length) {
      Alert.alert('No Images', 'No images available for this case.');
      return;
    }
    const targetImage = image || details.images[0];
    setSelectedImage(targetImage);
    setImageModalVisible(true);
  };

  const handleDownloadImages = () => {
    const downloadAll = async () => {
      if (!details.images.length) {
        Alert.alert('No Images', 'No images available to download.');
        return;
      }

      if (Platform.OS === 'android' && Platform.Version < 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission required', 'Storage permission is needed to download images.');
          return;
        }
      }

      const baseDir = Platform.OS === 'android'
        ? RNFS.PicturesDirectoryPath
        : RNFS.DocumentDirectoryPath;
      const targetDir = `${baseDir}/InvestigationApp`;
      await RNFS.mkdir(targetDir);

      const downloads = details.images.map((img, index) => {
        const ext = img?.uri?.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `los_${details.losNumber || 'case'}_${index + 1}.${ext}`;
        const toFile = `${targetDir}/${fileName}`;
        return RNFS.downloadFile({ fromUrl: img.uri, toFile }).promise;
      });

      await Promise.all(downloads);
      Alert.alert('Download complete', `Saved ${details.images.length} images to ${targetDir}`);
    };

    downloadAll().catch((error) => {
      console.error('Download images error:', error);
      Alert.alert('Error', 'Failed to download images.');
    });
  };

  const handleSearchNewCase = () => {
    setSearchLosNumber('');
    setSearchCaseType('RV');
    setSearchVisible(true);
  };

  return (
    <AppLayout>
      <AppHeader title="LOS Details" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Name :</Text>
            <Text style={styles.value}>{details.bankName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Product Name :</Text>
            <Text style={styles.value}>{details.productName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>LOS Number :</Text>
            <Text style={styles.value}>{details.losNumber || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Applicant Name :</Text>
            <Text style={styles.value}>{details.applicantName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Latitude :</Text>
            <Text style={styles.value}>{details.latitude || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Longitude :</Text>
            <Text style={styles.value}>{details.longitude || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Case Type :</Text>
            <Text style={styles.value}>{details.caseType || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Note :</Text>
            <Text style={styles.value}>{details.note || '-'}</Text>
          </View>
        </View>

        {/* <View style={styles.galleryHeader}>
          <Text style={styles.galleryLabel}>Case Images.</Text>
          <TouchableOpacity onPress={handleOpenGallery}>
            <Text style={styles.galleryLink}>Click Here For Gallery View</Text>
          </TouchableOpacity>
        </View> */}

        {details.images.length > 0 ? (
          <View style={styles.imagesGrid}>
            {details.images.map((img, index) => (
              <TouchableOpacity
                key={`${img.uri}-${index}`}
                activeOpacity={0.8}
                onPress={() => handleOpenGallery(img)}
                style={styles.imageWrapper}
              >
                <Image source={{ uri: img.uri }} style={styles.gridImage} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyImage}>
            <Text style={styles.emptyImageText}>No image available</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={handleDownloadImages}
            style={styles.actionButton}
            buttonColor={AppTheme.colors.primary}
            textColor={AppTheme.colors.surface}
            icon="download"
          >
            DOWNLOAD IMAGES
          </Button>
          <Button
            mode="contained"
            onPress={handleSearchNewCase}
            style={styles.actionButton}
            buttonColor={AppTheme.colors.primary}
            textColor={AppTheme.colors.surface}
            icon="magnify"
          >
            SEARCH NEW CASE
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={AppTheme.colors.primary}
          textColor={AppTheme.colors.surface}
          icon="logout"
        >
          Logout
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={searchVisible} onDismiss={() => setSearchVisible(false)}>
          <Dialog.Title>Enter LOS Number</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              value={searchLosNumber}
              onChangeText={setSearchLosNumber}
              style={styles.dialogInput}
              contentStyle={styles.dialogInputContent}
              placeholder="Los Number"
              dense
            />
            <View style={styles.dialogRadioRow}>
              <RadioButton.Group onValueChange={setSearchCaseType} value={searchCaseType}>
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
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSearchVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleFetchDetails}
              loading={loading}
              disabled={loading}
              buttonColor={AppTheme.colors.primary}
              textColor={AppTheme.colors.surface}
            >
              FETCH DETAILS
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Modal visible={imageModalVisible} transparent animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setImageModalVisible(false)} />
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setImageModalVisible(false)}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            {selectedImage ? (
              <>
                <Image source={{ uri: selectedImage.uri }} style={styles.modalImage} resizeMode="contain" />
                {selectedImage.fileSize ? (
                  <Text style={styles.modalImageMeta}>Size: {formatFileSize(selectedImage.fileSize)}</Text>
                ) : null}
              </>
            ) : null}
          </View>
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
  },
  card: {
    backgroundColor: '#d9d9d9',
    borderRadius: 8,
    padding: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.xs,
  },
  label: {
    width: 120,
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    fontWeight: '600',
  },
  value: {
    flex: 1,
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.onSurface,
    paddingBottom: 2,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  galleryLabel: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
    marginRight: 4,
  },
  galleryLink: {
    fontSize: AppTheme.typography.body.fontSize,
    color: '#1e5bd8',
    textDecorationLine: 'underline',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppTheme.spacing.xs,
  },
  imageWrapper: {
    width: '48%',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: AppTheme.colors.surfaceVariant,
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  emptyImage: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: AppTheme.colors.surfaceVariant,
  },
  emptyImageText: {
    color: AppTheme.colors.onSurfaceVariant,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: AppTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: AppTheme.spacing.xs,
  },
  logoutButton: {
    marginTop: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.xs,
    borderRadius: AppTheme.roundness * 2,
  },
  dialogInput: {
    backgroundColor: AppTheme.colors.surface,
    marginBottom: AppTheme.spacing.sm,
  },
  dialogInputContent: {
    fontSize: AppTheme.typography.body.fontSize,
  },
  dialogRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: AppTheme.spacing.md,
  },
  radioLabel: {
    fontSize: AppTheme.typography.body.fontSize,
    color: AppTheme.colors.onSurface,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppTheme.spacing.md,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 8,
    padding: AppTheme.spacing.sm,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  modalCloseText: {
    fontSize: 28,
    color: AppTheme.colors.onSurface,
    lineHeight: 28,
  },
  modalImage: {
    width: '100%',
    height: 360,
  },
  modalImageMeta: {
    marginTop: AppTheme.spacing.xs,
    color: AppTheme.colors.onSurfaceVariant,
  },
});
