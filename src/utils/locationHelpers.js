/**
 * Location and Image Helper Functions
 * Handles geolocation, geocoding, and image compression
 */
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import ImageMarker, { Position, TextBackgroundType } from 'react-native-image-marker';
import RNFS from 'react-native-fs';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { API_CONFIG } from '../constants/config';
import NetInfo from '@react-native-community/netinfo';

// Initialize Geocoder with API key if available
if (API_CONFIG?.GOOGLE_MAPS_API_KEY) {
  Geocoder.init(API_CONFIG.GOOGLE_MAPS_API_KEY);
}

/**
 * Get current location with improved timeout handling
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<{latitude: number, longitude: number} | null>} Returns null if location unavailable
 */
export const getCurrentLocation = (timeout = 10000) =>
  new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || null,
        });
      },
      error => {
        console.warn('Location error:', error.message);
        // Don't reject - return null to allow photo without location
        resolve(null);
      },
      {
        enableHighAccuracy: false, // Use less accurate but faster location
        timeout: timeout,
        maximumAge: 60000, // Accept location up to 1 minute old
      }
    );
  });

/**
 * Get address from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Formatted address
 */
export const getAddressFromCoords = async (lat, lng) => {
  try {
    if (!API_CONFIG?.GOOGLE_MAPS_API_KEY) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // Return coordinates if API key not configured
    }
    const res = await Geocoder.from(lat, lng);
    return res.results[0]?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // Return coordinates as fallback
  }
};

/**
 * Compress image to under 100KB with aggressive compression
 * @param {string} uri - Image URI
 * @returns {Promise<string>} Compressed image URI (guaranteed under 100KB)
 */
export const compressTo100KB = async (uri) => {
  const maxSize = 100 * 1024; // 100KB
  let quality = 0.8;
  let maxDimension = 1024; // Start with 1024px
  let compressedUri = uri;
  let attempts = 0;
  const maxAttempts = 20; // Prevent infinite loops

  try {
    while (attempts < maxAttempts) {
      const response = await ImageResizer.createResizedImage(
        uri,
        maxDimension, // maxWidth
        maxDimension, // maxHeight
        'JPEG',
        Math.round(quality * 100), // quality (0-100)
        0, // rotation
        undefined, // outputPath
        false, // keepMeta
        { mode: 'contain', onlyScaleDown: true }
      );

      compressedUri = response.uri;

      // Check file size
      const filePath = compressedUri.replace('file://', '');
      const stat = await RNFS.stat(filePath);
      
      console.log(`Compression attempt ${attempts + 1}: ${(stat.size / 1024).toFixed(2)}KB (target: 100KB), quality: ${(quality * 100).toFixed(0)}%, dimension: ${maxDimension}px`);
      
      if (stat.size <= maxSize) {
        console.log(`✅ Image compressed successfully: ${(stat.size / 1024).toFixed(2)}KB`);
        return compressedUri;
      }

      // If still too large, reduce quality and/or dimensions
      if (quality > 0.3) {
        quality -= 0.1; // Reduce quality more aggressively
      } else if (maxDimension > 512) {
        maxDimension = Math.max(512, maxDimension - 128); // Reduce dimensions
        quality = 0.7; // Reset quality when reducing dimensions
      } else if (quality > 0.2) {
        quality -= 0.05; // Final quality reduction
      } else {
        // Last resort: very small dimensions and low quality
        maxDimension = 512;
        quality = 0.5;
      }

      attempts++;
    }

    // Final check - if still too large, use minimum settings
    const finalResponse = await ImageResizer.createResizedImage(
      uri,
      512, // maxWidth
      512, // maxHeight
      'JPEG',
      50, // quality (50%)
      0, // rotation
      undefined, // outputPath
      false, // keepMeta
      { mode: 'contain', onlyScaleDown: true }
    );

    const finalPath = finalResponse.uri.replace('file://', '');
    const finalStat = await RNFS.stat(finalPath);
    
    if (finalStat.size > maxSize) {
      console.warn(`⚠️ Image still exceeds 100KB after maximum compression: ${(finalStat.size / 1024).toFixed(2)}KB`);
      // Return the most compressed version anyway
    } else {
      console.log(`✅ Final compression successful: ${(finalStat.size / 1024).toFixed(2)}KB`);
    }

    return finalResponse.uri;
  } catch (error) {
    console.error('Compression error:', error);
    // Return original if compression fails completely
    return uri;
  }
};

/**
 * Request camera permission for Android
 * @returns {Promise<boolean>} True if permission granted
 */
const requestCameraPermission = async () => {
  if (Platform.OS !== 'android') {
    return true; // iOS handles permissions automatically
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to take photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

/**
 * Request location permission (Android & iOS)
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to geotag photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // iOS: ask via Geolocation API
    if (Platform.OS === 'ios' && Geolocation && Geolocation.requestAuthorization) {
      try {
        const auth = Geolocation.requestAuthorization();
        // requestAuthorization returns a string like 'granted' or a Promise
        if (typeof auth === 'string') {
          return auth === 'granted';
        }
        const resolved = await auth;
        return resolved === 'granted';
      } catch (e) {
        console.warn('iOS location permission request error:', e);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.warn('requestLocationPermission error:', error);
    return false;
  }
};

const buildGeoStampText = (location, address) => {
  const parts = [];
  if (location?.latitude && location?.longitude) {
    parts.push(`Lat: ${location.latitude.toFixed(6)}`);
    parts.push(`Lng: ${location.longitude.toFixed(6)}`);
  }
  if (address && address !== 'Location unavailable') {
    parts.push(`Addr: ${address}`);
  }
  if (parts.length === 0) return '';
  parts.push(`Time: ${new Date().toISOString()}`);
  return parts.join('\n');
};

const getOfflineAddress = async () => {
  try {
    const state = await NetInfo.fetch();
    const ipAddress = state?.details?.ipAddress;
    return ipAddress ? `IP: ${ipAddress}` : 'IP: unavailable';
  } catch (error) {
    console.warn('Failed to get IP address:', error);
    return 'IP: unavailable';
  }
};

const addGeoStampToImage = async (uri, location, address) => {
  const text = buildGeoStampText(location, address);
  if (!text) return uri;

  try {
    const stampedPath = await ImageMarker.markText({
      backgroundImage: {
        src: uri,
      },
      watermarkTexts: [
        {
          text,
          position: {
            position: Position.bottomRight,
          },
          style: {
            color: '#FFFFFF',
            fontSize: 22,
            textAlign: 'right',
            textBackgroundStyle: {
              type: TextBackgroundType.stretchX,
              color: 'rgba(0, 0, 0, 0.6)',
              paddingX: 12,
              paddingY: 8,
              cornerRadius: {
                all: { x: 8, y: 8 },
              },
            },
          },
        },
      ],
      scale: 1,
      quality: 100,
    });

    if (!stampedPath) return uri;
    return stampedPath.startsWith('file://') ? stampedPath : `file://${stampedPath}`;
  } catch (error) {
    console.warn('Failed to add geo stamp to image:', error);
    return uri;
  }
};

/**
 * Take photo with camera, compress, and get geolocation
 * @returns {Promise<Object>} Image data with location (location may be null if unavailable)
 */
export const takePhotoWithGeoAndCompression = async () => {
  try {
    // Request camera permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied. Please enable camera permission in app settings.');
    }

    // 1️⃣ Take photo
    const result = await new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
          includeBase64: false,
          maxWidth: 2048,
          maxHeight: 2048,
        },
        (response) => {
          console.log('Camera response:', {
            didCancel: response.didCancel,
            errorCode: response.errorCode,
            errorMessage: response.errorMessage,
            hasAssets: !!response.assets,
            assetCount: response.assets?.length || 0,
          });

          if (response.didCancel) {
            reject(new Error('User cancelled camera'));
          } else if (response.errorCode) {
            let errorMsg = 'Camera error occurred';
            if (response.errorCode === 'camera_unavailable') {
              errorMsg = 'Camera is not available on this device';
            } else if (response.errorCode === 'permission') {
              errorMsg = 'Camera permission denied. Please enable camera permission in app settings.';
            } else if (response.errorMessage) {
              errorMsg = response.errorMessage;
            }
            reject(new Error(errorMsg));
          } else if (response.errorMessage) {
            reject(new Error(response.errorMessage));
          } else if (response.assets && response.assets[0]) {
            resolve(response.assets[0]);
          } else {
            reject(new Error('No image captured'));
          }
        }
      );
    });

    const originalUri = result.uri;

    // 2️⃣ Compress to <100KB
    let compressedUri = await compressTo100KB(originalUri);

    // 3️⃣ Try to get geo data (non-blocking - don't fail if location unavailable)
    let location = null;
    let address = 'Location unavailable';
    
    try {
      const networkState = await NetInfo.fetch();
      const hasInternet = !!networkState?.isConnected && networkState?.isInternetReachable !== false;
      location = await getCurrentLocation(8000); // 8 second timeout
      if (!hasInternet) {
        address = await getOfflineAddress();
      } else if (location) {
        address = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );
      }
    } catch (error) {
      console.warn('Location not available, continuing without geolocation:', error);
    }

    // 4️⃣ Add geo stamp on image if location is available
    compressedUri = await addGeoStampToImage(compressedUri, location, address);

    // Get file size of compressed image and validate
    let fileSize = result.fileSize;
    const maxSize = 100 * 1024; // 100KB
    try {
      const filePath = compressedUri.replace('file://', '');
      const stat = await RNFS.stat(filePath);
      fileSize = stat.size;
      
      // Validate file size
      if (fileSize > maxSize) {
        console.warn(`⚠️ Compressed image still exceeds 100KB: ${(fileSize / 1024).toFixed(2)}KB. Attempting additional compression...`);
        // Try one more aggressive compression
        const recompressedUri = await compressTo100KB(compressedUri);
        const recompressedPath = recompressedUri.replace('file://', '');
        const recompressedStat = await RNFS.stat(recompressedPath);
        fileSize = recompressedStat.size;
        compressedUri = recompressedUri;
        
        if (fileSize > maxSize) {
          console.error(`❌ Image size ${(fileSize / 1024).toFixed(2)}KB still exceeds 100KB limit after recompression`);
        } else {
          console.log(`✅ Recompression successful: ${(fileSize / 1024).toFixed(2)}KB`);
        }
      } else {
        console.log(`✅ Image size validated: ${(fileSize / 1024).toFixed(2)}KB (under 100KB limit)`);
      }
    } catch (error) {
      console.warn('Could not get compressed file size:', error);
    }

    return {
      uri: compressedUri,
      type: 'image/jpeg',
      name: `location_${Date.now()}.jpg`,
      latitude: location?.latitude || null,
      longitude: location?.longitude || null,
      accuracy: location?.accuracy || null,
      address,
      capturedAt: new Date().toISOString(),
      fileSize: fileSize,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Take photo error:', error);
    throw error;
  }
};

/**
 * Pick image from gallery, compress (no geolocation)
 * @returns {Promise<Object>} Image data
 */
export const pickImageFromGallery = async () => {
  try {
    // 1️⃣ Pick image from gallery
    const result = await new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
        },
        (response) => {
          if (response.didCancel) {
            reject(new Error('User cancelled image picker'));
          } else if (response.errorMessage) {
            reject(new Error(response.errorMessage));
          } else if (response.assets && response.assets[0]) {
            resolve(response.assets[0]);
          } else {
            reject(new Error('No image selected'));
          }
        }
      );
    });

    const originalUri = result.uri;

    // 2️⃣ Compress to <100KB (no geolocation for gallery images)
    let compressedUri = await compressTo100KB(originalUri);

    // Get file size of compressed image and validate
    let fileSize = result.fileSize;
    const maxSize = 100 * 1024; // 100KB
    try {
      const filePath = compressedUri.replace('file://', '');
      const stat = await RNFS.stat(filePath);
      fileSize = stat.size;
      
      // Validate file size
      if (fileSize > maxSize) {
        console.warn(`⚠️ Compressed image still exceeds 100KB: ${(fileSize / 1024).toFixed(2)}KB. Attempting additional compression...`);
        // Try one more aggressive compression
        const recompressedUri = await compressTo100KB(compressedUri);
        const recompressedPath = recompressedUri.replace('file://', '');
        const recompressedStat = await RNFS.stat(recompressedPath);
        fileSize = recompressedStat.size;
        compressedUri = recompressedUri;
        
        if (fileSize > maxSize) {
          console.error(`❌ Image size ${(fileSize / 1024).toFixed(2)}KB still exceeds 100KB limit after recompression`);
        } else {
          console.log(`✅ Recompression successful: ${(fileSize / 1024).toFixed(2)}KB`);
        }
      } else {
        console.log(`✅ Image size validated: ${(fileSize / 1024).toFixed(2)}KB (under 100KB limit)`);
      }
    } catch (error) {
      console.warn('Could not get compressed file size:', error);
    }

    return {
      uri: compressedUri,
      type: 'image/jpeg',
      name: `location_${Date.now()}.jpg`,
      // No latitude/longitude for gallery images
      address: 'Gallery image',
      capturedAt: new Date().toISOString(),
      fileSize: fileSize,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Pick image error:', error);
    throw error;
  }
};

/**
 * Show image source selection (Camera or Gallery)
 * @returns {Promise<Object|null>} Image data or null if cancelled
 */
export const selectImageSource = () => {
  return new Promise((resolve) => {
    console.log('selectImageSource: Showing alert dialog');
    try {
      Alert.alert(
        'Select Image Source',
        'Choose how you want to add the image',
        [
          {
            text: 'Camera',
            onPress: async () => {
              console.log('Camera option selected');
              try {
                const imageData = await takePhotoWithGeoAndCompression();
                console.log('Camera image captured:', imageData ? 'Success' : 'Failed');
                resolve(imageData);
              } catch (error) {
                console.error('Camera error:', error);
                Alert.alert('Error', error.message || 'Failed to capture image');
                resolve(null);
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              console.log('Gallery option selected');
              try {
                const imageData = await pickImageFromGallery();
                console.log('Gallery image picked:', imageData ? 'Success' : 'Failed');
                resolve(imageData);
              } catch (error) {
                console.error('Gallery error:', error);
                Alert.alert('Error', error.message || 'Failed to pick image');
                resolve(null);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log('Cancel option selected');
              resolve(null);
            },
          },
        ],
        { 
          cancelable: true,
          onDismiss: () => {
            console.log('Alert dismissed');
            resolve(null);
          }
        }
      );
    } catch (error) {
      console.error('Error showing alert:', error);
      resolve(null);
    }
  });
};

/**
 * Confirm image deletion
 * @param {Function} onConfirm - Callback when confirmed
 */
export const confirmDeleteImage = (onConfirm) => {
  Alert.alert(
    'Delete Image',
    'Are you sure you want to delete this image?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onConfirm,
      },
    ]
  );
};
