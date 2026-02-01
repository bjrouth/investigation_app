import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const getDeviceImeiList = async () => {
  try {
    if (Platform.OS === 'android' && typeof DeviceInfo.getImei === 'function') {
      const imeiList = await DeviceInfo.getImei();
      console.log('imeiList', imeiList);
      if (Array.isArray(imeiList) && imeiList.length > 0) {
        return imeiList.filter(Boolean);
      }
    }

    const uniqueId = await DeviceInfo.getUniqueId();
    return uniqueId ? [uniqueId] : [];
  } catch (error) {
    console.warn('Failed to read device IMEI/ID:', error);
    return [];
  }
};
